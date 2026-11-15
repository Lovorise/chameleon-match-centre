/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

export interface MatchCentreLocale {
  readonly deskLabel: string;
  readonly tabCommentary: string;
  readonly tabLineups: string;
  readonly tabStats: string;
  readonly tabStandings: string;
  readonly tabPolls: string;
  readonly scoringHeading: string;
  readonly emptyEvents: string;
  readonly replyAction: string;
  readonly repliesLabel: string;
  readonly commentPlaceholder: string;
  readonly replyPlaceholder: string;
  readonly submitAction: string;
  readonly signInPrompt: string;
  readonly signInButton: string;
  readonly shipTimeoutError: string;
  readonly embedOpenLabel: string;
}

export type LocaleKey = keyof MatchCentreLocale;
export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'it';
export type TextDirection = 'ltr' | 'rtl';

export const DEFAULT_LOCALE: MatchCentreLocale = Object.freeze({
  deskLabel: 'MATCH CENTRE',
  tabCommentary: 'Live Feed',
  tabLineups: 'Lineups',
  tabStats: 'Stats',
  tabStandings: 'Standings',
  tabPolls: 'Polls',
  scoringHeading: 'Scoring',
  emptyEvents: 'Waiting for match updates.',
  replyAction: 'Reply',
  repliesLabel: 'Replies',
  commentPlaceholder: 'Join the match discussion...',
  replyPlaceholder: 'Write a reply...',
  submitAction: 'Send',
  signInPrompt: 'Sign in to comment and react.',
  signInButton: 'Sign in',
  shipTimeoutError: 'Delivery timed out ({timeoutMs} ms). Please try again.',
  embedOpenLabel: 'Verified media link',
});

const VALID_LOCALE_KEYS: ReadonlySet<string> = new Set(Object.keys(DEFAULT_LOCALE));

export const BUILTIN_LOCALES: Readonly<Record<SupportedLanguage, MatchCentreLocale>> = Object.freeze({
  en: DEFAULT_LOCALE,
  de: Object.freeze({
    deskLabel: 'MATCH-CENTER',
    tabCommentary: 'Ticker',
    tabLineups: 'Aufstellung',
    tabStats: 'Statistik',
    tabStandings: 'Tabelle',
    tabPolls: 'Umfragen',
    scoringHeading: 'Torschützen',
    emptyEvents: 'Warte auf Spielereignisse.',
    replyAction: 'Antworten',
    repliesLabel: 'Antworten',
    commentPlaceholder: 'Kommentar zum Spiel verfassen...',
    replyPlaceholder: 'Antwort schreiben...',
    submitAction: 'Senden',
    signInPrompt: 'Anmelden, um zu kommentieren und zu reagieren.',
    signInButton: 'Anmelden',
    shipTimeoutError: 'Übertragung nach {timeoutMs} ms fehlgeschlagen. Bitte erneut versuchen.',
    embedOpenLabel: 'Verifizierter Medien-Link',
  }),
  fr: Object.freeze({
    deskLabel: 'CENTRE DU MATCH',
    tabCommentary: 'Direct',
    tabLineups: 'Compositions',
    tabStats: 'Stats',
    tabStandings: 'Classement',
    tabPolls: 'Sondages',
    scoringHeading: 'Buteurs',
    emptyEvents: 'En attente des actions du match.',
    replyAction: 'Répondre',
    repliesLabel: 'Réponses',
    commentPlaceholder: 'Participer à la discussion...',
    replyPlaceholder: 'Écrire une réponse...',
    submitAction: 'Envoyer',
    signInPrompt: 'Connectez-vous pour commenter et réagir.',
    signInButton: 'Connexion',
    shipTimeoutError: 'Délai dépassé ({timeoutMs} ms). Veuillez réessayer.',
    embedOpenLabel: 'Lien média vérifié',
  }),
  es: Object.freeze({
    deskLabel: 'CENTRO DE PARTIDO',
    tabCommentary: 'En vivo',
    tabLineups: 'Alineaciones',
    tabStats: 'Estadísticas',
    tabStandings: 'Clasificación',
    tabPolls: 'Encuestas',
    scoringHeading: 'Goleadores',
    emptyEvents: 'Esperando actualizaciones del partido.',
    replyAction: 'Responder',
    repliesLabel: 'Respuestas',
    commentPlaceholder: 'Únete a la conversación...',
    replyPlaceholder: 'Escribe una respuesta...',
    submitAction: 'Enviar',
    signInPrompt: 'Inicia sesión para comentar y reaccionar.',
    signInButton: 'Iniciar sesión',
    shipTimeoutError: 'Tiempo de espera agotado ({timeoutMs} ms). Inténtalo de nuevo.',
    embedOpenLabel: 'Enlace multimedia verificado',
  }),
  it: Object.freeze({
    deskLabel: 'MATCH CENTRE',
    tabCommentary: 'Diretta',
    tabLineups: 'Formazioni',
    tabStats: 'Statistiche',
    tabStandings: 'Classifica',
    tabPolls: 'Sondaggi',
    scoringHeading: 'Marcatori',
    emptyEvents: 'In attesa di aggiornamenti.',
    replyAction: 'Rispondi',
    repliesLabel: 'Risposte',
    commentPlaceholder: 'Partecipa alla discussione...',
    replyPlaceholder: 'Scrivi una risposta...',
    submitAction: 'Invia',
    signInPrompt: 'Accedi per commentare e reagire.',
    signInButton: 'Accedi',
    shipTimeoutError: 'Timeout di consegna ({timeoutMs} ms). Riprova.',
    embedOpenLabel: 'Link multimediale verificato',
  }),
});

export type InterpolationParams = Readonly<Record<string, string | number>>;
export type LocaleChangeListener = (lang: SupportedLanguage) => void;

const TEMPLATE_TOKEN_RE = /\{([a-zA-Z0-9_]+)\}/g;

export class I18nManager {
  private lang: SupportedLanguage = 'en';
  private resolvedLocaleTag = 'en';
  private overrides: Partial<Record<LocaleKey, string>> = {};
  private readonly listeners = new Set<LocaleChangeListener>();

  public get language(): SupportedLanguage {
    return this.lang;
  }

  public get localeTag(): string {
    return this.resolvedLocaleTag;
  }

  public get direction(): TextDirection {
    return 'ltr';
  }

  public subscribe(listener: LocaleChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public setLanguage(tag: string | null | undefined): void {
    const nextLang = this.resolveLanguage(tag);
    const nextTag = tag?.trim().replace(/_/g, '-') || nextLang;

    const changed = this.lang !== nextLang || this.resolvedLocaleTag !== nextTag;
    this.lang = nextLang;
    this.resolvedLocaleTag = nextTag;

    if (changed) {
      this.notify();
    }
  }

  public setOverrides(custom?: Readonly<Record<string, unknown>>): void {
    const sanitized: Partial<Record<LocaleKey, string>> = {};

    if (custom && typeof custom === 'object') {
      for (const [key, value] of Object.entries(custom)) {
        if (VALID_LOCALE_KEYS.has(key) && typeof value === 'string') {
          const trimmed = value.trim();
          if (trimmed.length > 0) {
            sanitized[key as LocaleKey] = trimmed;
          }
        }
      }
    }

    this.overrides = sanitized;
    this.notify();
  }

  public t(key: LocaleKey, params?: InterpolationParams): string {
    const template =
      this.overrides[key] ??
      BUILTIN_LOCALES[this.lang][key] ??
      DEFAULT_LOCALE[key];

    const resolvedParams =
      key === 'shipTimeoutError' && !params ? { timeoutMs: 5000 } : params;

    if (!resolvedParams) {
      return template;
    }

    return template.replace(TEMPLATE_TOKEN_RE, (match, token: string) => {
      const val = resolvedParams[token];
      return val !== undefined ? String(val) : match;
    });
  }

  private resolveLanguage(tag: string | null | undefined): SupportedLanguage {
    if (!tag) return 'en';
    const normalized = tag.trim().replace(/_/g, '-').toLowerCase();
    const base = normalized.split('-')[0] ?? 'en';

    if (Object.prototype.hasOwnProperty.call(BUILTIN_LOCALES, normalized)) {
      return normalized as SupportedLanguage;
    }
    if (Object.prototype.hasOwnProperty.call(BUILTIN_LOCALES, base)) {
      return base as SupportedLanguage;
    }
    return 'en';
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.lang);
    }
  }
}
