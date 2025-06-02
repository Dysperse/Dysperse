import { ColumnMenuTrigger } from "@/app/(app)/[tab]/collections/[id]/ColumnMenuTrigger";
import { mutations } from "@/app/(app)/[tab]/collections/mutations";
import { columnStyles } from "@/components/collections/columnStyles";
import { useCollectionContext } from "@/components/collections/context";
import CreateTask from "@/components/task/create";
import { useSession } from "@/context/AuthProvider";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useGridContext } from "../grid/context";
import { useKanbanContext } from "./context";

export const KanbanHeader = memo(function KanbanHeader({
  label,
  grid,
  list,
  hideNavigation,
  style,
  carouselRef,
  hasUnlabeled,
}: {
  grid?: boolean;
  list?: boolean;
  hideNavigation?: boolean;
  label: {
    id: string;
    emoji: string;
    color: string;
    name: string;
    entitiesLength: number;
  };
  hasUnlabeled?: boolean;
  carouselRef?: any;
  style?: StyleProp<ViewStyle>;
}) {
  const breakpoints = useResponsiveBreakpoints();
  const { mutate, access } = useCollectionContext();
  const { session } = useSession();
  const isReadOnly = access?.access === "READ_ONLY";
  const theme = useColorTheme();
  const { setCurrentColumn, currentColumn, columnsLength } =
    useKanbanContext() || {};

  const isGridView = grid && !list;
  const { setCurrentColumn: setCurrentColumn_grid } = useGridContext() || {};

  return (
    <View
      style={[
        columnStyles.header,
        { height: 70 },
        grid && {
          height: 60,
        },
        isGridView && { height: 50 },
        breakpoints.md
          ? {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }
          : {
              borderRadius: 20,
              borderTopColor: theme[5],
              backgroundColor: theme[3],
              height: 80,
              ...(!list && {
                marginHorizontal: 15,
                marginTop: 5,
                paddingBottom: 20,
              }),
            },
        style,
      ]}
    >
      {grid && !list && !breakpoints.md && (
        <IconButton
          size={40}
          icon="arrow_back_ios_new"
          onPress={() => setCurrentColumn_grid("HOME")}
          style={{ marginLeft: -15, height: 60 }}
        />
      )}
      {label.emoji && (
        <Emoji
          style={{
            marginLeft: isGridView && !breakpoints.md ? -10 : 0,
            marginRight: breakpoints.md || isGridView ? undefined : 10,
          }}
          emoji={label.emoji}
          size={isGridView && breakpoints.md ? 24 : 35}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={[
            {
              fontSize: isGridView && breakpoints.md ? 17 : 20,
              fontFamily: "serifText700",
            },
          ]}
          numberOfLines={1}
        >
          {label.name || "Unlabeled"}
        </Text>
        {label.entitiesLength !== 0 && (
          <Text
            style={{
              opacity: 0.6,
              marginTop: 2,
              fontSize: isGridView && breakpoints.md ? 13 : undefined,
            }}
            numberOfLines={1}
          >
            {grid
              ? label.entitiesLength === 0
                ? ""
                : label.entitiesLength
              : label.entitiesLength}
            {grid && label.entitiesLength === 0
              ? ""
              : typeof label.entitiesLength === "number"
              ? ` item${label.entitiesLength !== 1 ? "s" : ""}`
              : ""}
          </Text>
        )}
      </View>
      <View
        style={{ flexDirection: "row", marginRight: -15, alignItems: "center" }}
      >
        {label?.id && !isReadOnly && session && label?.id !== "entities" && (
          <ColumnMenuTrigger label={label}>
            <IconButton
              size={40}
              icon={
                grid && !breakpoints.md && !list ? "more_vert" : "more_horiz"
              }
              style={{ marginRight: grid ? 4 : 0 }}
              iconProps={{ bold: true }}
              iconStyle={{ opacity: 0.7 }}
            />
          </ColumnMenuTrigger>
        )}
        {!(grid && !breakpoints.md && !hideNavigation) && (
          <>
            {!breakpoints.md && !hideNavigation && (
              <IconButton
                size={40}
                disabled={currentColumn === 0}
                onPress={() => {
                  carouselRef.current?.prev?.();
                  // setCurrentColumn(
                  //   (d) => (d - 1 + columnsLength) % columnsLength
                  // );
                }}
                icon="arrow_back_ios_new"
                style={{ height: 60 }}
              />
            )}
            {!breakpoints.md && !hideNavigation && (
              <IconButton
                size={40}
                disabled={
                  currentColumn === columnsLength - (hasUnlabeled ? 0 : 1) ||
                  label?.id === "entities"
                }
                onPress={() => {
                  carouselRef.current?.next?.();
                  // setCurrentColumn(
                  //   (d) => (d + (hasUnlabeled ? 2 : 1)) % columnsLength
                  // );
                }}
                icon="arrow_forward_ios"
                style={{ height: 60 }}
              />
            )}
          </>
        )}
      </View>
      {grid && session && (
        <>
          <CreateTask
            defaultValues={{ label: omit(["entities"], label) }}
            mutate={mutations.categoryBased.add(mutate)}
          >
            <IconButton
              iconProps={{ bold: true }}
              size={isGridView && breakpoints.md ? 40 : 50}
              style={{
                marginRight: -10,
                borderRadius: isGridView && breakpoints.md ? 15 : 20,
              }}
              backgroundColors={{
                default: addHslAlpha(theme[9], 0.1),
                hovered: addHslAlpha(theme[9], 0.2),
                pressed: addHslAlpha(theme[9], 0.3),
              }}
              icon="stylus_note"
            />
          </CreateTask>
        </>
      )}
    </View>
  );
});

