export function omit(keys, obj) {
  const filteredObj = { ...obj };
  keys.forEach((key) => delete filteredObj[key]);
  return filteredObj;
}
