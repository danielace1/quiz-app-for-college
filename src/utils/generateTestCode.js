export const generateTestCode = () => {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const prefix = Array.from({ length: 3 }, () =>
    letters.charAt(Math.floor(Math.random() * letters.length))
  ).join("");
  const number = Math.floor(100 + Math.random() * 900); // 100-999
  return `${prefix}${number}`;
};
