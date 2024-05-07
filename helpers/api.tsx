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
      Host: process.env.EXPO_PUBLIC_API_URL,
    },
    redirect: "follow",
    keepalive: true,
  }).then((res) => res.json());
}
