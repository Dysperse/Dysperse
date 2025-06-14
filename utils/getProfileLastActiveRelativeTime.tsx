import dayjs from "dayjs";

export const getProfileLastActiveRelativeTime = (time) => {
  const t = dayjs(time).fromNow(true);
  return t.includes("few") || dayjs().diff(time, "minute") < 3
    ? "NOW"
    : t.split(" ")[0].replace("an", "1").replace("a", "1") +
        t.split(" ")?.[1]?.[0].toUpperCase();
};
