import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";

export const updateTabParams = async ({
  sessionToken,
  tabId,
  params,
  mutateTabList,
}: {
  sessionToken: string;
  tabId: string;
  params: Record<string, string>;
  mutateTabList: () => Promise<unknown>;
}) => {
  const res = await sendApiRequest(
    sessionToken,
    "PUT",
    "user/tabs",
    {},
    {
      body: JSON.stringify({
        params: omit(["tab", "fullscreen"], params),
        id: tabId,
      }),
    }
  );
  await mutateTabList();
  return res;
};

