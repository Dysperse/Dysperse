import dayjs from "dayjs";

export const getSidebarItems = async (session) => {
  // const req = await sendApiRequest(session, "GET", "space/tasks/boards", {});
  return [
    {
      title: "Perspectives",
      icon: "asterisk",
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
          label: "Upcoming",
          icon: "calendar_clock",
          slug: "/[tab]/perspectives/upcoming",
        },
        {
          label: "Backlog",
          icon: "event_upcoming",
          slug: "/[tab]/perspectives/backlog",
        },
        {
          label: "Unscheduled",
          icon: "history_toggle_off",
          slug: "/[tab]/perspectives/unscheduled",
        },
        {
          label: "Completed",
          icon: "check_circle",
          slug: "/[tab]/perspectives/completed",
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
      icon: "draw_abstract",
      data: [
        {
          label: "Create",
          icon: "add",
          slug: "/[tab]/collections/create",
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
      data: [
        {
          label: "Tasks",
          icon: "check_circle",
          slug: "/[tab]/all/tasks",
        },
        {
          label: "Items",
          icon: "package_2",
          slug: "/[tab]/all/items",
        },
        {
          label: "Notes",
          icon: "sticky_note_2",
          slug: "/[tab]/all/notes",
        },
        {
          label: "Trash",
          icon: "sticky_note_2",
          slug: "/[tab]/trash",
        },
      ],
    },
  ];
};
