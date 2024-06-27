import { useCollectionContext } from "@/components/collections/context";
import { CreateLabelModal } from "@/components/labels/createModal";
import { omit } from "@/helpers/omit";
import { Button, ButtonText } from "@/ui/Button";
import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { FlashList } from "@shopify/flash-list";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import {
  InteractionManager,
  Platform,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ColumnEmptyComponent } from "../../emptyComponent";
import { Entity } from "../../entity";
import { KanbanHeader } from "../kanban/Header";

export default function List() {
  const isDark = useDarkMode();
  const { data, mutate } = useCollectionContext();
  const theme = useColorTheme();

  const d = data.labels.reduce((acc, curr) => {
    acc.push({ header: true, ...omit(["entities"], curr) });
    const t = curr.entities.sort(
      (a, b) => a.completionInstances?.length - b.completionInstances?.length
    );
    acc.push(...t);
    if (t.length === 0) {
      acc.push({ empty: true });
    }
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

  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { damping: 20, stiffness: 90 }),
  }));

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => (opacity.value = 1));
  }, []);

  return (
    <Animated.View style={[opacityStyle, { flex: 1 }]}>
      {d.length === 0 ? (
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
            flex: 1,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontSize: 20,
              opacity: 0.6,
            }}
            weight={900}
          >
            No labels found. Create a label to start adding tasks to it.
          </Text>
          <CreateLabelModal mutate={() => mutate()}>
            <Button variant="filled">
              <Icon>new_label</Icon>
              <ButtonText>Create</ButtonText>
            </Button>
          </CreateLabelModal>
        </View>
      ) : (
        <FlashList
          data={d}
          ref={ref}
          stickyHeaderIndices={d
            .filter((item) => item.header)
            .map((_, index) => index)}
          renderItem={({ item }: any) => {
            if (item.empty) {
              return (
                <View>
                  <ColumnEmptyComponent />
                </View>
              );
            } else if (item.header) {
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
                      backgroundColor: addHslAlpha(
                        theme[3],
                        Platform.OS === "android" ? 1 : 0.5
                      ),
                    }}
                  >
                    <BlurView
                      experimentalBlurMethod="dimezisBlurView"
                      intensity={Platform.OS === "android" ? 0 : 50}
                      tint={!isDark ? "prominent" : "systemMaterialDark"}
                      style={{
                        height: 80,
                        width: "100%",
                        overflow: "hidden",
                        borderRadius: 999,
                        borderWidth: 1,
                        borderColor: addHslAlpha(theme[7], 0.3),
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
      )}
    </Animated.View>
  );
}
