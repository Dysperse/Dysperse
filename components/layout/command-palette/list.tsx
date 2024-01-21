import { router } from "expo-router";

export const paletteItems = (
  collections,
  labels
): { title: string; icon: string; items: any[] }[] => {
  return [
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
      title: "All",
      icon: "asterisk",
      items: [
        {
          key: "all-agenda",
          label: "Tasks",
          icon: "check_circle",
          slug: "/[tab]/all/[type]",
          params: { type: "tasks" },
        },
        {
          key: "all-items",
          label: "Items",
          icon: "package_2",
          slug: "/[tab]/all/[type]",
          params: { type: "items" },
        },
        {
          key: "all-notes",
          label: "Notes",
          icon: "sticky_note_2",
          slug: "/[tab]/all/[type]",
          params: { type: "notes" },
        },
        {
          key: "all-trash",
          label: "Trash",
          icon: "delete",
          slug: "/[tab]/all/[type]",
          params: { type: "trash" },
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
