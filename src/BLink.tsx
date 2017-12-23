import * as React from 'react';

interface Props {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  value: number;
  tightness: number;
  isLeftHighlighted: boolean;
  isRightHighlighted: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export default function BLink (props: Props) {
  const { x1, x2, y1, y2, value, tightness, isLeftHighlighted, isRightHighlighted, isSelected, onClick } = props;
  const midX = (x1 + x2) / 2;
  const midX1 = midX + (tightness * midX);
  const midX2 = midX - (tightness * midX);

  const iota = y1 === y2 ? 0.001 : 0; // hack. linearGradient does not work with straight lines
  const d = `M${x1},${y1} C${midX1},${y1+iota} ${midX2},${y2+iota} ${x2},${y2}`;

  return (
    <path
      {...{d, onClick}}
      className={`BLink ${isSelected ? 'selected' : ''} ${isRightHighlighted ? 'right-highlighted' : ''}  ${isLeftHighlighted ? 'left-highlighted' : ''}`}
      fill="none"
      strokeWidth={value}
    />
  );
}
