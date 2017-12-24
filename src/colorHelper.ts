export type Color = string;
export const colorValToHsl = (val: number): Color => `hsl(${val}, 100%, 50%)`;
