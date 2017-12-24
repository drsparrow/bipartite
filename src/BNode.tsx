import * as React from 'react';
import { NodePosition } from './Bipartite';
import { Color } from './colorHelper';

interface Props {
  pos: NodePosition;
  height: number;
  onClick: () => void;
  isSelected: boolean;
  color: Color;
}

export const NODE_WIDTH = 10;

export default function BNode (props: Props) {
  const {pos, height, onClick, isSelected, color} = props;
  const {x, y} = pos;
  return (
    <rect
      {...{x, y, height, onClick}}
      className="BNode"
      x={pos.x}
      y={pos.y}
      width={NODE_WIDTH}
      fill={isSelected ? color : 'black'}
    />
  );
}
