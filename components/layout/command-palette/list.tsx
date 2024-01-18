import { sendApiRequest } from "@/helpers/api";
import { router } from "expo-router";

export const getSidebarItems = async (session) => {
  const req = await sendApiRequest(session, "GET", "space/collections", {});

  return [
    {
      title: "Collections",
      icon: "layers",
      theme: "blue",
      data: [
        ...(req && Array.isArray(req)
          ? req.map((collection) => ({
              label: collection.name,
              icon: "grid_view",
              slug: `/[tab]/collections/[id]`,
              params: { id: collection.id },
            }))
          : [{}]),
        {
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
      theme: "purple",
      data: [
        {
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
      title: "ALL",
      icon: "airwave",
      theme: "green",
      data: [
        {
          label: "Tasks",
          icon: "check_circle",
          slug: "/[tab]/all/[type]",
          params: { type: "tasks" },
        },
        {
          label: "Items",
          icon: "package_2",
          slug: "/[tab]/all/[type]",
          params: { type: "items" },
        },
        {
          label: "Notes",
          icon: "sticky_note_2",
          slug: "/[tab]/all/[type]",
          params: { type: "notes" },
        },
        {
          label: "Trash",
          icon: "delete",
          slug: "/[tab]/all/[type]",
          params: { type: "trash" },
        },
      ],
    },
  ];
};
