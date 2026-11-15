/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

// ---------------------------------------------------------------------------
// 1. Domain & Branded Types (Compile-Time Security Guarantees)
// ---------------------------------------------------------------------------

declare const __brand: unique symbol;
type Brand<T, TBrand extends string> = T & { readonly [__brand]: TBrand };

export type SafeCssColor = Brand<string, 'SafeCssColor'>;
export type SafeHttpUrl = Brand<string, 'SafeHttpUrl'>;

export interface BridgeErrorContext {
  readonly bridge: 'dom' | 'webkit' | 'android' | 'custom';
  readonly eventName: string;
  readonly error: unknown;
}

export interface HostEventOptions {
  readonly onBridgeError?: (context: BridgeErrorContext) => void;
  readonly customTransports?: readonly NativeTransportAdapter[];
}

export interface NativeTransportAdapter {
  readonly name: string;
  send(eventName: string, detail: unknown, serializedEnvelope: string): void;
}

// ---------------------------------------------------------------------------
// 2. Global Environment Augmentation (Zero Runtime Type-Casting)
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    readonly webkit?: {
      readonly messageHandlers?: {
        readonly mtchship?: {
          postMessage?: (message: string) => void;
        };
      };
    };
    readonly MtchshipNative?: {
      postMessage?: (message: string) => void;
      onMatchEvent?: (name: string, payload: string) => void;
    };
  }
}

// ---------------------------------------------------------------------------
// 3. Hardened Sanitization & WCAG Contrast Utilities
// ---------------------------------------------------------------------------

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SHORT_HEX_RE = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/;
const LONG_HEX_RE = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})(?:[0-9a-fA-F]{2})?$/;
const RGB_CAPTURE_RE =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/;

function isValidRgbChannel(value: string | undefined): boolean {
  if (value === undefined) return false;
  const num = Number(value);
  return Number.isInteger(num) && num >= 0 && num <= 255;
}

export function sanitizeColor(
  input: string | undefined,
  fallback: SafeCssColor | string
): SafeCssColor {
  const safeFallback = fallback as SafeCssColor;
  if (!input) return safeFallback;

  const trimmed = input.trim();
  if (HEX_COLOR_RE.test(trimmed)) {
    return trimmed as SafeCssColor;
  }

  const rgbMatch = RGB_CAPTURE_RE.exec(trimmed);
  if (rgbMatch) {
    const [, r, g, b, a] = rgbMatch;
    if (isValidRgbChannel(r) && isValidRgbChannel(g) && isValidRgbChannel(b)) {
      if (a === undefined) return trimmed as SafeCssColor;
      const alpha = Number(a);
      if (Number.isFinite(alpha) && alpha >= 0 && alpha <= 1) {
        return trimmed as SafeCssColor;
      }
    }
  }

  return safeFallback;
}

function parseRgbChannels(color: SafeCssColor): [number, number, number] | null {
  const shortMatch = SHORT_HEX_RE.exec(color);
  if (shortMatch) {
    const [, r, g, b] = shortMatch;
    if (r && g && b) {
      return [parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16)];
    }
  }

  const longMatch = LONG_HEX_RE.exec(color);
  if (longMatch) {
    const [, r, g, b] = longMatch;
    if (r && g && b) {
      return [parseInt(r, 16), parseInt(g, 16), parseInt(b, 16)];
    }
  }

  const rgbMatch = RGB_CAPTURE_RE.exec(color);
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    if (r !== undefined && g !== undefined && b !== undefined) {
      return [Number(r), Number(g), Number(b)];
    }
  }

  return null;
}

export function getContrastTextColor(bgColor: SafeCssColor): SafeCssColor {
  const channels = parseRgbChannels(bgColor);
  if (!channels) return '#ffffff' as SafeCssColor;

  const toLinear = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const [r, g, b] = channels;
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return (luminance > 0.42 ? '#0f172a' : '#ffffff') as SafeCssColor;
}

export interface SanitizeUrlOptions {
  readonly allowedOrigins?: readonly string[];
  readonly allowLocalhost?: boolean;
}

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

export function sanitizeUrl(
  rawUrl: string | null | undefined,
  options?: SanitizeUrlOptions
): SafeHttpUrl | null {
  if (!rawUrl) return null;

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return null;
  }

  if (!options?.allowLocalhost && LOCAL_HOSTNAMES.has(parsed.hostname.toLowerCase())) {
    return null;
  }

  if (options?.allowedOrigins && options.allowedOrigins.length > 0) {
    const isAllowed = options.allowedOrigins.some((origin) => {
      try {
        return new URL(origin).origin === parsed.origin;
      } catch {
        return false;
      }
    });
    if (!isAllowed) return null;
  }

  return parsed.toString() as SafeHttpUrl;
}

// ---------------------------------------------------------------------------
// 4. Deterministic String & Safe DOM Construction
// ---------------------------------------------------------------------------

const DEFAULT_MONOGRAM = 'TM';
const MAX_MONOGRAM_LENGTH = 4;

export function buildMonogram(
  shortName: string | undefined,
  fullName: string | undefined
): string {
  const raw = (shortName?.trim() || fullName?.trim() || '').toUpperCase();
  const normalized = raw.replace(/[^A-Z0-9]/g, '').slice(0, MAX_MONOGRAM_LENGTH);
  return normalized.length > 0 ? normalized : DEFAULT_MONOGRAM;
}

const BLOCKED_ATTR_PREFIX = 'on';
const URI_BEARING_ATTRS = new Set(['href', 'src', 'action', 'formaction', 'data']);

export interface CreateElOptions {
  readonly className?: string;
  readonly text?: string;
  readonly attrs?: Readonly<Record<string, string>>;
}

export function createEl<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: CreateElOptions
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (options?.className) {
    el.className = options.className;
  }

  if (options?.text !== undefined) {
    el.textContent = options.text;
  }

  if (options?.attrs) {
    for (const [rawKey, value] of Object.entries(options.attrs)) {
      const key = rawKey.toLowerCase().trim();

      if (key.startsWith(BLOCKED_ATTR_PREFIX)) {
        throw new Error(`Security violation: Inline event attribute "${rawKey}" is forbidden.`);
      }

      if (URI_BEARING_ATTRS.has(key) && sanitizeUrl(value, { allowLocalhost: true }) === null) {
        throw new Error(`Security violation: Unsafe URI "${value}" for attribute "${rawKey}".`);
      }

      el.setAttribute(rawKey, value);
    }
  }

  return el;
}

// ---------------------------------------------------------------------------
// 5. Resilient, Observable Cross-Platform Event Dispatcher
// ---------------------------------------------------------------------------

export function emitHostEvent<T>(
  host: HTMLElement,
  eventName: string,
  detail: T,
  options?: HostEventOptions
): void {
  const event = new CustomEvent<T>(eventName, {
    detail,
    bubbles: true,
    composed: true,
    cancelable: false,
  });

  host.dispatchEvent(event);

  if (typeof window === 'undefined') return;

  let serializedEnvelope: string | null = null;
  const getEnvelope = (): string => {
    if (serializedEnvelope === null) {
      serializedEnvelope = JSON.stringify({ event: eventName, detail });
    }
    return serializedEnvelope;
  };

  // iOS WKWebView Bridge
  const webkitHandler = window.webkit?.messageHandlers?.mtchship;
  if (webkitHandler && typeof webkitHandler.postMessage === 'function') {
    try {
      webkitHandler.postMessage(getEnvelope());
    } catch (error) {
      options?.onBridgeError?.({ bridge: 'webkit', eventName, error });
    }
  }

  // Android WebView Bridge
  const androidBridge = window.MtchshipNative;
  if (androidBridge) {
    try {
      if (typeof androidBridge.onMatchEvent === 'function') {
        androidBridge.onMatchEvent(eventName, JSON.stringify(detail));
      } else if (typeof androidBridge.postMessage === 'function') {
        androidBridge.postMessage(getEnvelope());
      }
    } catch (error) {
      options?.onBridgeError?.({ bridge: 'android', eventName, error });
    }
  }

  // Extensible Custom Transports (e.g., React Native, Electron, PostMessage)
  if (options?.customTransports) {
    for (const transport of options.customTransports) {
      try {
        transport.send(eventName, detail, getEnvelope());
      } catch (error) {
        options?.onBridgeError?.({ bridge: 'custom', eventName, error });
      }
    }
  }
}
