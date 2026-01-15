# BeatForge Studio

## What This Is

A browser-based music-to-video creator that transforms audio into professional visualizer videos. Users upload music, choose visual styles, add text, and export ready-to-post videos for TikTok, YouTube, or any platform. Runs 100% client-side with no backend required.

## Core Value

Beat-reactive visuals that feel tight and alive. If the visuals don't breathe with the music, nothing else matters.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Audio upload and analysis (MP3/WAV via Web Audio API)
- [ ] Real-time beat detection and frequency analysis
- [ ] Audio visualizers (equalizer bars, waveforms, circular spectrum)
- [ ] Animated text layers (lyrics, quotes, captions)
- [ ] Background system (solid colors, gradients, images, video)
- [ ] Particle effects and motion graphics
- [ ] Beat-reactive animations across all visual elements
- [ ] Camera shake and cinematic post-processing effects
- [ ] Preset system with 4 distinct styles:
  - **TikTok** (9:16): High energy, strong beat reactions, bold centered text, constant movement
  - **YouTube** (16:9): Cinematic, calm transitions, atmosphere-focused, minimal text
  - **Lyric Video**: Text-centric, karaoke-style animation, soft background visualizers, readability priority
  - **Club Visualizer**: Dark background, neon colors, strong equalizer & particles, pulsing to beat, rave aesthetic
- [ ] Real-time preview (WYSIWYG)
- [ ] Video export (WebM, MP4 if feasible)
- [ ] Responsive UI (desktop and mobile)
- [ ] Offline capability after first load
- [ ] Monetization structure (Free: watermark + limited export / Pro: no watermark + HD)

### Out of Scope

- Multi-track timeline or full video editor features — This is a visualizer creator, not Premiere
- AI-generated lyrics, images, or music — User brings their own content
- Social media API integrations — Export only, user uploads manually
- User accounts, login systems, or cloud storage — Fully local, client-side app
- Collaborative editing or sharing inside the app — Solo creator tool
- Complex keyframe animation editor — Smart presets + live controls instead
- Marketplace or preset store — Not in v1

## Context

**Target users:** Content creators making music videos for TikTok, YouTube, Instagram. Music producers wanting visualizers. Anyone who wants to turn audio into shareable video without learning After Effects.

**Technical environment:**
- Modern browsers with Web Audio API and Canvas/WebGL support
- Must deploy to GitHub Pages (static hosting, no server)
- Performance-critical: 60 FPS rendering, no memory leaks
- Export via browser-native APIs (MediaRecorder, WebCodecs if available)

**Preset philosophy:**
Each preset is a complete visual language, not just settings. They differ in:
- Aspect ratio (9:16 vs 16:9)
- Energy level (explosive vs atmospheric)
- Text treatment (bold/centered vs minimal vs karaoke)
- Color palette (vibrant vs cinematic vs neon)
- Motion intensity (constant vs smooth)

## Constraints

- **Tech stack**: Vite + React + TypeScript — modern, fast, maintainable
- **Rendering**: Canvas 2D or WebGL — browser-native, no plugins
- **Audio**: Web Audio API — real-time frequency/beat analysis
- **Deployment**: GitHub Pages compatible — static files only, no server
- **Performance**: 60 FPS target, must not leak memory on long sessions
- **Offline**: Service worker for offline capability after initial load

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% client-side architecture | No server costs, instant deployment, user privacy | — Pending |
| Preset-based UX over timeline editing | Lower complexity, faster creation, focused scope | — Pending |
| Beat-reactive as core differentiator | This is what makes visualizers feel alive vs static | — Pending |

---
*Last updated: 2025-01-15 after initialization*
