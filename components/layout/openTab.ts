import { sendApiRequest } from "@/helpers/api";
import { router } from "expo-router";

export const createTab = async (
  sessionToken: string,
  tab: {
    label?: string;
    icon?: string;
    slug: string;
    params?: Record<string, string>;
  }
) => {
  const res = await sendApiRequest(
    sessionToken,
    "POST",
    "user/tabs",
    {},
    {
      isCollection: tab.slug.includes("collection"),
      body: JSON.stringify({
        slug: tab.slug,
        params: tab.params || {},
      }),
    }
  );
  router.replace({
    pathname: tab.slug,
    params: {
      tab: res.id,
      ...tab.params,
    },
  });
};
