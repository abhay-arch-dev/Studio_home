import React from 'react';
import { LayoutConfig } from '../config';

interface HeaderBannerProps {
  layout: LayoutConfig;
}

export const HeaderBanner: React.FC<HeaderBannerProps> = ({ layout }) => {
  return (
    <header className="band top" id="top">
      <div className="wrap">
        <h1>{layout.heading}</h1>
        <p className="sub">{layout.description}</p>
      </div>
    </header>
  );
};
