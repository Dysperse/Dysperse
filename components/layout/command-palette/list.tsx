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
  list: "view_agenda",
};

const collectionViewDescriptions = {
  planner: "View all your tasks day by day.",
  kanban: "Organize all your tasks by category",
  stream: "View all missed, upcoming, and completed tasks.",
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
    // {
    //   title: "Labels",
    //   icon: "label",
    //   items: [
    //     ...(labels && Array.isArray(labels)
    //       ? labels.map((label) => ({
    //           label: label.name,
    //           icon: "label",
    //           key: label.id,
    //           emoji: label.emoji,
    //           slug: `/[tab]/labels/[id]`,
    //           params: { id: label.id },
    //         }))
    //       : [{}]),
    //     {
    //       key: "create-label",
    //       label: "Create",
    //       icon: "add",
    //       slug: "l",
    //       onPress: () => {
    //         router.push("/collections/create");
    //       },
    //     },
    //   ],
    // },
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
