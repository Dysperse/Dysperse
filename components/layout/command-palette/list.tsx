import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router } from "expo-router";

export const COLLECTION_VIEWS = {
  skyline: {
    icon: "blur_linear",
    description: "Vision tasks in flexible time frames",
  },
  planner: {
    icon: "transition_slide",
    description: "View all your tasks day by day",
  },
  kanban: {
    icon: "view_kanban",
    description: "Organize all your tasks by category",
  },
  stream: {
    icon: "whatshot",
    description: "View all missed, upcoming, and completed tasks",
  },
  grid: {
    icon: "view_cozy",
    description:
      "Organize all your tasks by category, displayed in a neat grid view",
  },
  workload: {
    icon: "exercise",
    description: "Organize your tasks by an estimate of energy consumption",
  },
  list: {
    icon: "view_agenda",
    description: "View all your tasks in a traditional to-do list format",
  },
  matrix: {
    icon: "target",
    description: "View all your tasks by priority",
  },
  calendar: {
    icon: "calendar_today",
    description: "View all your tasks in a traditional calendar view",
  },
};

export const paletteItems = (
  collections,
  sharedCollections
): { title: string; icon: string; items: any[] }[] => {
  return [
    {
      title: "Everything",
      icon: "all_inclusive",
      items: Object.keys(COLLECTION_VIEWS).map((key) => ({
        label: capitalizeFirstLetter(key),
        key,
        icon: COLLECTION_VIEWS[key].icon,
        slug: `/[tab]/collections/[id]/[type]`,
        about: COLLECTION_VIEWS[key].description,
        params: { type: key, id: "all" },
      })),
    },
    {
      title: "Collections",
      icon: "grid_view",
      items: [
        ...(collections && Array.isArray(collections)
          ? collections.map((collection) => ({
              label: collection.name,
              key: collection.id,
              icon: "grid_view",
              emoji: collection.emoji,
              data: collection,
              slug: `/[tab]/collections/[id]/[type]`,
              params: {
                id: collection.id,
                type: collection.defaultView || "planner",
              },
            }))
          : [{}]),
        {
          key: "create-collection",
          label: "Create",
          icon: "add",
          slug: "",
          onPress: () => {
            router.push("/collections/create");
          },
        },
      ],
    },
    {
      title: "Other",
      icon: "pending",
      items: [
        {
          key: "onboarding",
          label: "Reset onboarding",
          icon: "kid_star",
          slug: "/[tab]/welcome",
        },
      ],
    },
    {
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
              slug: `/[tab]/collections/[id]/[type]`,
              params: { id: access.collection.id, type: "planner" },
            }))
          : [],
    },
  ];
};

