export function stringifyJsonIntegers(raw) {
  if (typeof raw !== 'string') throw new TypeError('Expected JSON text');
  let out = '';
  let i = 0;
  let inString = false;
  let escaped = false;

  while (i < raw.length) {
    const ch = raw[i];

    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      i += 1;
      continue;
    }

    if (ch === '"') {
      inString = true;
      out += ch;
      i += 1;
      continue;
    }

    const startsNumber = ch === '-' || (ch >= '0' && ch <= '9');
    if (!startsNumber) {
      out += ch;
      i += 1;
      continue;
    }

    let j = i;
    if (raw[j] === '-') j += 1;

    if (raw[j] === '0') {
      j += 1;
    } else {
      while (j < raw.length && raw[j] >= '0' && raw[j] <= '9') j += 1;
    }

    let integer = true;
    if (raw[j] === '.') {
      integer = false;
      j += 1;
      while (j < raw.length && raw[j] >= '0' && raw[j] <= '9') j += 1;
    }
    if (raw[j] === 'e' || raw[j] === 'E') {
      integer = false;
      j += 1;
      if (raw[j] === '+' || raw[j] === '-') j += 1;
      while (j < raw.length && raw[j] >= '0' && raw[j] <= '9') j += 1;
    }

    const token = raw.slice(i, j);
    out += integer ? `"${token}"` : token;
    i = j;
  }

  return out;
}

export function parseLosslessJson(value) {
  if (typeof value !== 'string') return value;
  return JSON.parse(stringifyJsonIntegers(value));
}
