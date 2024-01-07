import dayjs from "dayjs";
import { router } from "expo-router";

export const getSidebarItems = async (session) => {
  // const req = await sendApiRequest(session, "GET", "space/tasks/boards", {});
  return [
    {
      title: "Perspectives",
      icon: "asterisk",
      theme: "orange",
      data: [
        {
          label: "Weeks",
          icon: "calendar_view_week",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "week",
          },
        },
        {
          label: "Months",
          icon: "calendar_view_month",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "month",
          },
        },
        {
          label: "Years",
          icon: "view_compact",
          slug: "/[tab]/perspectives/agenda/[type]/[start]",
          params: {
            start: dayjs().format("YYYY-MM-DD"),
            type: "year",
          },
        },
        {
          label: "Difficulty",
          icon: "priority_high",
          slug: "/[tab]/perspectives/difficulty",
        },
      ],
    },
    {
      title: "Collections",
      icon: "layers",
      theme: "blue",
      data: [
        {
          label: "Create",
          icon: "add",
          slug: "",
          onPress: () => {
            router.push("/collections/create");
          },
        },
        // ...(req && Array.isArray(req)
        //   ? req.map((collection) => ({
        //       collection,
        //       slug: `/collections/${collection.id}`,
        //     }))
        //   : [{}]),
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
          icon: "sticky_note_2",
          slug: "/[tab]/all/[type]",
          params: { type: "trash" },
        },
      ],
    },
  ];
};
