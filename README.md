# Chameleon Match Centre

`<chameleon-match-centre>` is a zero-dependency Web Component SDK for desktop and mobile browsers. It adapts to your UI, colours, device language, light/dark mode, and sports data feeds, and runs standalone on your infrastructure, with optional stateless **Lovorise / MTCHSHIP** edge forwarding add-ons via CNAME.

Maintained by **Lovorise Ltd** (UK) under the **Apache License 2.0**.

---

## Core Capabilities

* **Automatic Device & Host Adaptation:** Automatically detects device/host light or dark mode (`surface-mode="auto"` via `prefers-color-scheme`) and device language (`lang` attribute or `navigator.language`), while matching brand colours, header styles, and container widths (`@container`).
* **Style & CSP Isolation:** Closed Shadow DOM with `all: initial` and Constructable Stylesheets (`adoptedStyleSheets`) for strict CSP environments (zero inline styles or scripts).
* **XSS & Media Hardening:** Renders text strictly via `textContent`, validates dynamic CSS colours and HTTP(S) URLs, computes WCAG 2.1 text contrast automatically, restricts social embeds to `allowedEmbedOrigins`, and falls back to a styled `teamShort` monogram if `crestUrl` fails.
* **Keyed DOM Diffing:** `setMatchState()` updates by `event.id` and `thread.id`, preserving open reply inputs, active tabs, and scroll positions during live clock ticks.
* **Pre-Upgrade & SSR Safety:** Supports both methods (`configureTeam()`, `setMatchState()`) and pre-upgrade property setters (`teamConfig`, `matchState`), with SSR-safe module evaluation.
* **Host-Controlled Auth & Guest Modes:** Choose via `guest-mode` whether unauthenticated visitors see a login trigger (`prompt`), a strict read-only view (`readonly`), or open composers (`open`), leaving all database and authentication state on your infrastructure.
* **Multi-Sport & Season Modes:** Switch fixtures/sports in place via `match-id` and `setMatchState()`, or lock onto a single club/competition identity.
* **Web & Mobile WebViews:** Compatible with React, Vue, Angular, Svelte, WordPress, and plain HTML, including responsive container breakpoints (`<= 520px`) and native iOS (`webkit.messageHandlers`) / Android (`MtchshipNative`) WebView bridges.
* **Accessibility & Localisation:** WCAG 2.1 AA keyboard/focus management across Shadow DOM boundaries, CSS logical properties for RTL layouts, `prefers-reduced-motion` support, and full label translation via `locale`.
* **Bring Your Own Data & Backend:**
  * Hydrate live or archived JSON from your sports data provider or database via `setMatchState()`. Lovorise does not supply sports data feeds.
  * Mount custom or provider widgets into `<slot name="lineups">`, `<slot name="stats">`, and `<slot name="standings">`.
  * Connect your own chat/forms plugins (`<slot name="external-chat-plugin">`, `<slot name="external-forms-plugin">`), use the built-in polls/quizzes/ratings renderer, disable engagement (`engagement-mode="broadcast"`), or attach optional MTCHSHIP edge forwarders.

---

## Optional MTCHSHIP Edge Add-ons (via CNAME)

`<chameleon-match-centre>` runs completely standalone with your own backend. Optionally, you can attach stateless **Lovorise / MTCHSHIP** volatile-RAM modules via CNAME (`chat-provider="mtchship"`, `forms-provider="mtchship"`, `edge-endpoint="https://yourdomain.com"`):

* **Modules:** Live Chat & Thread Engine, Interactive Forms (polls, quizzes, ratings), Signal Beacon (Pub/Sub), Story & News Feed API, and optional in-memory AI Gatekeeper (disabled during default blind pass-through).
* **Zero-Retention Pipeline:** Processes traffic strictly in volatile RAM with zero disk writes, forwards payloads directly to your S3-compatible Object Storage or Cloud Server within a `5000 ms` timeout, and overwrites RAM buffers with `0x00` immediately upon delivery or failure.

---

## Integration

Load the standalone ES module directly from your package bundle, CDN, or assets folder:

```html
<script type="module" src="./dist/index.js"></script>
```

### HTML & Slots

```html
<chameleon-match-centre
  id="match-centre"
  match-id="sl-2026-0412"
  surface-mode="auto"
  engagement-mode="full"
  guest-mode="prompt"
  chat-provider="external-plugin"
  forms-provider="external-plugin">
  <div slot="lineups">
    <your-provider-lineups match-id="sl-2026-0412"></your-provider-lineups>
  </div>
  <div slot="stats">
    <your-provider-stats match-id="sl-2026-0412"></your-provider-stats>
  </div>
  <div slot="standings">
    <your-provider-standings competition-id="ch-super-league"></your-provider-standings>
  </div>
  <div slot="external-chat-plugin">
    <your-chat-widget match-id="sl-2026-0412"></your-chat-widget>
  </div>
  <div slot="external-forms-plugin">
    <your-polls-widget match-id="sl-2026-0412"></your-polls-widget>
  </div>
</chameleon-match-centre>
```

### JavaScript / TypeScript

```ts
await customElements.whenDefined('chameleon-match-centre');

const mc = document.querySelector('#match-centre');

mc?.configureTeam({
  teamId: 'fcz-1896',
  teamName: 'FC Zurich',
  teamShort: 'FCZ',
  primaryColor: '#0055a5',
  headerStyle: 'tinted',
  deskLabel: 'MATCH CENTRE',
  allowedEmbedOrigins: ['https://twitter.com', 'https://youtube-nocookie.com'],
  storage: {
    driver: 's3',
    bucket: 'club-match-archive',
    prefix: 'season-2026/',
  },
  sport: {
    scoreIcon: '•',
    scoringHeading: 'Scoring',
    rosterTabLabel: 'Roster',
    reactions: ['🔥', '👏', '🏆', '😮'],
  },
});

mc?.setViewerContext({
  isAuthenticated: true,
  userId: 'u-84920',
  displayName: 'Lukas M.',
});

mc?.setMatchState({
  matchId: 'sl-2026-0412',
  competition: 'Super League',
  opponent: { name: 'BSC Young Boys', short: 'YB', primary: '#facc15', crestUrl: null },
  homeScore: 1,
  awayScore: 0,
  clock: '45:00',
  period: 'HALFTIME',
  scorers: { home: ["22' Marchesano"], away: [] },
  events: [
    {
      id: 'evt-4821',
      minute: "22'",
      type: 'goal',
      authorType: 'provider',
      text: 'Goal! Marchesano finishes from close range.',
      threads: [
        {
          id: 'thr-9104',
          author: 'Sarah K.',
          text: 'Clean combination down the left wing.',
          timestamp: '16:22 UTC',
          reactions: { '🔥': 14 },
        },
      ],
    },
  ],
  forms: [
    {
      id: 'poll-motm-0412',
      type: 'poll',
      prompt: 'First-half standout player?',
      options: ['Marchesano', 'Brecher', 'Katic'],
      results: { Marchesano: 64, Brecher: 24, Katic: 12 },
    },
  ],
});
```

### CSS Custom Properties

```css
chameleon-match-centre {
  --cmc-font-family: inherit;
  --cmc-border-radius: 12px;
  --cmc-surface-bg: #ffffff;
  --cmc-surface-border: #e2e8f0;
  --cmc-text-primary: #0f172a;
  --cmc-text-muted: #64748b;
}
```

### Framework Notes

* **Vue 3:** Register `chameleon-match-centre` in `compilerOptions.isCustomElement`.
* **Angular:** Add `CUSTOM_ELEMENTS_SCHEMA` to your module or standalone component.
* **React 18:** Attach custom event listeners via `ref` and `addEventListener` inside `useEffect`. (React 19+, Svelte, WordPress, and plain HTML work natively.)

---

## API Reference

### Attributes

| Attribute | Values | Default | Description |
| :--- | :--- | :--- | :--- |
| `match-id` | `string` | - | Fixture ID from your data provider or database. |
| `surface-mode` | `auto` \| `light` \| `dark` | `auto` | Colour theme (`auto` follows device/host preference). |
| `lang` | `string` | Device/HTML `lang` | BCP 47 language tag (e.g. `en`, `de`, `fr`, `es`, `it`). Falls back to `navigator.language`. |
| `engagement-mode` | `full` \| `broadcast` | `full` | Enables chat and forms (`full`) or restricts to scores and commentary (`broadcast`). |
| `guest-mode` | `prompt` \| `readonly` \| `open` | `prompt` | Controls behaviour when viewer is unauthenticated (`prompt` emits `mc:auth-required`, `readonly` hides inputs/prompts, `open` allows anonymous submission). |
| `chat-provider` | `external-plugin` \| `mtchship` \| `none` | `external-plugin` | Chat mode (`external-plugin`, optional `mtchship` add-on, or `none`). |
| `forms-provider` | `external-plugin` \| `mtchship` \| `none` | `external-plugin` | Forms mode (`external-plugin`, optional `mtchship` add-on, or `none`). |
| `edge-endpoint` | `string` | - | Optional CNAME URL (`https://yourdomain.com`) when using MTCHSHIP add-ons. |

### Slots

Tabs for `lineups`, `stats`, and `standings` are automatically hidden if their slot is omitted or empty.

| Slot Name | Description |
| :--- | :--- |
| `lineups` | Lineup and roster widgets from your data provider. |
| `stats` | Match statistics widgets (or optional region-gated odds widgets on licensed betting/live-score platforms). |
| `standings` | League tables, group standings, or matchweek rankings. |
| `external-chat-plugin` | Custom/third-party chat widget when `chat-provider="external-plugin"`. |
| `external-forms-plugin` | Custom/third-party polls/forms widget when `forms-provider="external-plugin"`. |

### Methods

| Method | Signature | Description |
| :--- | :--- | :--- |
| `configureTeam()` | `(config: TeamConfig) => void` | Sets branding, colours, header style, embed allowlist, customer storage target, sport labels, locale, and reactions. |
| `setViewerContext()` | `(viewer: ViewerContext \| null) => void` | Sets viewer auth state to toggle between guest mode and active composers. |
| `setMatchState()` | `(state: MatchState) => void` | Reconciles scores, clock, period, scorers, events, forms, and stored threads via keyed diffing. |
| `appendThreadReply()` | `(eventId: string, reply: ThreadReply) => void` | Appends or updates a nested thread reply in place without full-state re-hydration. |
