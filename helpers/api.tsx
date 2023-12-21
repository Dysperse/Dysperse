export function sendApiRequest(
  session,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path,
  params,
  options = {},
  etc = { host: "https://api.dysperse.com" }
) {
  const url = `${etc.host}/${path}${
    Object.keys(params).length > 0 ? "?" : ""
  }${new URLSearchParams(params)}`;
  console.log(`[${method.toUpperCase()}] `, url);

  return fetch(url, {
    ...options,
    method,
    headers: {
      ...(session && { Authorization: `Bearer ${session}` }),
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Host: "api.dysperse.com",
    },
    mode: "cors",
    keepalive: true,
  }).then((res) => res.json());
}
