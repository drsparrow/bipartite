import * as React from "react";
import {NodePosition} from "./Bipartite";

interface Props {
  pos: NodePosition;
  height: number;
  onClick: () => void;
  isSelected: boolean;
}

export default function BNode (props: Props) {
  const {pos, height, onClick, isSelected} = props;
  const {x, y} = pos;
  return (
    <rect
      {...{x, y, height, onClick}}
      x={pos.x}
      y={pos.y}
      width="10"
      fill={isSelected ? 'gray' : 'red'}
    />
  );
}
