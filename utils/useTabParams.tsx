import { useSegments, useUnstableGlobalHref } from "expo-router";

export function useTabParams() {
  const _href = useUnstableGlobalHref();
  const slug = useSegments();
  if (slug[0] === "(app)") slug.shift();

  let href = _href.substring(1).split("?");
  href = href[0].split("/");

  /**
   * href: ['e7e481f1-f6d1-4ec2-8bdf-13ed66da4ae9', 'collections', 'db79f921-0524-490f-a416-365dfbada9fb', 'agenda', 'start=2024-01-21']
   * slug: ['[tab]', 'collections', '[id]', '[type]']
   */
  // if brackets are present, then it's a param. iterate through slug and replace with href
  const params = {};
  for (let i = 0; i < slug.length; i++) {
    if (slug[i].startsWith("[")) {
      params[slug[i].substring(1, slug[i].length - 1)] = decodeURIComponent(
        href[i]
      );
    }
  }

  // Now, deal with query string
  // _href.split("?")[1]
  if (_href.includes("?")) {
    const query = Object.fromEntries(new URLSearchParams(_href.split("?")[1]));
    // decode uri components of query
    for (const key in query) {
      query[key] = decodeURIComponent(query[key]);
    }
    return { ...params, ...query };
  }
  console.log("params", params);
  return params;
}
