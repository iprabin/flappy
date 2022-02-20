export const checkIfColided = (
  bird: Position,
  pipe1: Position,
  pipe2: Position
) => {
  const birdPipeOne = rectOverlap(bird, pipe1);
  const birdPipeTwo = rectOverlap(bird, pipe2);

  if (birdPipeOne || birdPipeTwo) return true;

  return false;
};

const valueInRange = (value: number, min: number, max: number) => {
  return value >= min && value <= max;
};

const rectOverlap = (A: Position, B: Position) => {
  const xOverlap =
    valueInRange(A.x, B.x, B.x + B.width) ||
    valueInRange(B.x, A.x, A.x + A.width);

  const yOverlap =
    valueInRange(A.y, B.y, B.y + B.height) ||
    valueInRange(B.y, A.y, A.y + A.height);

  return xOverlap && yOverlap;
};

export type Position = {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
};
