import * as React from 'react';

interface Props {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: number;
}

export default function ColorSlider (props: Props) {
  const {onChange, value} = props;
  return (
    <input
      type="range"
      min="0"
      max="360"
      value={value}
      step="1"
      onChange={onChange}
    />
  );
}
