# Roadmap: BeatForge Studio

## Overview

Build a browser-based music visualizer creator from the ground up. Start with audio infrastructure and canvas rendering, layer in visualizers and beat-reactive animations, then add text/background systems, presets, and finally export and platform polish. Each phase delivers a working, testable capability that builds toward the full product.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation** - Project setup with Vite, React, TypeScript, and basic architecture
- [x] **Phase 2: Audio Engine** - Audio upload, playback, and Web Audio API integration
- [x] **Phase 3: Beat Detection** - Real-time beat detection and frequency analysis
- [x] **Phase 4: Canvas Renderer** - Rendering engine with Canvas 2D/WebGL foundation
- [x] **Phase 5: Visualizers** - Equalizer bars, waveform, and circular spectrum visualizers
- [x] **Phase 6: Beat Reactivity** - Animation system connecting audio analysis to visual elements
- [ ] **Phase 7: Text System** - Text layers with animations and styling
- [ ] **Phase 8: Background System** - Solid, gradient, and image backgrounds
- [ ] **Phase 9: Effects** - Camera shake, post-processing, and visual effects
- [ ] **Phase 10: Presets** - Four distinct style presets (TikTok, YouTube, Lyric, Club)
- [ ] **Phase 11: Export Pipeline** - Video encoding and export functionality
- [ ] **Phase 12: Platform Polish** - Responsive UI, offline capability, monetization

## Phase Details

### Phase 1: Foundation
**Goal**: Project scaffolding with Vite + React + TypeScript, basic component structure, and development workflow
**Depends on**: Nothing (first phase)
**Requirements**: PLT-05
**Success Criteria** (what must be TRUE):
  1. Project builds without errors using Vite
  2. Development server runs locally with hot reload
  3. Basic app shell renders in browser
  4. TypeScript strict mode enabled with no errors
**Research**: Unlikely (established patterns with Vite + React)
**Plans**: 1

### Phase 2: Audio Engine
**Goal**: Users can upload audio files and control playback
**Depends on**: Phase 1
**Requirements**: AUD-01, AUD-04
**Success Criteria** (what must be TRUE):
  1. User can upload MP3 and WAV files via drag-drop or file picker
  2. Audio plays in browser with play/pause controls
  3. Seek bar allows jumping to any position in the track
  4. Current time and duration are displayed
**Research**: Unlikely (Web Audio API is well-documented)
**Plans**: TBD

### Phase 3: Beat Detection
**Goal**: Real-time audio analysis providing beat and frequency data
**Depends on**: Phase 2
**Requirements**: AUD-02, AUD-03
**Success Criteria** (what must be TRUE):
  1. System detects beats in real-time as audio plays
  2. Frequency bands (bass, mid, treble) are analyzed per frame
  3. Beat events are emitted that other systems can subscribe to
  4. Analysis runs at 60 FPS without audio lag
**Research**: Likely (beat detection algorithms, FFT optimization)
**Research topics**: Beat detection algorithms (peak detection, onset detection), Web Audio AnalyserNode configuration, frequency band splitting strategies
**Plans**: TBD

### Phase 4: Canvas Renderer
**Goal**: Rendering engine capable of drawing and animating visual elements at 60 FPS
**Depends on**: Phase 1
**Requirements**: PRV-01
**Success Criteria** (what must be TRUE):
  1. Canvas renders at consistent 60 FPS
  2. Render loop uses requestAnimationFrame
  3. Canvas resizes responsively without distortion
  4. Basic shapes (rectangles, circles, lines) can be drawn
**Research**: Unlikely (standard Canvas 2D patterns)
**Plans**: 1

### Phase 5: Visualizers
**Goal**: Core visualizers (equalizer, waveform, circular spectrum) render audio data
**Depends on**: Phase 3, Phase 4
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. Equalizer bars visualizer displays frequency data
  2. Waveform visualizer shows audio waveform shape
  3. Circular spectrum visualizer renders frequency as radial pattern
  4. All visualizers update in sync with audio playback
**Research**: Unlikely (standard visualization patterns)
**Plans**: TBD

### Phase 6: Beat Reactivity
**Goal**: Visual elements respond dynamically to beats and audio energy
**Depends on**: Phase 3, Phase 5
**Requirements**: FX-01
**Success Criteria** (what must be TRUE):
  1. Visualizers pulse/scale on detected beats
  2. Beat intensity affects animation magnitude
  3. Smooth easing between beat reactions (not jarring)
  4. Beat reactivity feels tight with minimal latency
**Research**: Likely (animation easing, latency compensation)
**Research topics**: Animation easing functions for beat reactions, audio-visual sync latency, energy mapping curves
**Plans**: TBD

### Phase 7: Text System
**Goal**: Users can add and style text layers with animations
**Depends on**: Phase 4, Phase 6
**Requirements**: TXT-01, TXT-02, TXT-03, TXT-04
**Success Criteria** (what must be TRUE):
  1. User can add text layers with custom content
  2. Text has animation options (fade, slide, scale)
  3. Font family and size can be customized
  4. Text can be positioned anywhere on canvas
**Research**: Unlikely (canvas text rendering is standard)
**Plans**: TBD

### Phase 8: Background System
**Goal**: Customizable backgrounds (solid, gradient, image)
**Depends on**: Phase 4
**Requirements**: BG-01, BG-02, BG-03
**Success Criteria** (what must be TRUE):
  1. User can select solid color backgrounds
  2. User can create gradient backgrounds (linear, radial)
  3. User can upload image as background
  4. Background renders behind all other layers
**Research**: Unlikely (standard canvas patterns)
**Plans**: TBD

### Phase 9: Effects
**Goal**: Visual effects including camera shake and post-processing
**Depends on**: Phase 6
**Requirements**: FX-02, FX-03, VIS-04, VIS-05
**Success Criteria** (what must be TRUE):
  1. Camera shake effect triggers on strong beats
  2. Bloom/glow effect on bright elements
  3. Vignette effect darkens edges
  4. Particle system emits and animates particles
**Research**: Likely (WebGL shaders, particle systems)
**Research topics**: Canvas/WebGL post-processing techniques, particle system performance, camera shake algorithms
**Plans**: TBD

### Phase 10: Presets
**Goal**: Four complete style presets with distinct visual languages
**Depends on**: Phase 5, Phase 6, Phase 7, Phase 8, Phase 9
**Requirements**: PRE-01, PRE-02, PRE-03, PRE-04, PRE-05
**Success Criteria** (what must be TRUE):
  1. TikTok preset: 9:16, high energy, bold centered text, constant movement
  2. YouTube preset: 16:9, cinematic, calm transitions, minimal text
  3. Lyric Video preset: text-centric, karaoke animation, soft backgrounds
  4. Club Visualizer preset: dark, neon, strong equalizer, rave aesthetic
  5. User can tweak preset parameters
**Research**: Unlikely (applying existing systems with different values)
**Plans**: TBD

### Phase 11: Export Pipeline
**Goal**: Users can export their creation as video files
**Depends on**: Phase 10, PRV-01
**Requirements**: EXP-01, EXP-02, EXP-03, EXP-04, PRV-02
**Success Criteria** (what must be TRUE):
  1. User can export to WebM format
  2. User can select resolution (720p, 1080p)
  3. Export progress is shown during encoding
  4. Exported video plays correctly with audio synced
**Research**: Likely (MediaRecorder API, WebCodecs, video encoding)
**Research topics**: MediaRecorder API for canvas, WebCodecs for MP4, audio-video muxing, encoding performance
**Plans**: TBD

### Phase 12: Platform Polish
**Goal**: Production-ready with responsive UI, offline support, and monetization
**Depends on**: Phase 11
**Requirements**: PLT-01, PLT-02, PLT-03, PLT-04
**Success Criteria** (what must be TRUE):
  1. UI works on desktop and mobile (responsive breakpoints)
  2. App works offline after first load (service worker)
  3. Free tier shows watermark and limits export resolution
  4. Pro tier unlocks full features (payment integration TBD)
**Research**: Likely (service workers, payment integration)
**Research topics**: Service worker caching strategies, payment provider options (Stripe, Paddle), watermark implementation
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11 → 12

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/1 | Complete | 2025-01-15 |
| 2. Audio Engine | 1/1 | Complete | 2025-01-15 |
| 3. Beat Detection | 2/2 | Complete | 2025-01-15 |
| 4. Canvas Renderer | 1/1 | Complete | 2025-01-15 |
| 5. Visualizers | 3/3 | Complete | 2025-01-15 |
| 6. Beat Reactivity | 2/2 | Complete | 2025-01-16 |
| 7. Text System | 0/TBD | Not started | - |
| 8. Background System | 0/TBD | Not started | - |
| 9. Effects | 0/TBD | Not started | - |
| 10. Presets | 0/TBD | Not started | - |
| 11. Export Pipeline | 0/TBD | Not started | - |
| 12. Platform Polish | 0/TBD | Not started | - |
