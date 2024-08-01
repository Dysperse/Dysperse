import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router } from "expo-router";

export const collectionViews = {
  planner: "transition_slide",
  kanban: "view_kanban",
  stream: "whatshot",
  grid: "view_cozy",
  workload: "exercise",
  list: "view_agenda",
  matrix: "target",
  calendar: "calendar_today",
};

const collectionViewDescriptions = {
  planner: "View all your tasks day by day.",
  kanban: "Organize all your tasks by category",
  stream: "View all missed, upcoming, and completed tasks.",
  list: "View all your tasks in a traditional list view",
  grid: "Organize all your tasks by category, displayed in a neat grid view",
  workload: "Organize your tasks by an estimate of energy consumption",
  matrix: "View all your tasks by priority",
  calendar: "View all your tasks in a traditional calendar view",
};

export const paletteItems = (
  collections,
  sharedCollections
): { title: string; icon: string; items: any[] }[] => {
  return [
    {
      title: "Everything",
      icon: "all_inclusive",
      items: Object.keys(collectionViews).map((key) => ({
        label: capitalizeFirstLetter(key),
        key,
        icon: collectionViews[key],
        slug: `/[tab]/collections/[id]/[type]`,
        about: collectionViewDescriptions[key],
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
