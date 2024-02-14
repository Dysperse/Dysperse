export function sendApiRequest(
  session,
  method: "GET" | "POST" | "PUT" | "DELETE",
  path,
  params = {},
  options = {},
  etc = { host: process.env.EXPO_PUBLIC_API_URL }
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
      Host: process.env.EXPO_PUBLIC_API_URL.replace("https://", "").replace(
        "http://",
        ""
      ),
    },
    mode: "cors",
    keepalive: true,
  }).then((res) => res.json());
}
