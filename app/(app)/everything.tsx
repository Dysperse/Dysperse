import { ContentWrapper } from "@/components/layout/content";
import { ButtonGroup } from "@/ui/ButtonGroup";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useState } from "react";
import { View } from "react-native";

export default function Page() {
  const theme = useColorTheme();
  const [view, setView] = useState<"labels" | "collections">("labels");
  return (
    <ContentWrapper>
      <ButtonGroup
        options={[
          { label: "Labels", value: "labels" },
          { label: "Collections", value: "collections" },
        ]}
        state={[view, setView]}
        buttonStyle={{ borderBottomWidth: 0 }}
        containerStyle={{ width: 300 }}
        scrollContainerStyle={{ width: "100%" }}
        activeComponent={
          <View
            style={{
              height: 4,
              width: 10,
              borderRadius: 99,
              backgroundColor: theme[9],
              margin: "auto",
            }}
          />
        }
      />
    </ContentWrapper>
  );
}
