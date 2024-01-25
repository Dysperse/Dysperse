import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router } from "expo-router";

const everythingKeys = {
  agenda: "calendar_today",
  kanban: "view_kanban",
  stream: "view_agenda",
  grid: "view_cozy",
  workload: "exercise",
};
export const paletteItems = (
  collections,
  labels
): { title: string; icon: string; items: any[] }[] => {
  return [
    {
      title: "Everything",
      icon: "local_fire_department",
      items: Object.keys(everythingKeys).map((key) => ({
        label: capitalizeFirstLetter(key),
        key,
        icon: everythingKeys[key],
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
              params: { id: collection.id, type: "agenda" },
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
