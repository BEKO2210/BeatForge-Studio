# BeatForge Studio

## What This Is

A browser-based music-to-video creator that transforms audio into professional visualizer videos. Users upload music, choose visual styles, add text, and export ready-to-post videos for TikTok, YouTube, or any platform. Runs 100% client-side with no backend required.

## Core Value

Beat-reactive visuals that feel tight and alive. If the visuals don't breathe with the music, nothing else matters.

## Requirements

### Validated

- Audio upload and analysis (MP3/WAV via Web Audio API) — v0.1
- Real-time beat detection and frequency analysis — v0.1
- Audio visualizers (equalizer bars, waveforms, circular spectrum) — v0.1
- Animated text layers (lyrics, quotes, captions) — v0.1
- Background system (solid colors, gradients, images) — v0.1
- Beat-reactive animations across all visual elements — v0.1
- Camera shake and vignette effects — v0.1
- Preset system with 4 distinct styles (TikTok, YouTube, Lyric Video, Club) — v0.1
- Real-time preview (WYSIWYG) at 60 FPS — v0.1
- Video export (WebM format, 720p/1080p) — v0.1
- Responsive UI (desktop and mobile) — v0.1
- Offline capability after first load (PWA) — v0.1
- Monetization structure (Free: watermark + 720p / Pro: no watermark + 1080p) — v0.1

### Active

(None currently — v0.1 shipped, planning next milestone)

### Out of Scope

- Multi-track timeline or full video editor features — This is a visualizer creator, not Premiere
- AI-generated lyrics, images, or music — User brings their own content
- Social media API integrations — Export only, user uploads manually
- User accounts, login systems, or cloud storage — Fully local, client-side app
- Collaborative editing or sharing inside the app — Solo creator tool
- Complex keyframe animation editor — Smart presets + live controls instead
- Marketplace or preset store — Not in v1
- Video backgrounds — Deferred (added complexity)
- Particle effects — Deferred (performance concerns, reverted in v0.1)
- MP4 export — Browser support limited, WebM works well

## Context

**Current state:** v0.1 Alpha shipped with 6,969 LOC TypeScript, 50 source files.

**Target users:** Content creators making music videos for TikTok, YouTube, Instagram. Music producers wanting visualizers. Anyone who wants to turn audio into shareable video without learning After Effects.

**Technical environment:**
- Modern browsers with Web Audio API and Canvas support
- Deployed to GitHub Pages (static hosting, no server)
- Performance-critical: Achieved 60 FPS rendering
- Export via MediaRecorder API (WebM with VP9/Opus)

**Preset philosophy:**
Each preset is a complete visual language, not just settings. They differ in:
- Aspect ratio (9:16 vs 16:9)
- Energy level (explosive vs atmospheric)
- Text treatment (bold/centered vs minimal vs karaoke)
- Color palette (vibrant vs cinematic vs neon)
- Motion intensity (constant vs smooth)

## Constraints

- **Tech stack**: Vite 7.x + React 19 + TypeScript (strict mode)
- **Rendering**: Canvas 2D with devicePixelRatio scaling
- **Audio**: Web Audio API with AnalyserNode (fftSize 2048)
- **Deployment**: GitHub Pages at /Meet-the-Beat-main/ base path
- **Performance**: 60 FPS achieved, memory stable
- **Offline**: Workbox PWA with generateSW mode

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% client-side architecture | No server costs, instant deployment, user privacy | Good |
| Preset-based UX over timeline editing | Lower complexity, faster creation, focused scope | Good |
| Beat-reactive as core differentiator | This is what makes visualizers feel alive vs static | Good |
| Canvas 2D over WebGL | Simpler implementation, sufficient for current visualizers | Good |
| Callback-based canvas access | Simpler than forwardRef for export integration | Good |
| Energy-based beat detection | 1.3x threshold + 100ms cooldown feels tight | Good |
| CSS aspect ratio for presets | Simpler than canvas dimension recalculation | Good |
| Reverted particle system | Performance concerns, visual clutter | Good |

---
*Last updated: 2025-01-16 after v0.1 milestone*
