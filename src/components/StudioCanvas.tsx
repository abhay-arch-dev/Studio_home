import React, { useEffect, useRef, useState } from 'react';
import { StudioScene } from '../3d/StudioScene';
import { CameraViewConfig, LabelMarker, LayoutVariant, UI_CONSTANTS } from '../config';

interface StudioCanvasProps {
  layoutVariant: LayoutVariant;
  views: Record<string, CameraViewConfig>;
  activeViewId: string;
  labels: LabelMarker[];
  captionsOn: boolean;
  onToggleCaptions: () => void;
  showCategory: { yours: boolean; new: boolean; room: boolean };
  isDay: boolean;
  activePaletteKey: string;
  finishes: { bed: string; ward: string; desk: string };
}

interface ProjectedLabel {
  id: string;
  text: string;
  category: string;
  x: number;
  y: number;
  visible: boolean;
}

export const StudioCanvas: React.FC<StudioCanvasProps> = ({
  layoutVariant,
  views,
  activeViewId,
  labels,
  captionsOn,
  onToggleCaptions,
  showCategory,
  isDay,
  activePaletteKey,
  finishes,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<StudioScene | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [projectedLabels, setProjectedLabels] = useState<ProjectedLabel[]>([]);
  const [hasError, setHasError] = useState(false);

  // Initialize StudioScene
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const scene = new StudioScene(canvasRef.current);
      sceneRef.current = scene;

      // Set initial state
      scene.rebuildLayout(layoutVariant);
      scene.setLight(isDay);
      scene.setPalette(activePaletteKey);
      scene.setFinish('bed', finishes.bed);
      scene.setFinish('ward', finishes.ward);
      scene.setFinish('desk', finishes.desk);

      if (views[activeViewId]) {
        scene.setCameraView(views[activeViewId], true);
      }

      setHasError(false);
    } catch (err) {
      console.error('Failed to initialize 3D scene:', err);
      setHasError(true);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.destroy();
        sceneRef.current = null;
      }
    };
  }, []); // Run on mount

  // Handle ResizeObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && sceneRef.current) {
          sceneRef.current.resize(width, height);
        }
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Update layout variant
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.rebuildLayout(layoutVariant);
      if (views[activeViewId]) {
        sceneRef.current.setCameraView(views[activeViewId], true);
      }
    }
  }, [layoutVariant]);

  // Update camera view
  useEffect(() => {
    if (sceneRef.current && views[activeViewId]) {
      sceneRef.current.setCameraView(views[activeViewId], false);
    }
  }, [activeViewId, views]);

  // Update light
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setLight(isDay);
    }
  }, [isDay]);

  // Update palette
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setPalette(activePaletteKey);
    }
  }, [activePaletteKey]);

  // Update finishes
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setFinish('bed', finishes.bed);
      sceneRef.current.setFinish('ward', finishes.ward);
      sceneRef.current.setFinish('desk', finishes.desk);
    }
  }, [finishes]);

  // Update projected labels in sync with camera motion
  useEffect(() => {
    let animId: number;
    const updateLabels = () => {
      if (sceneRef.current) {
        const projected = sceneRef.current.projectLabels(labels, showCategory, captionsOn);
        setProjectedLabels(projected);
      }
      animId = requestAnimationFrame(updateLabels);
    };
    animId = requestAnimationFrame(updateLabels);
    return () => cancelAnimationFrame(animId);
  }, [labels, showCategory, captionsOn]);

  // Keyboard shortcut listener ('C' toggles captions, 'Escape' exits fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'c' || e.key === 'C') && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target && /INPUT|TEXTAREA|SELECT/.test(target.tagName)) return;
        onToggleCaptions();
      }
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleCaptions]);

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.classList.add('lock');
    } else {
      document.body.classList.remove('lock');
    }
  }, [isFullscreen]);

  const fsIconOpen = 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5';
  const fsIconClose = 'M6 6l12 12M18 6L6 18';

  return (
    <div id="stage" ref={stageRef} className={isFullscreen ? 'full' : ''}>
      <div id="view" ref={containerRef} style={{ background: isDay ? '#dde6ea' : '#1a2330' }}>
        <button
          type="button"
          id="fs"
          className="fsb"
          aria-pressed={isFullscreen ? 'true' : 'false'}
          aria-label={isFullscreen ? 'Close full screen and return to the page' : 'Open 3D view full screen'}
          onClick={toggleFullscreen}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              id="fsi"
              d={isFullscreen ? fsIconClose : fsIconOpen}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span id="fst">{isFullscreen ? 'Close' : 'Full screen'}</span>
        </button>

        <canvas id="c" ref={canvasRef} aria-label="Interactive 3D model of the furnished studio room" />

        {/* 3D Label Overlay */}
        <div id="labs" style={{ display: captionsOn ? 'block' : 'none' }}>
          {projectedLabels.map(
            (l) =>
              l.visible && (
                <div
                  key={l.id}
                  className={`lab ${l.category}`}
                  style={{
                    transform: `translate(${l.x}px, ${l.y}px) translate(-50%, -110%)`,
                  }}
                >
                  {l.text}
                </div>
              )
          )}
        </div>

        <div className="hint">{UI_CONSTANTS.controlsHint}</div>

        {hasError && (
          <div id="err">
            <p>The 3D model couldn’t load. Check your WebGL support and reload the page.</p>
          </div>
        )}
      </div>
    </div>
  );
};
