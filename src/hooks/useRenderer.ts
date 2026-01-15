import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { Renderer } from '../renderer/Renderer';
import type { RendererConfig } from '../renderer/types';

/**
 * React hook for managing Renderer lifecycle
 *
 * Handles:
 * - Renderer creation when canvas ref is available
 * - Automatic start of render loop
 * - Responsive resize via ResizeObserver
 * - Cleanup on unmount
 */
export function useRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  config: RendererConfig = {}
): { renderer: Renderer | null; isRunning: boolean } {
  const [renderer, setRenderer] = useState<Renderer | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create renderer instance
    const rendererInstance = new Renderer(canvas, config);
    setRenderer(rendererInstance);

    // Start render loop
    rendererInstance.start();
    setIsRunning(true);

    // Set up ResizeObserver on canvas parent for responsive sizing
    const parent = canvas.parentElement;
    if (parent) {
      resizeObserverRef.current = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width } = entry.contentRect;
          // Maintain aspect ratio or use fixed height
          const height = config.height ?? 400;
          rendererInstance.resize(width, height);
        }
      });

      resizeObserverRef.current.observe(parent);
    }

    // Cleanup on unmount
    return () => {
      rendererInstance.dispose();
      setRenderer(null);
      setIsRunning(false);

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
    };
    // Only re-run if canvas element changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef.current]);

  return { renderer, isRunning };
}
