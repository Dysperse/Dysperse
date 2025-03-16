import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";

export const COLLECTION_VIEWS = {
  list: {
    icon: "view_agenda",
    description: "The good old trusty to-do list",
    type: "Category Based",
  },
  kanban: {
    icon: "view_kanban",
    description: "Organize tasks by category",
    type: "Category Based",
  },
  grid: {
    icon: "view_cozy",
    description: "Organize tasks in a grid by category",
    type: "Category Based",
  },
  skyline: {
    icon: "blur_linear",
    description: "Vision tasks in flexible time frames",
    type: "Time Based",
  },
  planner: {
    icon: "transition_slide",
    description: "View tasks day by day",
    type: "Time Based",
  },
  stream: {
    icon: "whatshot",
    description: "See missed, upcoming, & completed tasks",
    type: "Time Based",
  },
  calendar: {
    icon: "calendar_today",
    description: "The good old traditional calendar view",
    type: "Time Based",
  },
  workload: {
    icon: "exercise",
    description: "Sort tasks by an estimated difficulty",
    type: "Priority Based",
  },
  matrix: {
    icon: "target",
    description: "Prioritize tasks by urgency and importance",
    type: "Priority Based",
  },

  map: {
    icon: "location_on",
    description: "View tasks on a map",
    type: "Other",
  },
};

export const paletteItems = (
  collections,
  sharedCollections,
  labels
): { title: string; icon?: string; items: any[] }[] => {
  return [
    {
      title: "All tasks",
      icon: "shapes",
      items: Object.keys(COLLECTION_VIEWS).map((key) => ({
        label: capitalizeFirstLetter(key),
        key,
        icon: COLLECTION_VIEWS[key].icon,
        slug: "/[tab]/collections/[id]/[type]",
        about: COLLECTION_VIEWS[key].description,
        params: { type: key, id: "all" },
      })),
    },
    {
      title: "Collections",
      icon: "folder",
      items: [
        ...(collections && Array.isArray(collections)
          ? collections.map((collection) => ({
              label: collection.name,
              key: collection.id,
              icon: "grid_view",
              emoji: collection.emoji,
              data: collection,
              slug: "/[tab]/collections/[id]/[type]",
              params: {
                id: collection.id,
                type: collection.defaultView || "planner",
              },
            }))
          : [{}]),
      ],
    },
    sharedCollections &&
      sharedCollections.length > 0 && {
        title: "Shared with me",
        icon: "group",
        items:
          sharedCollections && Array.isArray(sharedCollections)
            ? sharedCollections.map((access) => ({
                hasSeen: access.hasSeen,
                label: access.collection.name,
                key: access.collection.id,
                icon: "grid_view",
                emoji: access.collection.emoji,
                data: access.collection,
                slug: "/[tab]/collections/[id]/[type]",
                params: { id: access.collection.id, type: "planner" },
              }))
            : [],
      },
    {
      title: "Labels",
      icon: "tag",
      items:
        labels && Array.isArray(labels)
          ? labels.map((access) => ({
              label: access.name,
              key: access.id,
              icon: "grid_view",
              emoji: access.emoji,
              slug: "/[tab]/labels/[id]",
              params: { id: access.id, type: "planner" },
            }))
          : [],
    },
    {
      title: "Other",
      icon: "more_horiz",
      items: [
        {
          key: "onboarding",
          label: "Reset tutorial",
          icon: "kid_star",
          slug: "/[tab]/welcome",
        },
      ],
    },
  ];
};

