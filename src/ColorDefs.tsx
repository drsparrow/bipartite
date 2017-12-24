import * as React from 'react';

interface Props {
  sourceColor: string;
  targetColor: string;
}

export default function ColorDefs (props: Props) {
  const { sourceColor, targetColor } = props;
  return (
    <defs>
      <LinearGradient id="left-highlighted" color1={sourceColor} color2="black"/>
      <LinearGradient id="right-highlighted" color1="black" color2={targetColor}/>
      <LinearGradient id="both-highlighted" color1={sourceColor} color2={targetColor}/>
    </defs>
  );
}

function LinearGradient (props: {id: string, color1: string, color2: string}) {
  const { id, color1, color2 } = props;
  return (
    <linearGradient id={id}>
      <stop offset="0%" stopColor={color1}/>
      <stop offset="100%" stopColor={color2}/>
    </linearGradient>
  );
}
