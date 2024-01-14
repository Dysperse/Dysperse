export function omit(key, obj) {
  const { [key]: _, ...rest } = obj;
  return rest;
}
