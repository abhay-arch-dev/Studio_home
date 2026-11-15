import React from 'react';

interface AssumptionsProps {
  assumptions: string[];
}

export const Assumptions: React.FC<AssumptionsProps> = ({ assumptions }) => {
  return (
    <section className="band" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <h2>Assumptions</h2>
        <ul className="as">
          {assumptions.map((text, i) => (
            <li key={i}>{text}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
