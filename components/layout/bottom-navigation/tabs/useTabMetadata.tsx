export const useTabMetadata = (slug: string, tab: any) => {
  if (!slug) return { icon: "square" };

  const startWithMatchers = {
    "/[tab]/collections/": {
      icon: (params) =>
        ({
          agenda: "calendar_today",
          kanban: "view_kanban",
          stream: "view_agenda",
          grid: "view_cozy",
          workload: "exercise",
        }[params.type]),
      name: (params) => ["All", params.type],
    },
    "/[tab]/all/[type]": {
      icon: (params) => (params.type === "tasks" ? "task_alt" : "layers"),
      name: (params) => [params.type, "All"],
    },
    "/[tab]/spaces/": {
      icon: "tag",
      name: (params) => ["Space"],
    },
    "/[tab]/labels/[id]": {
      icon: "label",
      name: () => [],
    },
    "/[tab]/users/": {
      icon: "alternate_email",
      name: (params, slug) => [params.id],
    },
  };

  const match = Object.keys(startWithMatchers).find((key) =>
    slug.startsWith(key)
  );
  if (!startWithMatchers[match])
    return { icon: "square", name: (params, slug) => [match] };
  return startWithMatchers[match];
};
