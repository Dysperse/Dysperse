import { useCollectionContext } from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { KanbanHeader } from "@/components/collections/views/kanban/Header";
import CreateTask from "@/components/task/create";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import RefreshControl from "@/ui/RefreshControl";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import { InteractionManager, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ColumnEmptyComponent } from "../../emptyComponent";

export type ColumnProps =
  | {
      label?: any;
      entities?: never;
      grid?: boolean;
    }
  | {
      label?: never;
      entities?: any[];
      grid?: boolean;
    };

export const ColumnFinishedComponent = () => {
  const theme = useColorTheme();

  return (
    <View
      style={{
        marginVertical: 20,
        backgroundColor: theme[3],
        alignItems: "center",
        padding: 20,
        gap: 15,
        borderRadius: 20,
        paddingVertical: 50,
      }}
    >
      <Emoji emoji="1f389" size={40} />
      <View>
        <Text
          style={{
            fontSize: 17,
            color: theme[11],
            textAlign: "center",
          }}
          weight={600}
        >
          You finished everything!
        </Text>
      </View>
    </View>
  );
};

export function Column(props: ColumnProps) {
  const theme = useColorTheme();
  const columnRef = useRef(null);
  const insets = useSafeAreaInsets();
  const breakpoints = useResponsiveBreakpoints();
  const { mutate, access, data: collectionData } = useCollectionContext();
  const [refreshing] = useState(false);

  const isReadOnly = access?.access === "READ_ONLY";

  const opacity = useSharedValue(0);
  const opacityStyle = useAnimatedStyle(() => ({
    opacity: withSpring(opacity.value, { damping: 20, stiffness: 90 }),
  }));

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => (opacity.value = 1));
  }, []);

  const onTaskUpdate = (updatedTask, oldTask) => {
    mutate(
      (oldData) => {
        const labelIndex = oldData.labels.findIndex(
          (l) => l.id === updatedTask.label?.id
        );
        if (labelIndex === -1)
          return {
            ...oldData,
            entities: oldData.entities.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          };

        const taskIndex = oldData.labels[labelIndex].entities.findIndex(
          (t) => t.id === updatedTask.id
        );

        if (taskIndex === -1)
          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l?.id === updatedTask.label?.id
                ? {
                    ...l,
                    entities: [...l.entities, updatedTask],
                  }
                : l.id === oldTask.label?.id
                ? {
                    ...l,
                    entities: l.entities.find((t) => t.id === oldTask.id)
                      ? l.entities.filter((t) => t.id !== oldTask.id)
                      : [updatedTask, ...l.entities],
                  }
                : l
            ),
          };

        return {
          ...oldData,
          labels: [
            ...oldData.labels.slice(0, labelIndex),
            {
              ...oldData.labels[labelIndex],
              entities: oldData.labels[labelIndex].entities
                .map((t, i) => (i === taskIndex ? updatedTask : t))
                .filter((t) => !t.trash),
            },
            ...oldData.labels.slice(labelIndex + 1),
          ],
        };
      },
      {
        revalidate: Boolean(oldTask.recurrenceRule),
      }
    );
  };

  const onEntityCreate = (newTask, label) => {
    if (!newTask) return;
    mutate(
      (data) => {
        const labelIndex = data.labels.findIndex((l) => l.id === label.id);
        if (labelIndex === -1) return data;
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

  const data = (props.label ? props.label.entities : props.entities)
    .sort((a, b) => a.agendaOrder?.toString()?.localeCompare(b.agendaOrder))
    .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
    .sort((x, y) =>
      x.completionInstances.length === y.completionInstances.length
        ? 0
        : x.completionInstances.length === 0
        ? -1
        : 0
    );
  return (
    <Animated.View
      style={[
        opacityStyle,
        props.grid
          ? {
              position: "relative",
              height: "100%",
              width: "100%",
              maxWidth: "100%",
              borderRadius: 20,
              ...(breakpoints.md && {
                borderWidth: 1,
                borderColor: addHslAlpha(theme[5], 0.7),
              }),
            }
          : {
              ...(breakpoints.md && {
                backgroundColor: theme[2],
                borderRadius: 20,
                borderWidth: 1,
                borderColor: addHslAlpha(theme[5], 0.7),
              }),
              width: breakpoints.md ? 320 : "100%",
              flex: 1,
              minWidth: 5,
              minHeight: 5,
            },
      ]}
    >
      <Pressable
        style={({ hovered, pressed }) => ({
          opacity: pressed ? 0.6 : hovered ? 0.9 : 1,
        })}
        onPress={() =>
          columnRef.current.scrollToOffset({ offset: 0, animated: true })
        }
      >
        <KanbanHeader
          grid={props.grid}
          label={{
            ...props.label,
            entities: undefined,
            entitiesLength: (props.label || props).entities.filter(
              (e) => e.completionInstances.length === 0
            ).length,
          }}
        />
      </Pressable>
      {props.grid ? undefined : (
        <>
          {!isReadOnly && (
            <View style={{ padding: 15, paddingBottom: 0, height: 65 }}>
              <CreateTask
                mutate={(n) => onEntityCreate(n, props.label)}
                defaultValues={{
                  label: omit(["entities"], props.label),
                  collectionId: collectionData.id,
                  date: null,
                }}
              >
                <Button
                  variant="filled"
                  height={50}
                  containerStyle={{ flex: 1 }}
                >
                  <Icon>add</Icon>
                  <ButtonText>Create</ButtonText>
                </Button>
              </CreateTask>
            </View>
          )}
        </>
      )}

      <LinearGradient
        style={{
          width: "100%",
          height: 30,
          zIndex: 1,
          marginBottom: -30,
          pointerEvents: "none",
        }}
        colors={[theme[breakpoints.md ? 2 : 1], "transparent"]}
      />
      <FlashList
        ref={columnRef}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => mutate()} />
        }
        centerContent={data.length === 0}
        ListEmptyComponent={() => <ColumnEmptyComponent row={props.grid} />}
        data={data}
        ListHeaderComponent={() => (
          <View>
            {(props.label ? props.label.entities : props.entities).length > 0 &&
              (props.label ? props.label.entities : props.entities).filter(
                (e) => e.completionInstances.length === 0
              ).length === 0 && <ColumnFinishedComponent />}
          </View>
        )}
        estimatedItemSize={300}
        contentContainerStyle={{
          padding: 15,
          paddingTop: 15,
          paddingBottom: insets.bottom + 15,
        }}
        renderItem={({ item }) => (
          <Entity
            isReadOnly={isReadOnly}
            item={item}
            showDate
            onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
          />
        )}
        keyExtractor={(i: any, d) => i.id}
      />
    </Animated.View>
  );
}
