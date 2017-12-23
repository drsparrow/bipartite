import * as React from 'react';

interface Props {
  onClick: () => void;
  className: string;
  setSize: number;
  totalSize: number;
  setValue: number;
}

export default function ClearButton (props: Props) {
  const {onClick, className, setSize, setValue, totalSize} = props;
  const disabled = setSize === 0;

  return (
    <span className={className}>
      <div>{setSize} of {totalSize} selected (wt. {setValue})</div>
      <button {...{onClick, disabled, className}}>clear</button>
    </span>
  );
}
