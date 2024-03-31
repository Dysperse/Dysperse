import { columnStyles } from "@/components/collections/columnStyles";
import { useCollectionContext } from "@/components/collections/context";
import CreateTask from "@/components/task/create";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Emoji from "@/ui/Emoji";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { memo } from "react";
import { View } from "react-native";
import { ColumnMenuTrigger } from "../../../../app/(app)/[tab]/collections/[id]/[type]";
import { useGridContext } from "../grid/context";
import { useKanbanContext } from "./context";

export const KanbanHeader = memo(function KanbanHeader({
  label,
  grid,
}: {
  grid?: boolean;
  label: {
    id: string;
    emoji: string;
    color: string;
    name: string;
    entitiesLength: number;
  };
}) {
  const breakpoints = useResponsiveBreakpoints();
  const { mutate, access } = useCollectionContext();
  const isReadOnly = access?.access === "READ_ONLY";
  const theme = useColorTheme();
  const { setCurrentColumn, currentColumn, columnsLength, hasOther } =
    useKanbanContext() || {};

  const { setCurrentColumn: setCurrentColumn_grid } = useGridContext() || {};

  const onEntityCreate = (newTask) => {
    if (!newTask) return;
    mutate(
      (data) => {
        const labelIndex = data.labels.findIndex((l) => l.id === label.id);
        if (labelIndex === -1) return data;
        data.labels[labelIndex].entities.push(newTask);
        return {
          ...data,
          labels: data.labels.map((l) =>
            l.id === label.id ? { ...l, entities: [...l.entities, newTask] } : l
          ),
        };
      },
      {
        revalidate: false,
      }
    );
  };

  return (
    <View
      style={[
        columnStyles.header,
        grid && {
          height: 60,
        },
        breakpoints.md
          ? {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }
          : {
              borderTopWidth: 1,
              borderTopColor: theme[5],
              backgroundColor: theme[3],
              height: 80,
              paddingBottom: 20,
            },
      ]}
    >
      <Emoji emoji={label.emoji || "1f4ad"} size={grid ? 25 : 35} />
      <View
        style={{
          flex: 1,
          ...(grid && { flexDirection: "row", gap: 20, alignItems: "center" }),
        }}
      >
        <Text style={{ fontSize: 20 }} weight={800} numberOfLines={1}>
          {label.name || "Other"}
        </Text>
        <Text weight={200} numberOfLines={1}>
          {grid
            ? label.entitiesLength === 0
              ? ""
              : label.entitiesLength
            : label.entitiesLength}
          {!grid && ` item${label.entitiesLength !== 1 ? "s" : ""}`}
        </Text>
      </View>
      <View style={{ flexDirection: "row", marginRight: -10 }}>
        {label?.id && !isReadOnly && (
          <ColumnMenuTrigger label={label}>
            <IconButton size={40} icon={grid ? "edit" : "more_horiz"} />
          </ColumnMenuTrigger>
        )}
        {grid && !breakpoints.md ? (
          <IconButton
            size={40}
            icon="expand_all"
            onPress={() => setCurrentColumn_grid("HOME")}
            style={{ marginRight: -5 }}
          />
        ) : (
          <>
            {!breakpoints.md && (
              <IconButton
                size={40}
                onPress={() =>
                  setCurrentColumn((d) =>
                    d === -1 ? columnsLength - 1 : d - 1
                  )
                }
                icon="arrow_back_ios_new"
                disabled={currentColumn === 0}
                style={[currentColumn === 0 && { opacity: 0.5 }]}
              />
            )}
            {!breakpoints.md && (
              <IconButton
                size={40}
                onPress={() =>
                  setCurrentColumn((d) =>
                    d === -1 ? -1 : d === columnsLength - 1 ? -1 : d + 1
                  )
                }
                icon="arrow_forward_ios"
                disabled={currentColumn === (hasOther ? -1 : columnsLength - 1)}
                style={[currentColumn === -1 && { opacity: 0.5 }]}
              />
            )}
          </>
        )}
      </View>
      {grid && (
        <>
          <CreateTask
            defaultValues={{ label: omit(["entities"], label) }}
            mutate={onEntityCreate}
          >
            <IconButton
              size={40}
              style={{
                marginRight: -10,
                backgroundColor: theme[4],
                marginLeft: 5,
              }}
              icon="add"
              variant="filled"
            />
          </CreateTask>
        </>
      )}
    </View>
  );
});
