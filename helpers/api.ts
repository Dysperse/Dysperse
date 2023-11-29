export function sendApiRequest(method, path, params, options = {}) {
  return fetch(
    `https://api.dysperse.com/${path}?${new URLSearchParams(params)}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      ...options,
    }
  ).then((res) => res.json());
}
