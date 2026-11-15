/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

import type { CustomerStorageTarget, ShipFailurePayload, ViewerContext } from './types.js';
import { sanitizeUrl } from './utils.js';

export const EDGE_TIMEOUT_MS = 5000;

export interface EdgeDispatchEnvelope {
  readonly matchId: string;
  readonly teamId?: string;
  readonly operation: ShipFailurePayload['operation'];
  readonly viewer?: Pick<ViewerContext, 'userId' | 'displayName' | 'role'>;
  readonly storage?: CustomerStorageTarget;
  readonly payload: unknown;
  readonly sentAt: string;
}

export type EdgeFailureHandler = (failure: ShipFailurePayload) => void;

const OPERATION_PATHS: Readonly<Record<ShipFailurePayload['operation'], string>> = {
  comment: '/v1/ship/comment',
  reaction: '/v1/ship/reaction',
  form: '/v1/ship/form',
  beacon: '/v1/ship/beacon',
};

export async function forwardToMtchshipEdge(
  rawEndpoint: string | null | undefined,
  envelope: EdgeDispatchEnvelope,
  onFailure: EdgeFailureHandler
): Promise<boolean> {
  const safeBase = sanitizeUrl(rawEndpoint);
  if (!safeBase) {
    onFailure({
      operation: envelope.operation,
      code: 'INVALID_EDGE_ENDPOINT',
      timeoutMs: EDGE_TIMEOUT_MS,
      retryable: false,
    });
    return false;
  }

  const targetUrl = new URL(OPERATION_PATHS[envelope.operation], safeBase).toString();
  let serializedBody: string | null = JSON.stringify(envelope);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: serializedBody,
      cache: 'no-store',
      credentials: 'omit',
      mode: 'cors',
      keepalive: false,
      signal: AbortSignal.timeout(EDGE_TIMEOUT_MS),
    });

    if (!response.ok) {
      onFailure({
        operation: envelope.operation,
        status: response.status,
        code: `HTTP_${response.status}`,
        timeoutMs: EDGE_TIMEOUT_MS,
        retryable: response.status >= 500 || response.status === 429,
      });
      return false;
    }

    return true;
  } catch (err: unknown) {
    const isTimeout = err instanceof DOMException && err.name === 'TimeoutError';
    onFailure({
      operation: envelope.operation,
      code: isTimeout ? 'EDGE_TIMEOUT' : 'NETWORK_ERROR',
      timeoutMs: EDGE_TIMEOUT_MS,
      retryable: true,
    });
    return false;
  } finally {
    serializedBody = null;
  }
}
