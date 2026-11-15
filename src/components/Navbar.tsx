import React from 'react';
import { LayoutVariant } from '../config';

interface NavbarProps {
  currentLayout: LayoutVariant;
  onSelectLayout: (variant: LayoutVariant) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentLayout, onSelectLayout }) => {
  return (
    <nav className="nav">
      <div className="wrap navin">
        <a className="brand" href="#top">
          Studio Stay
        </a>
        <div className="links">
          <a href="#design">3D design</a>
          <a href="#layout">Layout</a>
          <a href="#shop">Shopping list</a>
          <button
            type="button"
            className="layout-toggle-btn"
            onClick={() => onSelectLayout(currentLayout === 'layout-b' ? 'layout-a' : 'layout-b')}
            title="Switch between Layout A and Layout B"
          >
            Switch to {currentLayout === 'layout-b' ? 'Layout A' : 'Layout B'}
          </button>
        </div>
      </div>
    </nav>
  );
};
