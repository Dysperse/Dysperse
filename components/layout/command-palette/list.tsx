import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router } from "expo-router";

export const COLLECTION_VIEWS = {
  list: {
    icon: "view_agenda",
    description: "View all your tasks in a traditional to-do list format",
    type: "Category Based",
  },
  kanban: {
    icon: "view_kanban",
    description: "Organize all your tasks by category",
    type: "Category Based",
  },
  grid: {
    icon: "view_cozy",
    description:
      "Organize all your tasks by category, displayed in a neat grid view",
    type: "Category Based",
  },
  skyline: {
    icon: "blur_linear",
    description: "Vision tasks in flexible time frames",
    type: "Time Based",
  },
  planner: {
    icon: "transition_slide",
    description: "View all your tasks day by day",
    type: "Time Based",
  },
  stream: {
    icon: "whatshot",
    description: "View all missed, upcoming, and completed tasks",
    type: "Time Based",
  },
  calendar: {
    icon: "calendar_today",
    description: "View all your tasks in a traditional calendar view",
    type: "Time Based",
  },
  workload: {
    icon: "exercise",
    description: "Organize your tasks by an estimate of energy consumption",
    type: "Priority Based",
  },
  matrix: {
    icon: "target",
    description: "View all your tasks by priority",
    type: "Priority Based",
  },
};

export const paletteItems = (
  collections,
  sharedCollections,
  labels
): { title: string; icon: string; items: any[] }[] => {
  return [
    {
      title: "All tasks",
      icon: "filter_drama",
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
      icon: "layers",
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
    {
      title: "Labels",
      icon: "label",
      items:
        labels && Array.isArray(labels)
          ? sharedCollections.map((access) => ({
              hasSeen: access.hasSeen,
              label: access.collection.name,
              key: access.collection.id,
              icon: "grid_view",
              emoji: access.collection.emoji,
              data: access.collection,
              slug: `/[tab]/labels/[id]`,
              params: { id: access.collection.id, type: "planner" },
            }))
          : [],
    },
    {
      title: "Other",
      icon: "more_horiz",
      items: [
        {
          key: "onboarding",
          label: "Reset onboarding",
          icon: "kid_star",
          slug: "/[tab]/welcome",
        },
      ],
    },
  ];
};
