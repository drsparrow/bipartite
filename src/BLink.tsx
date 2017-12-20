import * as React from "react";

interface Props {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  value?: number;
}

export default function BLink (props: Props) {
  const { x1, x2, y1, y2, value } = props;
  const midX = (x1 + x2) / 2;
  const d = `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`;
  return (
    <path d={d} fill="none" stroke="black" strokeWidth={value || 1}/>
  );
}
