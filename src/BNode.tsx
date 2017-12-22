import * as React from "react";
import {NodePosition} from "./Bipartite";

interface Props {
  pos: NodePosition;
  height: number;
  onClick: () => void;
  isSelected: boolean;
}

export const NODE_WIDTH = 10;

export default function BNode (props: Props) {
  const {pos, height, onClick, isSelected} = props;
  const {x, y} = pos;
  return (
    <rect
      {...{x, y, height, onClick}}
      className={`BNode ${isSelected ? 'selected' : ''}`}
      x={pos.x}
      y={pos.y}
      width={NODE_WIDTH}
    />
  );
}
