import { CommandPalettePreview } from "@/components/command-palette/content";
import { createTab } from "@/components/layout/openTab";
import { useSidebarContext } from "@/components/layout/sidebar/context";
import { useUser } from "@/context/useUser";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { MenuButton } from "../home";

export default function Page() {
  const { sessionToken } = useUser();
  const { sidebarRef } = useSidebarContext();
  const { item: _item } = useLocalSearchParams();
  const item = JSON.parse(_item as string);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWR(["user/tabs"]);

  const onCreate = async (tab) => {
    try {
      Keyboard.dismiss();
      setLoading(true);
      if (tab.onPress) {
        await tab.onPress();
        setLoading(false);
        return;
      }

      const data = await createTab(sessionToken, tab, false);
      mutate((oldData) => [...oldData, data], { revalidate: false });

      router.replace({
        pathname: data.slug,
        params: {
          tab: data.id,
          ...tab.params,
        },
      });
      sidebarRef?.current?.closeDrawer?.();
    } catch {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1 }}>
      <MenuButton back icon="west" left gradient />
      <CommandPalettePreview
        onCreate={onCreate}
        preview={item}
        loading={loading}
      />
    </View>
  );
}

