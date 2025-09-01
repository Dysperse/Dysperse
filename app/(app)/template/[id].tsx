import Content from "@/components/layout/content";
import { createTab } from "@/components/layout/openTab";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { showErrorToast } from "@/utils/errorToast";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import { toast } from "sonner-native";

export default function Page() {
  const theme = useColorTheme();
  const { id } = useLocalSearchParams();
  const { session } = useSession();
  const created = useRef(false);

  useEffect(() => {
    if (!id) {
      toast.error("No template ID provided!");
      return;
    }
    if (!session) {
      toast.error("You're not logged in!");
      return;
    }
    if (created.current) return;
    created.current = true;

    sendApiRequest(session, "POST", "dysverse", { id })
      .then(async (collection) => {
        await createTab(session, {
          label: collection.name,
          icon: "grid_view",
          slug: "/[tab]/collections/[id]/[type]",
          params: {
            id: collection.id,
            type: collection.defaultView || "planner",
          },
        });
      })
      .catch(() => {
        showErrorToast();
      });
  }, [id, session]);

  return (
    <Content
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <View
        style={{
          padding: 20,
          backgroundColor: theme[3],
          borderRadius: 20,
          alignItems: "center",
          gap: 10,
          flexDirection: "row",
        }}
      >
        <Spinner />
        <Text variant="eyebrow">Copying template...</Text>
      </View>
    </Content>
  );
}

