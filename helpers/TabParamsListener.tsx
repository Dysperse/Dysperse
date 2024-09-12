import { useUser } from "@/context/useUser";
import { useEffect } from "react";
import useSWR from "swr";
import { sendApiRequest } from "./api";
import { omit } from "./omit";

interface ParamsListener {
  params: Record<string, string>;
  listenFor: string[];
}
export default function TabParamsListener({
  params,
  listenFor,
}: ParamsListener) {
  const { sessionToken } = useUser();
  const { data, mutate } = useSWR(["user/tabs"]);

  useEffect(() => {
    const tab = data.find((tab: any) => tab.id === tab);

    if (
      tab.params &&
      JSON.stringify(omit(["tab", "fullscreen"], params)) !==
        JSON.stringify(omit(["tab", "fullscreen"], tab.params))
    ) {
      if (Object.keys(omit(["tab", "fullscreen"], params)).length === 0) return;
      mutate(
        (oldData) =>
          oldData.map((oldTab) =>
            oldTab.id === tab.id ? { ...oldTab, params: params } : oldTab
          ),
        {
          revalidate: false,
        }
      );
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/tabs",
        {},
        {
          body: JSON.stringify({
            params: omit(["tab", "fullscreen"], params),
            id: tab.id,
          }),
        }
      );
    }
  }, [data, mutate, params, sessionToken, listenFor]);
  return null;
}

