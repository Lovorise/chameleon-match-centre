/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

export type SurfaceMode = 'auto' | 'light' | 'dark';
export type EngagementMode = 'full' | 'broadcast';
export type GuestMode = 'prompt' | 'readonly' | 'open';
export type ProviderMode = 'external-plugin' | 'mtchship' | 'none';
export type HeaderStyle = 'solid' | 'tinted' | 'minimal';
export type EventAuthorType = 'provider' | 'official' | 'system';
export type MatchCentreTab = 'commentary' | 'lineups' | 'stats' | 'standings' | 'polls';

export interface CustomerStorageTarget {
  readonly driver: 's3' | 'webhook';
  readonly bucket?: string;
  readonly prefix?: string;
  readonly destinationUrl?: string;
}

export interface SportConfig {
  readonly scoreIcon?: string;
  readonly scoringHeading?: string;
  readonly rosterTabLabel?: string;
  readonly reactions?: readonly string[];
}

export interface TeamConfig {
  readonly teamId: string;
  readonly teamName: string;
  readonly teamShort: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly crestUrl?: string | null;
  readonly headerStyle?: HeaderStyle;
  readonly deskLabel?: string;
  readonly allowedEmbedOrigins?: readonly string[];
  readonly sport?: SportConfig;
  readonly locale?: Readonly<Record<string, string>>;
  readonly storage?: CustomerStorageTarget;
}

export interface ViewerContext {
  readonly isAuthenticated: boolean;
  readonly userId?: string;
  readonly displayName?: string;
  readonly avatarUrl?: string | null;
  readonly role?: 'fan' | 'moderator' | 'verified';
}

export interface OpponentInfo {
  readonly name: string;
  readonly short: string;
  readonly primary?: string;
  readonly crestUrl?: string | null;
}

export interface MatchScorers {
  readonly home: readonly string[];
  readonly away: readonly string[];
}

export interface ThreadReply {
  readonly id: string;
  readonly author: string;
  readonly text: string;
  readonly timestamp: string;
  readonly reactions?: Readonly<Record<string, number>>;
  readonly userReactions?: readonly string[];
}

export interface MatchEvent {
  readonly id: string;
  readonly minute: string;
  readonly type: string;
  readonly authorType?: EventAuthorType;
  readonly authorName?: string;
  readonly text: string;
  readonly embedUrl?: string;
  readonly reactions?: Readonly<Record<string, number>>;
  readonly userReactions?: readonly string[];
  readonly threads?: readonly ThreadReply[];
}

interface BaseFormQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly results?: Readonly<Record<string, number>>;
  readonly submitted?: boolean;
}

export interface PollOrQuizFormQuestion extends BaseFormQuestion {
  readonly type: 'poll' | 'quiz';
  readonly options: readonly string[];
}

export interface RatingFormQuestion extends BaseFormQuestion {
  readonly type: 'rating';
  readonly maxRating: number;
}

export type MatchFormQuestion = PollOrQuizFormQuestion | RatingFormQuestion;

export interface MatchState {
  readonly matchId: string;
  readonly competition?: string;
  readonly venue?: string;
  readonly opponent: OpponentInfo;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly clock?: string;
  readonly period?: string;
  readonly scorers?: MatchScorers;
  readonly events: readonly MatchEvent[];
  readonly forms?: readonly MatchFormQuestion[];
}

export interface ShipFailurePayload {
  readonly operation: 'comment' | 'reaction' | 'form' | 'beacon';
  readonly status?: number;
  readonly code?: string;
  readonly timeoutMs?: number;
  readonly retryable?: boolean;
}

export interface TabChangeDetail {
  readonly matchId: string;
  readonly tab: MatchCentreTab;
}

export interface ReactionDetail {
  readonly matchId: string;
  readonly emoji: string;
  readonly eventId?: string;
}

export interface CommentSubmitDetail {
  readonly matchId: string;
  readonly parentId?: string;
  readonly text: string;
}

export interface FormSubmitDetail {
  readonly matchId: string;
  readonly formId: string;
  readonly response: unknown;
}

export interface AuthRequiredDetail {
  readonly matchId: string;
  readonly action: 'comment' | 'react' | 'form';
}

export interface ChameleonEventMap {
  'mc:tab-change': CustomEvent<TabChangeDetail>;
  'mc:reaction': CustomEvent<ReactionDetail>;
  'mc:comment-submit': CustomEvent<CommentSubmitDetail>;
  'mc:form-submit': CustomEvent<FormSubmitDetail>;
  'mc:auth-required': CustomEvent<AuthRequiredDetail>;
}
