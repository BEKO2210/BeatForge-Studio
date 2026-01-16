# BeatForge Studio

[![Ask DeepWiki](https://devin.ai/assets/askdeepwiki.png)](https://deepwiki.com/BEKO2210/BeatForge-Studio)

BeatForge Studio is a browser-based music visualizer that transforms your audio into professional, beat-reactive videos. Built with React, TypeScript, and Vite, it runs entirely in your browser with no server-side processing required. Upload your music, choose a visual style, add text, and export a video ready for social media.

**[Live Demo](https://beko2210.github.io/BeatForge-Studio/)**

## Features

- **Real-Time Audio Analysis**: Utilizes the Web Audio API for high-performance beat detection and frequency analysis.
- **Beat-Reactive Visualizers**: A collection of dynamic visualizers that pulse, glow, and animate in sync with your music. Includes:
  - **Spectrum**: A scrolling spectrogram showing frequency over time.
  - **Club**: A high-energy equalizer with bass emphasis and peak holds.
  - **Wave**: A continuous line waveform with a mirrored reflection.
  - **Circular**: A radial frequency spectrum with rotating trails.
- **Customizable Overlays**:
  - **Text Layers**: Add multiple animated text layers with custom fonts, styles, and beat-reactive effects.
  - **Backgrounds**: Set a solid color, create multi-stop linear/radial gradients, or upload your own image.
- **Cinematic Effects**: Add a professional touch with camera shake on strong beats and a subtle vignette overlay.
- **Style Presets**: Instantly switch between four distinct visual themes tailored for different platforms and aesthetics:
  - **TikTok**: High-energy, vertical 9:16 format with bold text.
  - **YouTube**: Cinematic, 16:9 widescreen with calm transitions.
  - **Lyric Video**: Text-focused design with soft backgrounds.
  - **Club Visualizer**: Dark, neon aesthetic with maximum energy.
- **Video Export**: Export your creation as a **WebM** video file with synchronized audio, available in 720p and 1080p resolutions.
- **Progressive Web App (PWA)**: Installable on mobile and desktop for offline access.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Audio Processing**: Web Audio API (`AudioContext`, `AnalyserNode`)
- **Rendering**: HTML5 Canvas 2D API (`requestAnimationFrame`)
- **Video Export**: MediaRecorder API (capturing `canvas.captureStream` and an `AudioDestinationNode` stream)
- **Offline Support**: PWA with Workbox

## How It Works

BeatForge Studio is a fully client-side application that leverages modern browser APIs to create music visualizations.

1.  **Audio Engine**: The `AudioEngine` class manages audio loading, playback, and analysis. It uses an `AnalyserNode` to extract frequency and time-domain data from the audio source.
2.  **Beat Detection**: The `BeatDetector` class processes the `AnalyserNode`'s output, using an energy-based algorithm on bass frequencies to detect beats in real-time. It provides a `beatInfo` object on every frame.
3.  **Rendering Engine**: A custom `Renderer` class orchestrates a 60 FPS `requestAnimationFrame` loop, managing a dedicated Canvas element. It supports layered rendering, ensuring backgrounds, visualizers, and text are drawn in the correct order.
4.  **Reactivity**: The `useBeatReaction` hook converts discrete beat events into smooth, animated values using custom easing functions. This allows visual elements (like scale, brightness, and glow) to pulse naturally with the music. The `useCameraShake` hook applies a similar principle for cinematic effects.
5.  **Export Pipeline**: The `VideoExporter` captures the canvas visuals using `captureStream()` and simultaneously routes the audio to a `MediaStreamAudioDestinationNode`. These two streams are combined by the `MediaRecorder` API and encoded into a WebM video file, which is then downloaded by the user.

## Project Structure

The codebase is organized into modules based on functionality:

```
src/
├── audio/          # Core audio processing, beat detection
├── components/     # UI components (player, editors, etc.)
├── visualizers/    # Visualizer components and the main container
├── renderer/       # Canvas 2D rendering engine
├── text/           # Text rendering and animation system
├── background/     # Background rendering system
├── effects/        # Post-processing effects (vignette, shake)
├── export/         # Video export logic
├── hooks/          # Custom React hooks for reactivity
├── presets/        # Definitions for the four visual style presets
├── tier/           # Free/Pro tier logic
├── App.tsx         # Main application component
└── main.tsx        # Application entry point
```

## Getting Started

To run the project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/beko2210/BeatForge-Studio.git
    cd BeatForge-Studio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Available Scripts

-   `npm run dev`: Starts the Vite development server with Hot Module Replacement (HMR).
-   `npm run build`: Compiles the TypeScript code and bundles the application for production.
-   `npm run preview`: Serves the production build locally to preview the final app.
-   `npm run lint`: Runs ESLint to check for code quality and style issues.