export function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function randomColor() {
  function number() {
    return Math.floor(Math.random() * 256);
  }
  return [number(), number(), number()];
}

export function rgbHexToDec(hex) {
  return hex.replace('#','').match(/.{1,2}/g).map((p) => parseInt(p, 16));
}

export function rgbDecToHex(dec) {
  function format(i) {
    const h = i.toString(16);
    return h.length == 1 ? '0' + h : h;
  }
  return `#${dec.map(p => format(p)).join('')}`;
}

export function gradientColor(color, side) {
  const rgb = `rgba(${rgbHexToDec(color).join()},`;
  const parts = [
    'rgba(0,0,0,0.0)',
    'rgba(0,0,0,0.0)',
    `${rgb}0.6)`,
    `${rgb}1.0)`,
    `${rgb}1.0)`
  ];
  const angle = side === "left" ? '45deg' : '-45deg';
  return `linear-gradient(${angle},${parts.join(',')})`;
}

export function plainColor(color, sied) {
  return color
}
