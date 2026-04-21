export const userStringToColor = (string: string) => {
  let hash = 0;

  for (const char of string) {
    hash = char.codePointAt(0)! + ((hash << 5) - hash);
  }

  let color = "#";

  for (let i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
};