import { useCollectionContext } from "@/components/collections/context";
import { omit } from "@/helpers/omit";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRef } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { Entity } from "../../entity";
import { KanbanHeader } from "../kanban/Header";

export function List() {
  const isDark = useDarkMode();
  const { data, mutate } = useCollectionContext();
  const theme = useColorTheme();

  const d = data.labels.reduce((acc, curr) => {
    acc.push({ header: true, ...omit(["entities"], curr) });
    acc.push(
      ...curr.entities.sort(
        (a, b) => a.completionInstances?.length - b.completionInstances?.length
      )
    );
    return acc;
  }, []);

  const onTaskUpdate = (newTask: any) => {
    mutate(
      (oldData) => {
        const newLabels = oldData.labels.map((label: any) => {
          if (label.id === newTask?.labelId) {
            return {
              ...label,
              entities: label.entities.map((task: any) => {
                if (task.id === newTask.id) {
                  return newTask;
                }
                return task;
              }),
            };
          }
          return label;
        });
        return {
          ...oldData,
          labels: newLabels,
        };
      },
      { revalidate: false }
    );
  };

  const { width } = useWindowDimensions();
  const ref = useRef(null);

  return (
    <FlashList
      data={d}
      ref={ref}
      stickyHeaderIndices={d
        .map((item, index) => (item.header ? index : -1))
        .filter((index) => index !== -1)}
      renderItem={({ item }: any) => {
        if (item.header) {
          // Rendering header
          return (
            <LinearGradient colors={[theme[1], "transparent"]}>
              <Pressable
                onPress={() => {
                  ref.current?.scrollToIndex({
                    index: d.indexOf(item),
                    animated: true,
                  });
                }}
                style={{
                  margin: 10,
                  width: 750,
                  maxWidth: width - 40,
                  marginHorizontal: "auto",
                  borderRadius: 99,
                  overflow: "hidden",
                  backgroundColor: addHslAlpha(theme[3], 0.5),
                  borderWidth: 1,
                  borderColor: addHslAlpha(theme[7], 0.3),
                }}
              >
                <BlurView
                  experimentalBlurMethod="dimezisBlurView"
                  intensity={50}
                  tint={!isDark ? "prominent" : "systemMaterialDark"}
                  style={{
                    height: 80,
                    width: "100%",
                    overflow: "hidden",
                    borderRadius: 999,
                  }}
                >
                  <KanbanHeader hideNavigation label={item} grid />
                </BlurView>
              </Pressable>
            </LinearGradient>
          );
        } else {
          // Render item
          return (
            <View
              style={{
                marginHorizontal: "auto",
                width: 750,
                maxWidth: width - 40,
              }}
            >
              <Entity
                onTaskUpdate={onTaskUpdate}
                item={item}
                isReadOnly={false}
                showRelativeTime
              />
            </View>
          );
        }
      }}
      getItemType={(item) => {
        // To achieve better performance, specify the type based on the item
        return typeof item === "string" ? "sectionHeader" : "row";
      }}
      estimatedItemSize={100}
    />
  );
}
