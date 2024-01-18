import { sendApiRequest } from "@/helpers/api";

export const updateTabParams = async ({
  sessionToken,
  tabId,
  params,
  mutateTabList,
  slug,
}: {
  sessionToken: string;
  tabId: string;
  params: Record<string, string>;
  mutateTabList: () => Promise<unknown>;
  slug: string;
}) => {
  const res = await sendApiRequest(
    sessionToken,
    "PUT",
    "user/tabs",
    {},
    {
      body: JSON.stringify({
        params,
        slug: slug.replace("(app)", ""),
        id: tabId,
      }),
    }
  );
  await mutateTabList();
  return res;
};
