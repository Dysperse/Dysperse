export function sendApiRequest(method, path, params, options = {}) {
  const url = `https://api.dysperse.com/${path}${
    Object.keys(params).length > 0 ? "?" : ""
  }${new URLSearchParams(params)}`;
  console.log("query url", url);

  return fetch(url, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      Host: "api.dysperse.com",
      "User-Agend": "HTTPie",
    },
    mode: "cors",
    keepalive: true,
  }).then((res) => res.json());
}
