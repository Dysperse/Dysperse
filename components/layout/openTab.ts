import { sendApiRequest } from "@/helpers/api";
import { router } from "expo-router";

export const createTab = async (
  sessionToken: string,
  tab: {
    label?: string;
    icon?: string;
    slug: string;
    params?: Record<string, string>;
  },
  shouldReplace = true
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

  if (shouldReplace) {
    router.replace({
      pathname: tab.slug,
      params: {
        tab: res.id,
        ...tab.params,
      },
    });
  }

  return res;
};
