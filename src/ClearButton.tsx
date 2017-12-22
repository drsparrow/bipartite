import * as React from "react";

interface Props {
  onClick: () => void;
  className: string;
  setSize: number;
}

export default function ClearButton (props: Props) {
  const {onClick, className, setSize} = props;
  const disabled = setSize === 0;

  return (
    <span className={className}>
      <div>{setSize} nodes selected</div>
      <button {...{onClick, disabled, className}}>clear</button>
    </span>
  );
}
