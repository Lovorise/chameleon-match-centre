/**
 * Copyright 2026 Lovorise Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://apache.org
 */

export const COMPONENT_CSS = `
:host {
  all: initial;
  display: block;
  box-sizing: border-box;
  color-scheme: light dark;
  font-family: var(--cmc-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);
  color: var(--cmc-text-primary, #0f172a);
  --_bg: var(--cmc-surface-bg, #ffffff);
  --_surface-alt: #f8fafc;
  --_border: var(--cmc-surface-border, #e2e8f0);
  --_text: var(--cmc-text-primary, #0f172a);
  --_muted: var(--cmc-text-muted, #64748b);
  --_radius: var(--cmc-border-radius, 12px);
  --_home-primary: #0055a5;
  --_home-contrast: #ffffff;
  --_away-primary: #dc2626;
  --_away-contrast: #ffffff;
  --_alert-bg: #fef2f2;
  --_alert-text: #991b1b;
  --_alert-border: #fecaca;
}

:host([surface-mode="light"]) {
  color-scheme: light;
}

:host([surface-mode="dark"]) {
  color-scheme: dark;
  --_bg: var(--cmc-surface-bg, #0f172a);
  --_surface-alt: #1e293b;
  --_border: var(--cmc-surface-border, #334155);
  --_text: var(--cmc-text-primary, #f8fafc);
  --_muted: var(--cmc-text-muted, #94a3b8);
  --_alert-bg: #450a0a;
  --_alert-text: #fecaca;
  --_alert-border: #7f1d1d;
}

@media (prefers-color-scheme: dark) {
  :host(:not([surface-mode="light"])) {
    --_bg: var(--cmc-surface-bg, #0f172a);
    --_surface-alt: #1e293b;
    --_border: var(--cmc-surface-border, #334155);
    --_text: var(--cmc-text-primary, #f8fafc);
    --_muted: var(--cmc-text-muted, #94a3b8);
    --_alert-bg: #450a0a;
    --_alert-text: #fecaca;
    --_alert-border: #7f1d1d;
  }
}

*, *::before, *::after {
  box-sizing: border-box;
}

.cmc-shell {
  container-type: inline-size;
  background: var(--_bg);
  color: var(--_text);
  border: 1px solid var(--_border);
  border-radius: var(--_radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cmc-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--_border);
  background: var(--_surface-alt);
}

.cmc-header[data-style="tinted"] {
  background: var(--_surface-alt);
}

@supports (background: color-mix(in srgb, red 10%, white)) {
  .cmc-header[data-style="tinted"] {
    background: color-mix(in srgb, var(--_home-primary) 10%, var(--_bg));
  }
}

.cmc-header[data-style="solid"] {
  background: var(--_home-primary);
  color: var(--_home-contrast);
}

.cmc-header[data-style="solid"] .cmc-meta,
.cmc-header[data-style="solid"] .cmc-scorers {
  color: var(--_home-contrast);
  opacity: 0.88;
}

.cmc-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--_muted);
  margin-bottom: 12px;
}

.cmc-scoreboard {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
}

.cmc-team {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.cmc-team--away {
  justify-content: flex-end;
  text-align: end;
}

.cmc-crest {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: contain;
  flex-shrink: 0;
}

.cmc-monogram {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--_home-contrast);
  background: var(--_home-primary);
  flex-shrink: 0;
}

.cmc-team--away .cmc-monogram {
  color: var(--_away-contrast);
  background: var(--_away-primary);
}

.cmc-team-name {
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmc-score-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.cmc-score {
  font-size: 26px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.cmc-clock {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.16);
}

.cmc-scorers {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid var(--_border);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  font-size: 12px;
  color: var(--_muted);
}

.cmc-scorers-away {
  text-align: end;
}

.cmc-alert {
  padding: 10px 16px;
  font-size: 13px;
  background: var(--_alert-bg);
  color: var(--_alert-text);
  border-bottom: 1px solid var(--_alert-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cmc-alert[hidden] {
  display: none;
}

.cmc-tablist {
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid var(--_border);
  background: var(--_bg);
  scrollbar-width: none;
}

.cmc-tablist::-webkit-scrollbar {
  display: none;
}

.cmc-tab {
  appearance: none;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--_muted);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  padding: 12px 16px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.cmc-tab:hover {
  color: var(--_text);
}

.cmc-tab:focus-visible,
.cmc-btn:focus-visible,
.cmc-reaction-btn:focus-visible,
.cmc-input:focus-visible {
  outline: 2px solid var(--_home-primary);
  outline-offset: -2px;
}

.cmc-tab[aria-selected="true"] {
  color: var(--_home-primary);
  border-bottom-color: var(--_home-primary);
}

.cmc-tab[hidden] {
  display: none;
}

.cmc-panel {
  padding: 16px 20px;
}

.cmc-panel[hidden] {
  display: none;
}

.cmc-composer {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--_border);
}

.cmc-composer-row {
  display: flex;
  gap: 8px;
}

.cmc-input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: 13px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--_border);
  background: var(--_surface-alt);
  color: var(--_text);
}

.cmc-btn {
  appearance: none;
  border: 0;
  border-radius: 8px;
  padding: 9px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  background: var(--_home-primary);
  color: var(--_home-contrast);
}

.cmc-btn--ghost {
  background: transparent;
  color: var(--_muted);
  padding: 4px 8px;
  font-size: 12px;
}

.cmc-btn--ghost:hover {
  color: var(--_text);
}

.cmc-auth-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--_surface-alt);
  border: 1px solid var(--_border);
  font-size: 13px;
  margin-bottom: 16px;
}

.cmc-feed {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cmc-empty {
  text-align: center;
  color: var(--_muted);
  font-size: 13px;
  padding: 24px 0;
}

.cmc-event {
  padding: 12px 14px;
  border: 1px solid var(--_border);
  border-radius: 10px;
  background: var(--_surface-alt);
}

.cmc-event-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 12px;
}

.cmc-minute {
  font-weight: 800;
  color: var(--_home-primary);
}

.cmc-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(100, 116, 139, 0.16);
  color: var(--_muted);
}

.cmc-event-text {
  margin: 0 0 10px 0;
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.cmc-embed-link {
  display: inline-block;
  margin-bottom: 10px;
  font-size: 12px;
  color: var(--_home-primary);
  text-decoration: underline;
}

.cmc-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.cmc-reaction-btn {
  appearance: none;
  border: 1px solid var(--_border);
  background: var(--_bg);
  color: var(--_text);
  border-radius: 999px;
  padding: 3px 9px;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cmc-reaction-btn[aria-pressed="true"] {
  border-color: var(--_home-primary);
  background: var(--_surface-alt);
}

@supports (background: color-mix(in srgb, red 12%, white)) {
  .cmc-reaction-btn[aria-pressed="true"] {
    background: color-mix(in srgb, var(--_home-primary) 12%, var(--_bg));
  }
}

.cmc-reaction-pill {
  border: 1px solid var(--_border);
  background: var(--_bg);
  color: var(--_muted);
  border-radius: 999px;
  padding: 3px 9px;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.cmc-threads {
  margin-top: 10px;
  padding-inline-start: 12px;
  border-inline-start: 2px solid var(--_border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cmc-thread-item {
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--_bg);
}

.cmc-thread-meta {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: var(--_muted);
  margin-bottom: 2px;
}

.cmc-reply-box {
  margin-top: 8px;
  display: flex;
  gap: 6px;
}

@container (max-width: 520px) {
  .cmc-header {
    padding: 12px 14px;
  }
  .cmc-team-name {
    font-size: 13px;
  }
  .cmc-score {
    font-size: 22px;
  }
  .cmc-panel {
    padding: 12px 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cmc-tab {
    transition: none;
  }
}
`;

let sharedSheet: CSSStyleSheet | null = null;

export function getComponentStyleSheet(): CSSStyleSheet | null {
  if (typeof CSSStyleSheet === 'undefined') return null;
  if (!sharedSheet) {
    sharedSheet = new CSSStyleSheet();
    sharedSheet.replaceSync(COMPONENT_CSS);
  }
  return sharedSheet;
}
