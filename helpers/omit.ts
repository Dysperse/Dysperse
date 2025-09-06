export function omit(keys, obj) {
  const filteredObj = { ...obj };
  keys.forEach((key) => delete filteredObj[key]);
  return filteredObj;
}

export function omitSingle(key, obj) {
  const filteredObj = { ...obj };
  delete filteredObj[key];
  return filteredObj;
}

