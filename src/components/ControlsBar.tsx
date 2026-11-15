import React from 'react';
import { CameraViewConfig, FINISHES, TEXTILE_PALETTES } from '../config';

interface ControlsBarProps {
  views: Record<string, CameraViewConfig>;
  activeViewId: string;
  onSelectView: (viewId: string) => void;

  activePaletteKey: string;
  onSelectPalette: (paletteKey: string) => void;

  isDay: boolean;
  onToggleLight: (day: boolean) => void;

  captionsOn: boolean;
  onToggleCaptions: () => void;
  showCategory: { yours: boolean; new: boolean; room: boolean };
  onToggleCategory: (category: 'yours' | 'new' | 'room') => void;

  finishes: {
    bed: string;
    ward: string;
    desk: string;
    all?: string;
  };
  onSelectFinish: (group: 'all' | 'bed' | 'ward' | 'desk', finishKey: string) => void;
  layoutVariant: string;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  views,
  activeViewId,
  onSelectView,
  activePaletteKey,
  onSelectPalette,
  isDay,
  onToggleLight,
  captionsOn,
  onToggleCaptions,
  showCategory,
  onToggleCategory,
  finishes,
  onSelectFinish,
  layoutVariant,
}) => {
  const isAllSame = finishes.bed === finishes.ward && finishes.bed === finishes.desk;
  const allLabel = isAllSame ? FINISHES[finishes.bed]?.name : 'mixed';

  const finishList = Object.values(FINISHES);

  return (
    <div className="controls-container">
      {/* Primary Toolbar: Camera, Textiles, Light, Captions */}
      <div className="bar">
        <div className="grp" id="views">
          <span>Camera</span>
          {Object.values(views).map((v) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={activeViewId === v.id ? 'true' : 'false'}
              onClick={() => onSelectView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="grp" id="pals">
          <span>Textiles</span>
          {Object.values(TEXTILE_PALETTES).map((pal) => (
            <button
              key={pal.id}
              type="button"
              aria-pressed={activePaletteKey === pal.id ? 'true' : 'false'}
              onClick={() => onSelectPalette(pal.id)}
            >
              <i
                className="sw"
                style={{ background: `#${pal.throwColor.toString(16).padStart(6, '0')}` }}
              />
              {pal.name}
            </button>
          ))}
        </div>

        <div className="grp">
          <span>Light</span>
          <button
            type="button"
            id="day"
            aria-pressed={isDay ? 'true' : 'false'}
            onClick={() => onToggleLight(true)}
          >
            Morning sun
          </button>
          <button
            type="button"
            id="eve"
            aria-pressed={!isDay ? 'true' : 'false'}
            onClick={() => onToggleLight(false)}
          >
            Evening
          </button>
        </div>

        <div className="grp" id="tags">
          <span>Captions</span>
          <button
            type="button"
            className="cap"
            aria-pressed={captionsOn ? 'true' : 'false'}
            onClick={onToggleCaptions}
          >
            {captionsOn ? 'Captions on' : 'Captions off'}
          </button>
          <button
            type="button"
            disabled={!captionsOn}
            aria-pressed={showCategory.yours ? 'true' : 'false'}
            onClick={() => onToggleCategory('yours')}
          >
            Your items
          </button>
          <button
            type="button"
            disabled={!captionsOn}
            aria-pressed={showCategory.new ? 'true' : 'false'}
            onClick={() => onToggleCategory('new')}
          >
            Add-ons
          </button>
          <button
            type="button"
            disabled={!captionsOn}
            aria-pressed={showCategory.room ? 'true' : 'false'}
            onClick={() => onToggleCategory('room')}
          >
            Room
          </button>
        </div>
      </div>

      {/* Finish Swatches Section */}
      <div className="bar fins">
        <div className="grp" id="finAll">
          <span>
            All furniture <b className="cur">: {allLabel}</b>
          </span>
          {finishList.map((f) => (
            <button
              key={f.id}
              type="button"
              className="swb"
              title={f.name}
              aria-label={f.name}
              aria-pressed={isAllSame && finishes.bed === f.id ? 'true' : 'false'}
              onClick={() => onSelectFinish('all', f.id)}
            >
              <i style={{ background: f.hex }} />
            </button>
          ))}
        </div>
      </div>

      <div className="bar fins">
        <div className="grp" id="finBed">
          <span>
            {layoutVariant === 'layout-b' ? 'Bed, side table & TV unit' : 'Bed, side table & shelf'}{' '}
            <b className="cur">: {FINISHES[finishes.bed]?.name}</b>
          </span>
          {finishList.map((f) => (
            <button
              key={f.id}
              type="button"
              className="swb"
              title={f.name}
              aria-label={f.name}
              aria-pressed={finishes.bed === f.id ? 'true' : 'false'}
              onClick={() => onSelectFinish('bed', f.id)}
            >
              <i style={{ background: f.hex }} />
            </button>
          ))}
        </div>
      </div>

      <div className="bar fins">
        <div className="grp" id="finWard">
          <span>
            Wardrobe <b className="cur">: {FINISHES[finishes.ward]?.name}</b>
          </span>
          {finishList.map((f) => (
            <button
              key={f.id}
              type="button"
              className="swb"
              title={f.name}
              aria-label={f.name}
              aria-pressed={finishes.ward === f.id ? 'true' : 'false'}
              onClick={() => onSelectFinish('ward', f.id)}
            >
              <i style={{ background: f.hex }} />
            </button>
          ))}
        </div>
      </div>

      <div className="bar fins">
        <div className="grp" id="finDesk">
          <span>
            Desk top <b className="cur">: {FINISHES[finishes.desk]?.name}</b>
          </span>
          {finishList.map((f) => (
            <button
              key={f.id}
              type="button"
              className="swb"
              title={f.name}
              aria-label={f.name}
              aria-pressed={finishes.desk === f.id ? 'true' : 'false'}
              onClick={() => onSelectFinish('desk', f.id)}
            >
              <i style={{ background: f.hex }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
