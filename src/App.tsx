import React, { useEffect, useState } from 'react';
import { Assumptions } from './components/Assumptions';
import { ControlsBar } from './components/ControlsBar';
import { Footer } from './components/Footer';
import { HeaderBanner } from './components/HeaderBanner';
import { Navbar } from './components/Navbar';
import { PlacementTable } from './components/PlacementTable';
import { ShoppingListTable } from './components/ShoppingListTable';
import { StudioCanvas } from './components/StudioCanvas';
import {
  DEFAULT_FINISH_KEY,
  DEFAULT_LAYOUT_ID,
  DEFAULT_PALETTE_KEY,
  LAYOUTS,
  LayoutVariant,
} from './config';

export const App: React.FC = () => {
  const [currentLayoutId, setCurrentLayoutId] = useState<LayoutVariant>(DEFAULT_LAYOUT_ID);
  const layout = LAYOUTS[currentLayoutId];

  const [activeViewId, setActiveViewId] = useState<string>('overview');
  const [activePaletteKey, setActivePaletteKey] = useState<string>(DEFAULT_PALETTE_KEY);
  const [isDay, setIsDay] = useState<boolean>(true);

  const [captionsOn, setCaptionsOn] = useState<boolean>(true);
  const [showCategory, setShowCategory] = useState<{ yours: boolean; new: boolean; room: boolean }>({
    yours: true,
    new: false,
    room: false,
  });

  const [finishes, setFinishes] = useState<{ bed: string; ward: string; desk: string }>({
    bed: DEFAULT_FINISH_KEY,
    ward: DEFAULT_FINISH_KEY,
    desk: DEFAULT_FINISH_KEY,
  });

  // Update document title dynamically
  useEffect(() => {
    document.title = layout.pageTitle;
  }, [layout]);

  const handleSelectLayout = (variant: LayoutVariant) => {
    setCurrentLayoutId(variant);
    setActiveViewId('overview');
  };

  const handleToggleCaptions = () => {
    setCaptionsOn((prev) => !prev);
  };

  const handleToggleCategory = (cat: 'yours' | 'new' | 'room') => {
    setShowCategory((prev) => {
      const next = { ...prev, [cat]: !prev[cat] };
      if (next[cat] && !captionsOn) {
        setCaptionsOn(true);
      }
      return next;
    });
  };

  const handleSelectFinish = (group: 'all' | 'bed' | 'ward' | 'desk', finishKey: string) => {
    if (group === 'all') {
      setFinishes({ bed: finishKey, ward: finishKey, desk: finishKey });
    } else {
      setFinishes((prev) => ({ ...prev, [group]: finishKey }));
    }
  };

  return (
    <div className="app-root">
      <Navbar currentLayout={currentLayoutId} onSelectLayout={handleSelectLayout} />

      <HeaderBanner layout={layout} />

      {/* 3D Design Section */}
      <section className="band" style={{ paddingTop: 0 }} id="design">
        <div className="wrap">
          <StudioCanvas
            layoutVariant={currentLayoutId}
            views={layout.views}
            activeViewId={activeViewId}
            labels={layout.labels}
            captionsOn={captionsOn}
            onToggleCaptions={handleToggleCaptions}
            showCategory={showCategory}
            isDay={isDay}
            activePaletteKey={activePaletteKey}
            finishes={finishes}
          />

          <ControlsBar
            views={layout.views}
            activeViewId={activeViewId}
            onSelectView={setActiveViewId}
            activePaletteKey={activePaletteKey}
            onSelectPalette={setActivePaletteKey}
            isDay={isDay}
            onToggleLight={setIsDay}
            captionsOn={captionsOn}
            onToggleCaptions={handleToggleCaptions}
            showCategory={showCategory}
            onToggleCategory={handleToggleCategory}
            finishes={finishes}
            onSelectFinish={handleSelectFinish}
            layoutVariant={currentLayoutId}
          />
        </div>
      </section>

      {/* Placement & Shopping Details */}
      <section className="band" style={{ paddingTop: '8px' }}>
        <div className="wrap cols">
          <PlacementTable items={layout.placements} />
          <ShoppingListTable items={layout.shoppingList} />
        </div>
      </section>

      {/* Assumptions */}
      <Assumptions assumptions={layout.assumptions} />

      {/* Footer */}
      <Footer />
    </div>
  );
};
