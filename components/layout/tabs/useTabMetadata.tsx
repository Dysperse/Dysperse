import { collectionViews } from "../command-palette/list";

export const useTabMetadata = (slug: string, tab: any) => {
  if (!slug) return { icon: "square" };

  const startWithMatchers = {
    "/[tab]/collections/": {
      icon: (params) => collectionViews[params.type],
      name: (params) => ["Everything", params.type],
    },
    "/[tab]/spaces/": {
      icon: "tag",
      name: (params) => ["Space"],
    },
    "/[tab]/labels/[id]": {
      icon: "label",
      name: () => [],
    },
  };

  const match = Object.keys(startWithMatchers).find((key) =>
    slug.startsWith(key)
  );
  if (!startWithMatchers[match])
    return { icon: "square", name: (params, slug) => [match] };
  return startWithMatchers[match];
};
