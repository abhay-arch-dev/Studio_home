import React from 'react';
import { ShoppingListItem, UI_CONSTANTS } from '../config';

interface ShoppingListTableProps {
  items: ShoppingListItem[];
}

export const ShoppingListTable: React.FC<ShoppingListTableProps> = ({ items }) => {
  const formatInr = (n: number) => `${UI_CONSTANTS.currencySymbol}${n.toLocaleString(UI_CONSTANTS.currencyLocale)}`;

  const totalMin = items.reduce((acc, r) => acc + r.minPrice, 0);
  const totalMax = items.reduce((acc, r) => acc + r.maxPrice, 0);

  return (
    <div id="shop">
      <h2>What to add to finish the look</h2>
      <table className="stack">
        <thead>
          <tr>
            <th>Add-on</th>
            <th>Spec</th>
            <th className="num">Approx. ₹</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r, index) => (
            <tr key={index}>
              <td data-l="Add-on">{r.item}</td>
              <td data-l="Spec">{r.spec}</td>
              <td className="num" data-l="Approx.">
                {formatInr(r.minPrice)}–{formatInr(r.maxPrice)}
              </td>
            </tr>
          ))}
          <tr className="tot">
            <td data-l="">Total</td>
            <td data-l=""></td>
            <td className="num" data-l="Approx.">
              {formatInr(totalMin)}–{formatInr(totalMax)}
            </td>
          </tr>
        </tbody>
      </table>
      <p className="note">
        Prices are rough Indian online price ranges, not quotes. Check before you buy. Nothing on the list needs
        painting, and only the mirror, shelf and hooks need drilling.
      </p>
    </div>
  );
};
