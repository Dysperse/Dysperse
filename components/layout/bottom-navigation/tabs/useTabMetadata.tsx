import dayjs from "dayjs";

export const useTabMetadata = (slug: string) => {
  if (!slug) return { icon: "square" };
  
  const startWithMatchers = {
    "/[tab]/perspectives/": {
      icon: "asterisk",
      name: (params) => [
        params.type,
        `${dayjs(params.start).startOf(params.type).format("MMM Do")} - ${dayjs(
          params.start
        )
          .startOf(params.type)
          .add(1, params.type)
          .format("Do")}`,
      ],
    },
    "/[tab]/collections/": {
      icon: "draw_abstract",
      name: () => [],
    },
    "/[tab]/all/": {
      icon: "nest_true_radiant",
      name: (params, slug) => [slug.split("/all/")[1]],
    },
    "/[tab]/spaces/": {
      icon: "tag",
      name: (params) => ["Space"],
    },
    "/[tab]/users/": {
      icon: "alternate_email",
      name: (params, slug) => [params.id],
    },
  };

  const match = Object.keys(startWithMatchers).find((key) =>
    slug.startsWith(key)
  );
  if (!startWithMatchers[match]) return { icon: "square" };
  return startWithMatchers[match];
};
