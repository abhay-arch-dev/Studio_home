import React from 'react';
import { FurniturePlacementItem } from '../config';

interface PlacementTableProps {
  items: FurniturePlacementItem[];
}

export const PlacementTable: React.FC<PlacementTableProps> = ({ items }) => {
  return (
    <div id="layout">
      <h2>Where your things go</h2>
      <table className="stack">
        <thead>
          <tr>
            <th>Item</th>
            <th>Placement</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, index) => (
            <tr key={index}>
              <td data-l="Item">{r.item}</td>
              <td data-l="Placement">{r.placement}</td>
              <td data-l="Why">{r.why}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
