import { COLLECTION_VIEWS } from "../command-palette/list";

export const useTabMetadata = (slug: string, tab: any) => {
  if (!slug) return { icon: "square" };

  const startWithMatchers = {
    "/[tab]/collections/": {
      icon: (params) => COLLECTION_VIEWS[params.type]?.icon,
      name: (params) =>
        [
          tab.collection ? "-" : undefined,
          params.type,
          tab.collection ? undefined : "All tasks",
        ].filter(Boolean),
    },
    "/[tab]/spaces/": {
      icon: "tag",
      name: () => ["Space"],
    },
    "/[tab]/labels/[id]": {
      icon: "label",
      name: () => [],
    },
    "/[tab]/welcome": {
      icon: "kid_star",
      name: () => ["Start here!", "Welcome to #dysperse!"],
    },
  };

  const match = Object.keys(startWithMatchers).find((key) =>
    slug.startsWith(key)
  );

  if (!startWithMatchers[match]) return { icon: "square", name: () => [match] };

  return startWithMatchers[match];
};

