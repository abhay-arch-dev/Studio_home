import React from 'react';
import { UI_CONSTANTS } from '../config';

export const Footer: React.FC = () => {
  return (
    <footer className="band foot">
      <div className="wrap">{UI_CONSTANTS.footerNote}</div>
    </footer>
  );
};
