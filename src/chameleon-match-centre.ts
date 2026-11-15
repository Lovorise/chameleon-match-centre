/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

import { I18nManager } from './i18n.js';
import { COMPONENT_CSS, getComponentStyleSheet } from './styles.js';
import type {
  AuthRequiredDetail,
  CommentSubmitDetail,
  EngagementMode,
  GuestMode,
  MatchCentreTab,
  MatchEvent,
  MatchState,
  ProviderMode,
  ReactionDetail,
  ShipFailurePayload,
  TabChangeDetail,
  TeamConfig,
  ThreadReply,
  ViewerContext,
} from './types.js';
import {
  buildMonogram,
  createEl,
  emitHostEvent,
  getContrastTextColor,
  sanitizeColor,
  sanitizeUrl,
} from './utils.js';

const BaseElement = (typeof HTMLElement !== 'undefined'
  ? HTMLElement
  : class {}) as typeof HTMLElement;

const DEFAULT_REACTIONS: readonly string[] = ['🔥', '👏', '🏆', '😮'];

export class ChameleonMatchCentre extends BaseElement {
  public static get observedAttributes(): string[] {
    return [
      'match-id',
      'surface-mode',
      'lang',
      'engagement-mode',
      'guest-mode',
      'chat-provider',
      'forms-provider',
      'edge-endpoint',
    ];
  }

  private readonly shadow: ShadowRoot;
  private readonly i18n = new I18nManager();

  private _teamConfig: TeamConfig | null = null;
  private _viewer: ViewerContext | null = null;
  private _matchState: MatchState | null = null;
  private activeTab: MatchCentreTab = 'commentary';
  private openReplyInputs = new Set<string>();
  private draftReplies = new Map<string, string>();
  private mainDraft = '';
  private failureMessage: string | null = null;

  private shellEl!: HTMLElement;
  private headerEl!: HTMLElement;
  private alertEl!: HTMLElement;
  private alertTextEl!: HTMLElement;
  private tabListEl!: HTMLElement;
  private tabButtons = new Map<MatchCentreTab, HTMLButtonElement>();
  private panels = new Map<MatchCentreTab, HTMLElement>();
  private feedContainerEl!: HTMLElement;
  private composerContainerEl!: HTMLElement;
  private eventNodes = new Map<string, HTMLElement>();

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.adoptStyles();
    this.buildSkeleton();
    this.upgradePredefinedProperties();
  }

  public get teamConfig(): TeamConfig | null {
    return this._teamConfig;
  }

  public set teamConfig(value: TeamConfig | null) {
    if (value) this.configureTeam(value);
  }

  public get matchState(): MatchState | null {
    return this._matchState;
  }

  public set matchState(value: MatchState | null) {
    if (value) this.setMatchState(value);
  }

  public connectedCallback(): void {
    this.syncLanguageFromHost();
    this.syncSlotVisibility();
    this.renderAll();
  }

  public attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    if (name === 'lang') {
      this.syncLanguageFromHost();
    }
    if (name === 'match-id' && newValue && this._matchState && this._matchState.matchId !== newValue) {
      this.eventNodes.clear();
      this.feedContainerEl.replaceChildren();
    }
    this.renderAll();
  }

  public configureTeam(config: TeamConfig): void {
    this._teamConfig = { ...config };
    this.i18n.setOverrides(config.locale);

    const homeColor = sanitizeColor(config.primaryColor, '#0055a5');
    this.shellEl.style.setProperty('--_home-primary', homeColor);
    this.shellEl.style.setProperty('--_home-contrast', getContrastTextColor(homeColor));
    this.renderAll();
  }

  public setViewerContext(viewer: ViewerContext | null): void {
    this._viewer = viewer ? { ...viewer } : null;

    if (!this.canInteract()) {
      this.openReplyInputs.clear();
      this.draftReplies.clear();
      this.mainDraft = '';
    }

    this.renderComposer();
    if (this._matchState) {
      this.reconcileEvents(this._matchState.events);
    }
  }

  public setMatchState(state: MatchState): void {
    const isNewMatch = this._matchState?.matchId !== state.matchId;
    this._matchState = state;

    if (state.opponent?.primary) {
      const awayColor = sanitizeColor(state.opponent.primary, '#dc2626');
      this.shellEl.style.setProperty('--_away-primary', awayColor);
      this.shellEl.style.setProperty('--_away-contrast', getContrastTextColor(awayColor));
    }

    if (isNewMatch) {
      this.eventNodes.clear();
      this.feedContainerEl.replaceChildren();
    }

    this.renderHeader();
    this.reconcileEvents(state.events ?? []);
    this.syncTabVisibility();
  }

  public appendThreadReply(eventId: string, reply: ThreadReply): void {
    if (!this._matchState) return;
    const eventIdx = this._matchState.events.findIndex((evt) => evt.id === eventId);
    if (eventIdx === -1) return;

    const targetEvent = this._matchState.events[eventIdx];
    if (!targetEvent) return;

    const currentThreads = targetEvent.threads ?? [];
    const existingIdx = currentThreads.findIndex((t) => t.id === reply.id);
    const nextThreads: readonly ThreadReply[] =
      existingIdx >= 0
        ? currentThreads.map((t, idx) => (idx === existingIdx ? reply : t))
        : [...currentThreads, reply];

    const updatedEvent: MatchEvent = {
      ...targetEvent,
      threads: nextThreads,
    };

    this._matchState = {
      ...this._matchState,
      events: this._matchState.events.map((evt, idx) => (idx === eventIdx ? updatedEvent : evt)),
    };

    const existingNode = this.eventNodes.get(eventId);
    if (existingNode) {
      const updatedNode = this.buildEventNode(updatedEvent);
      existingNode.replaceWith(updatedNode);
      this.eventNodes.set(eventId, updatedNode);
    }
  }

  public reportShipFailure(error: ShipFailurePayload, userMessage?: string): void {
    const timeoutMs = error.timeoutMs ?? 5000;
    this.failureMessage =
      userMessage?.trim() || this.i18n.t('shipTimeoutError', { timeoutMs });
    this.renderAlert();
  }

  private adoptStyles(): void {
    const sheet = getComponentStyleSheet();
    if (sheet && 'adoptedStyleSheets' in this.shadow) {
      this.shadow.adoptedStyleSheets = [sheet];
    } else {
      const styleEl = document.createElement('style');
      styleEl.textContent = COMPONENT_CSS;
      this.shadow.appendChild(styleEl);
    }
  }

  private upgradePredefinedProperties(): void {
    const self = this as unknown as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(self, 'teamConfig')) {
      const val = self['teamConfig'] as TeamConfig | null;
      delete self['teamConfig'];
      if (val) this.configureTeam(val);
    }
    if (Object.prototype.hasOwnProperty.call(self, 'matchState')) {
      const val = self['matchState'] as MatchState | null;
      delete self['matchState'];
      if (val) this.setMatchState(val);
    }
  }

  private syncLanguageFromHost(): void {
    const explicit = this.getAttribute('lang');
    const docLang = typeof document !== 'undefined' ? document.documentElement.lang : '';
    const navLang = typeof navigator !== 'undefined' ? navigator.language : 'en';
    this.i18n.setLanguage(explicit || docLang || navLang);
  }

  private getEngagementMode(): EngagementMode {
    return this.getAttribute('engagement-mode') === 'broadcast' ? 'broadcast' : 'full';
  }

  private getGuestMode(): GuestMode {
    const attr = this.getAttribute('guest-mode');
    if (attr === 'readonly' || attr === 'open') return attr;
    return 'prompt';
  }

  private getChatProvider(): ProviderMode {
    const attr = this.getAttribute('chat-provider');
    if (attr === 'mtchship' || attr === 'none') return attr;
    return 'external-plugin';
  }

  private getFormsProvider(): ProviderMode {
    const attr = this.getAttribute('forms-provider');
    if (attr === 'mtchship' || attr === 'none') return attr;
    return 'external-plugin';
  }

  private getActiveMatchId(): string {
    return this._matchState?.matchId || this.getAttribute('match-id') || '';
  }

  private canInteract(): boolean {
    if (this.getEngagementMode() === 'broadcast') return false;
    if (this._viewer?.isAuthenticated) return true;
    return this.getGuestMode() === 'open';
  }

  private isStrictReadOnlyGuest(): boolean {
    if (this.getEngagementMode() === 'broadcast') return true;
    if (this._viewer?.isAuthenticated) return false;
    return this.getGuestMode() === 'readonly';
  }

  private buildSkeleton(): void {
    this.shellEl = createEl('section', {
      className: 'cmc-shell',
      attrs: { part: 'shell' },
    });

    this.headerEl = createEl('header', { className: 'cmc-header' });
    this.shellEl.appendChild(this.headerEl);

    this.alertEl = createEl('div', {
      className: 'cmc-alert',
      attrs: { role: 'alert', hidden: '' },
    });
    this.alertTextEl = createEl('span');
    const dismissBtn = createEl('button', {
      className: 'cmc-btn--ghost',
      text: '✕',
      attrs: { type: 'button', 'aria-label': 'Dismiss' },
    });
    dismissBtn.addEventListener('click', () => {
      this.failureMessage = null;
      this.renderAlert();
    });
    this.alertEl.append(this.alertTextEl, dismissBtn);
    this.shellEl.appendChild(this.alertEl);

    this.tabListEl = createEl('div', {
      className: 'cmc-tablist',
      attrs: { role: 'tablist' },
    });

    const tabs: readonly MatchCentreTab[] = ['commentary', 'lineups', 'stats', 'standings', 'polls'];
    tabs.forEach((tabKey) => {
      const btn = createEl('button', {
        className: 'cmc-tab',
        attrs: {
          type: 'button',
          role: 'tab',
          id: `tab-${tabKey}`,
          'aria-controls': `panel-${tabKey}`,
          'aria-selected': tabKey === this.activeTab ? 'true' : 'false',
          tabindex: tabKey === this.activeTab ? '0' : '-1',
        },
      });
