import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router } from "expo-router";

export const collectionViews = {
  planner: "transition_slide",
  kanban: "view_kanban",
  stream: "whatshot",
  grid: "view_cozy",
  workload: "exercise",
  matrix: "target",
  calendar: "calendar_today",
};

export const paletteItems = (
  collections,
  labels
): { title: string; icon: string; items: any[] }[] => {
  return [
    {
      title: "Everything",
      icon: "local_fire_department",
      items: Object.keys(collectionViews).map((key) => ({
        label: capitalizeFirstLetter(key),
        key,
        icon: collectionViews[key],
        slug: `/[tab]/collections/[id]/[type]`,
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
              params: { id: collection.id, type: "planner" },
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
      title: "Labels",
      icon: "label",
      items: [
        ...(labels && Array.isArray(labels)
          ? labels.map((label) => ({
              label: label.name,
              icon: "label",
              key: label.id,
              emoji: label.emoji,
              slug: `/[tab]/labels/[id]`,
              params: { id: label.id },
            }))
          : [{}]),
        {
          key: "create-label",
          label: "Create",
          icon: "add",
          slug: "l",
          onPress: () => {
            router.push("/collections/create");
          },
        },
      ],
    },
    {
      title: "Friends",
      icon: "person",
      items: [],
    },
    {
      title: "Spaces",
      icon: "communities",
      items: [],
    },
  ];
};
