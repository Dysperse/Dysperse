import { COLLECTION_VIEWS } from "@/components/layout/command-palette/list";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { router, useGlobalSearchParams } from "expo-router";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { groupedViews } from ".";
import { useCollectionContext } from "../context";
import { NavbarEyebrow } from "./NavbarEyebrow";
import { NavbarIcon } from "./NavbarIcon";
import { NavbarTitle } from "./NavbarTitle";

export const ViewPicker = memo(({ isLoading }: { isLoading: any }) => {
  const theme = useColorTheme();
  const { data, type } = useCollectionContext();
  const { id } = useGlobalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const isAll = id === "all";

  // Convert grouped object to array of arrays
  const options = Object.entries(groupedViews)
    .map(([_type, views]) => [
      {
        renderer: () => (
          <Text variant="eyebrow" style={{ padding: 10, paddingBottom: 3 }}>
            {capitalizeFirstLetter(_type)}
          </Text>
        ),
      },
      ...views.map((e) => ({
        icon: COLLECTION_VIEWS[e].icon,
        text: capitalizeFirstLetter(e),
        callback: () => router.setParams({ type: e }),
        selected: e === type,
      })),
    ])
    .flat();

  return (
    <MenuPopover
      menuProps={{ rendererProps: { placement: "bottom" } }}
      trigger={
        <Pressable
          android_ripple={{ color: theme[5] }}
          style={() => ({
            maxWidth: breakpoints.md ? 240 : "100%",
            flexDirection: "row",
            alignItems: "center",
            gap: 13,
            paddingLeft: 10,
            minWidth: 0,
          })}
        >
          {data?.emoji && (
            <NavbarIcon
              isAll={isAll}
              emoji={data.emoji}
              isLoading={isLoading}
            />
          )}
          <View style={{ minWidth: 0, flexShrink: 1 }}>
            <NavbarEyebrow name={type} />
            {isLoading ? (
              <View
                style={{
                  width: 60,
                  height: 17,
                  borderRadius: 999,
                  backgroundColor: theme[4],
                }}
              />
            ) : (
              <NavbarTitle name={data.name || "All tasks"} />
            )}
          </View>
          <Icon size={30} style={{ marginLeft: -5 }}>
            expand_more
          </Icon>
        </Pressable>
      }
      options={options}
    />
  );
});

