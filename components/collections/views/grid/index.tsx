import { useCollectionContext } from "@/components/collections/context";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CollectionEmpty } from "../CollectionEmpty";
import { Column } from "../kanban/Column";
import { GridContext, GridContextSelectedColumn } from "./context";

export default function Grid() {
  const theme = useColorTheme();
  const insets = useSafeAreaInsets();
  const { data, openLabelPicker } = useCollectionContext();
  const { width } = useWindowDimensions();
  const breakpoints = useResponsiveBreakpoints();
  const scrollRef = useRef<ScrollView>(null);

  const [currentColumn, setCurrentColumn] =
    useState<GridContextSelectedColumn>("HOME");

  if (!Array.isArray(data.labels) || !data.gridOrder) return null;

  // Create a new array for rendering purposes without modifying the original data
  const displayLabels = data.gridOrder.map((id) =>
    data.labels.find((l) => l.id === id)
  );

  if (Object.keys(data.entities).length > 0)
    displayLabels.push({ other: true });
  if (data.id) displayLabels.push({ create: true });
  if (displayLabels.length % 2 !== 0) displayLabels.push({ empty: true });
  if (displayLabels.length < 4)
    displayLabels.push(
      ...new Array(4 - displayLabels.length).fill({
        empty: true,
      })
    );

  const rowCount = 2;
  const itemsPerRow = displayLabels.length / rowCount;
  const rows = [];
  const isMobileHome = currentColumn === "HOME" && !breakpoints.md;

  for (let i = 0; i < rowCount; i++) {
    const row = displayLabels.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
    rows.push(
      isMobileHome ? (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 15,
            flex: 1,
            minWidth: 5,
            minHeight: 5,
          }}
        >
          {row
            ?.filter((e) => e)
            .map((label, i) =>
              label.create ? (
                <Pressable
                  key={i}
                  onPress={openLabelPicker}
                  android_ripple={{ color: theme[7] }}
                  style={({ pressed }: any) => ({
                    flex: 1,
                    width: 230,
                    minWidth: 230,
                    maxWidth: 230,
                    minHeight: 5,
                    borderWidth: 2,
                    borderColor: theme[pressed ? 6 : 4],
                    borderStyle: "dashed",
                    borderRadius: 25,
                    alignItems: "center",
                    flexDirection: "row",
                    gap: 10,
                    justifyContent: "center",
                    padding: 20,
                  })}
                >
                  <Icon bold style={{ opacity: 0.6 }}>
                    stylus_note
                  </Icon>
                  <Text
                    numberOfLines={1}
                    style={{ color: theme[11], opacity: 0.6 }}
                    weight={700}
                  >
                    Edit
                  </Text>
                </Pressable>
              ) : label.empty ? (
                <Pressable
                  android_ripple={{ color: theme[7] }}
                  style={{
                    flex: 1,
                    width: 230,
                    minWidth: 230,
                    maxWidth: 230,
                    minHeight: 5,
                    borderWidth: 2,
                    borderColor: theme[3],
                    borderStyle: "dashed",
                    borderRadius: 25,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 20,
                  }}
                ></Pressable>
              ) : (
                <View style={{ borderRadius: 25, overflow: "hidden" }} key={i}>
                  <Pressable
                    android_ripple={{ color: theme[7] }}
                    onPress={() => {
                      scrollRef.current?.scrollTo({ x: 0 });
                      setCurrentColumn(
                        label.other
                          ? "OTHER"
                          : data.gridOrder.findIndex((l) => l == label.id)
                      );
                    }}
                    style={({ pressed }: any) => ({
                      flex: 1,
                      width: 230,
                      minWidth: 230,
                      maxWidth: 230,
                      minHeight: 5,
                      borderWidth: 2,
                      borderColor: theme[pressed ? 6 : 4],
                      backgroundColor: theme[pressed ? 3 : 2],
                      borderRadius: 25,
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 20,
                    })}
                  >
                    {label.emoji && (
                      <Emoji
                        emoji={label.emoji}
                        size={50}
                        style={{ marginBottom: 10 }}
                      />
                    )}
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 20,
                        marginTop: 5,
                        fontFamily: "serifText700",
                      }}
                    >
                      {label.name || "Unlabeled"}
                    </Text>
                    {(label.entities || data.entities) && (
                      <Text weight={300} style={{ marginTop: 2, opacity: 0.7 }}>
                        {
                          Object.values(
                            label.entities || data.entities
                          )?.filter?.((e) => e.completionInstances.length === 0)
                            ?.length
                        }
                        {" item"}
                        {Object.values(
                          label.entities || data.entities
                        )?.filter?.((e) => e.completionInstances.length === 0)
                          ?.length !== 1
                          ? "s"
                          : ""}
                      </Text>
                    )}
                  </Pressable>
                </View>
              )
            )}
        </View>
      ) : (
        <View
          key={i}
          style={{
            flexDirection: "row",
            gap: 15,
            flex: 1,
            minWidth: 5,
            minHeight: 5,
          }}
        >
          {row
            ?.filter((e) => e)
            .map((label, i) => (
              <View
                key={label.id || i}
                style={{
                  flex: 1,
                  minWidth: 5,
                  minHeight: 5,
                }}
              >
                <View
                  style={[
                    {
                      flex: 1,
                      backgroundColor: theme[2],
                      borderRadius: 25,
                      width: 400,
                    },
                    label.empty && {
                      borderWidth: 1,
                      borderColor: addHslAlpha(theme[5], 0.5),
                      alignItems: "center",
                      justifyContent: "center",
                    },
                  ]}
                >
                  {label.empty ? null : label.create ? (
                    <Pressable
                      onPress={openLabelPicker}
                      android_ripple={{ color: theme[7] }}
                      style={({ pressed }: any) => ({
                        flex: 1,
                        width: 400,
                        minWidth: 400,
                        maxWidth: 400,
                        minHeight: 5,
                        borderWidth: 2,
                        borderColor: theme[pressed ? 6 : 4],
                        borderStyle: "dashed",
                        borderRadius: 25,
                        alignItems: "center",
                        flexDirection: "row",
                        gap: 10,
                        justifyContent: "center",
                        padding: 20,
                      })}
                    >
                      <Icon bold style={{ opacity: 0.6 }}>
                        stylus_note
                      </Icon>
                      <Text
                        numberOfLines={1}
                        weight={700}
                        style={{
                          opacity: 0.6,
                          color: theme[11],
                        }}
                      >
                        Edit
                      </Text>
                    </Pressable>
                  ) : label.other ? (
                    <Column grid entities={data.entities || []} index={i} />
                  ) : (
                    <Column key={label.id} grid label={label} index={i} />
                  )}
                </View>
              </View>
            ))}
        </View>
      )
    );
  }

  return (
    <GridContext.Provider value={{ currentColumn, setCurrentColumn }}>
      {!breakpoints.md && isMobileHome && (
        <View
          style={{
            position: "absolute",
            top: 130,
            left: 0,
            zIndex: 1000,
            height: "100%",
            width: 40,
          }}
        />
      )}
      {displayLabels?.filter((t) => !t?.empty).length === 0 ? (
        <CollectionEmpty />
      ) : (
        <ScrollView
          showsHorizontalScrollIndicator={Platform.OS === "web"}
          bounces={currentColumn === "HOME"}
          horizontal
          ref={scrollRef}
          contentContainerStyle={[
            {
              padding: 15,
              gap: 15,
              paddingRight: isMobileHome || breakpoints.md ? 30 : 0,
              paddingBottom:
                currentColumn === "HOME"
                  ? (!breakpoints.md ? insets.bottom : 0) + 15
                  : 0,
            },
            !breakpoints.md &&
              !isMobileHome && {
                padding: 0,
                width,
              },
          ]}
          scrollEnabled={
            ((breakpoints.md || currentColumn === "HOME") &&
              // if there are less than 4 labels, we want to disable scrolling
              breakpoints.md &&
              displayLabels.length > 4) ||
            !breakpoints.md
          }
          style={[
            {
              width: "100%",
            },
            isMobileHome && {
              backgroundColor: theme[1],
              width,
            },
          ]}
        >
          <View style={{ flex: 1, gap: 15 }}>
            {breakpoints.md ? (
              rows
            ) : currentColumn === "HOME" ? (
              rows
            ) : currentColumn === "OTHER" ? (
              <Column grid entities={data.entities} />
            ) : (
              <Animated.View entering={FadeInDown}>
                <Column grid label={displayLabels[currentColumn]} />
              </Animated.View>
            )}
          </View>
        </ScrollView>
      )}
    </GridContext.Provider>
  );
}

