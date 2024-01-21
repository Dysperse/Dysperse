import { columnStyles } from "@/components/collections/columnStyles";
import {
  CollectionContext,
  useCollectionContext,
} from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { CollectionNavbar } from "@/components/collections/navbar";
import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import { Perspectives } from "@/components/collections/views/agenda";
import { ColumnEmptyComponent } from "@/components/collections/views/agenda/Column";
import { ContentWrapper } from "@/components/layout/content";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { ReactElement, memo } from "react";
import { StyleSheet, View } from "react-native";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import useSWR from "swr";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
});

const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
  label,
  children,
}: {
  label: any;
  children: ReactElement;
}) {
  return (
    <>
      <MenuPopover
        trigger={children}
        containerStyle={{ width: 150 }}
        // menuProps={{ rendererProps: { anchorStyle: { opacity: 0 } } }}
        options={[
          { icon: "edit", text: "Edit" },
          {
            renderer: () => (
              <ConfirmationModal
                height={410}
                onSuccess={() => {}}
                title="Remove label from collection?"
                secondary="This label, or the items within it, will not be deleted."
              >
                <MenuItem>
                  <Icon>remove_circle</Icon>
                  <Text variant="menuItem">Remove</Text>
                </MenuItem>
              </ConfirmationModal>
            ),
          },
        ]}
      />
    </>
  );
});

const KanbanHeader = memo(function KanbanHeader({
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
  const { mutate } = useCollectionContext();

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

  const theme = useColorTheme();
  return (
    <LinearGradient
      colors={[theme[3], theme[2]]}
      style={[
        columnStyles.header,
        grid && {
          height: 60,
          borderBottomWidth: 1,
          borderBottomColor: theme[5],
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
        <Text style={{ fontSize: 20 }} weight={800}>
          {label.name || "Other"}
        </Text>
        <Text weight={200} numberOfLines={1}>
          {label.entitiesLength} item{label.entitiesLength !== 1 && "s"}
        </Text>
      </View>
      {grid && (
        <>
          <CreateEntityTrigger
            menuProps={{ style: { marginRight: -25 } }}
            defaultValues={{
              label: omit(["entities"], label),
            }}
            mutateList={onEntityCreate}
          >
            <IconButton icon="add" disabled />
          </CreateEntityTrigger>
          {label && (
            <ColumnMenuTrigger label={label}>
              <IconButton disabled icon="more_horiz" />
            </ColumnMenuTrigger>
          )}
        </>
      )}
    </LinearGradient>
  );
});

type KanbanColumnProps =
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

function KanbanColumn(props: KanbanColumnProps) {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();
  const { mutate } = useCollectionContext();

  const onTaskUpdate = (updatedTask, oldTask) => {
    mutate(
      (oldData) => {
        console.log(updatedTask);
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
                : l.id === oldTask.label.id
                ? {
                    ...l,
                    entities: l.entities.filter((t) => t.id !== oldTask.id),
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
        revalidate: false,
      }
    );
  };

  return (
    <View
      style={
        props.grid
          ? {
              position: "relative",
              height: "100%",
            }
          : {
              ...(breakpoints.md && {
                backgroundColor: theme[2],
                borderRadius: 20,
              }),
              width: breakpoints.md ? 300 : "100%",
              flex: 1,
              minWidth: 5,
              minHeight: 5,
            }
      }
    >
      {breakpoints.md && (
        <KanbanHeader
          grid={props.grid}
          label={{
            ...props.label,
            entities: undefined,
            entitiesLength: (props.label || props).entities.length,
          }}
        />
      )}

      <FlatList
        // refreshControl={
        //   <RefreshControl
        //     // refreshing={refreshing}
        //     // onRefresh={onRefresh}
        //     progressBackgroundColor={theme[5]}
        //     colors={[theme[11]]}
        //     tintColor={theme[11]}
        //   />
        // }
        ListEmptyComponent={() => <ColumnEmptyComponent row={props.grid} />}
        ListHeaderComponent={
          props.grid ? undefined : (
            <>
              <View
                style={[
                  styles.header,
                  {
                    paddingHorizontal: breakpoints.md ? 0 : 15,
                    paddingTop: breakpoints.md ? 0 : 20,
                  },
                ]}
              >
                <CreateEntityTrigger
                  menuProps={props.grid ? undefined : { style: { flex: 1 } }}
                  defaultValues={{
                    label: omit(["entities"], props.label),
                  }}
                >
                  <Button
                    disabled
                    variant="filled"
                    style={{ flex: 1, minHeight: 50 }}
                  >
                    <ButtonText>New</ButtonText>
                    <Icon>add</Icon>
                  </Button>
                </CreateEntityTrigger>
                {props.label && (
                  <ColumnMenuTrigger label={props.label}>
                    <Button
                      disabled
                      variant="outlined"
                      style={{ minHeight: 50 }}
                    >
                      <Icon>more_horiz</Icon>
                    </Button>
                  </ColumnMenuTrigger>
                )}
              </View>
            </>
          )
        }
        data={(props.label ? props.label.entities : props.entities)
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: breakpoints.md ? 15 : 0,
          paddingTop: 15,
          gap: 5,
          minHeight: "100%",
        }}
        renderItem={({ item }) => (
          <Entity
            item={item}
            onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
            openColumnMenu={() => {}}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </View>
  );
}

function Kanban() {
  const { data } = useCollectionContext();
  const theme = useColorTheme();

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        flexDirection: "row",
        padding: 15,
        gap: 15,
      }}
    >
      {data.labels.map((label) => (
        <KanbanColumn key={label.id} label={label} />
      ))}
      {data.entities.length > 0 && <KanbanColumn entities={data.entities} />}
      {data.labels.length <= 2 &&
        [...new Array(3)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 300,
              flex: 1,
              minWidth: 5,
              minHeight: 5,
              backgroundColor: theme[2],
              borderRadius: 20,
            }}
          />
        ))}
    </ScrollView>
  );
}

function Grid() {
  const { data } = useCollectionContext();
  const theme = useColorTheme();

  if (!Array.isArray(data.labels)) return null;

  // Create a new array for rendering purposes without modifying the original data
  const displayLabels = [...data.labels];

  if (displayLabels.length % 2 !== 0) displayLabels.push({ empty: true });
  if (displayLabels.length < 4)
    displayLabels.push(
      ...new Array(4 - displayLabels.length).fill({
        empty: true,
      })
    );

  const columnsPerRow = 2;
  const rows = [];

  for (let i = 0; i < displayLabels.length; i += columnsPerRow) {
    const rowLabels = displayLabels.slice(i, i + columnsPerRow);
    const row = rowLabels.map((label) =>
      label.empty ? (
        <View
          key={label.id || Math.random()}
          style={{
            flex: 1,
            backgroundColor: theme[2],
            width: "100%",
            borderRadius: 25,
          }}
        />
      ) : (
        <View
          key={label.id || Math.random()}
          style={{
            flex: 1,
            backgroundColor: theme[2],
            width: "100%",
            borderRadius: 25,
          }}
        >
          <KanbanColumn grid label={label} />
        </View>
      )
    );
    rows.push(
      <View
        key={i / columnsPerRow}
        style={{
          flexDirection: "column",
          gap: 15,
          width: "50%",
        }}
      >
        {row}
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      contentContainerStyle={{
        padding: 15,
        gap: 15,
        minWidth: "100%",
        paddingRight: 30,
      }}
      style={{
        minWidth: "100%",
      }}
    >
      {rows}
      {displayLabels.length <= columnsPerRow &&
        [...new Array(columnsPerRow - displayLabels.length)].map((_, i) => (
          <View
            key={i}
            style={{
              width: 300,
              flex: 1,
              minWidth: 5,
              minHeight: 5,
              backgroundColor: theme[2],
              borderRadius: 20,
            }}
          />
        ))}
    </ScrollView>
  );
}

function Stream() {
  const { data, mutate } = useCollectionContext();
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  const onTaskUpdate = (updatedTask, oldTask) => {
    mutate(
      (oldData) => {
        const labelIndex = oldData.labels.findIndex(
          (l) => l.id === updatedTask.label?.id
        );
        if (labelIndex === -1) {
          return {
            ...oldData,
            entities: oldData.entities.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            ),
          };
        }

        const taskIndex = oldData.labels[labelIndex].entities.findIndex(
          (t) => t.id === updatedTask.id
        );

        if (taskIndex === -1)
          return {
            ...oldData,
            labels: oldData.labels.map((l) =>
              l.id === updatedTask.label?.id
                ? {
                    ...l,
                    entities: [...l.entities, updatedTask],
                  }
                : l.id === oldTask.label?.id
                ? {
                    ...l,
                    entities: l.entities.filter((t) => t.id !== oldTask.id),
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
        revalidate: false,
      }
    );
  };

  return (
    <>
      <FlatList
        ListEmptyComponent={() => <ColumnEmptyComponent row />}
        ListHeaderComponent={
          <>
            <View
              style={[
                styles.header,
                {
                  paddingHorizontal: breakpoints.md ? 0 : 15,
                  paddingTop: breakpoints.md ? 0 : 20,
                },
              ]}
            >
              <CreateEntityTrigger
                defaultValues={{
                  collectionId: data.id,
                }}
                mutateList={(newTask) => {
                  if (!newTask) return;
                  mutate(
                    (oldData) => {
                      const labelIndex = oldData.labels.findIndex(
                        (l) => l.id === newTask.label.id
                      );
                      if (labelIndex === -1)
                        return {
                          ...oldData,
                          entities: [...oldData.entities, newTask],
                        };
                      return {
                        ...oldData,
                        labels: oldData.labels.map((l) =>
                          l.id === newTask.label.id
                            ? {
                                ...l,
                                entities: [...l.entities, newTask],
                              }
                            : l
                        ),
                      };
                    },
                    {
                      revalidate: false,
                    }
                  );
                }}
              >
                <Button
                  disabled
                  variant="filled"
                  style={{ flex: 1, minHeight: 50, paddingHorizontal: 20 }}
                >
                  <ButtonText>New</ButtonText>
                  <Icon>add</Icon>
                </Button>
              </CreateEntityTrigger>
            </View>
          </>
        }
        data={[
          ...data.entities,
          ...data.labels.reduce((acc, curr) => [...acc, ...curr.entities], []),
        ]
          .sort((a, b) =>
            a.agendaOrder?.toString()?.localeCompare(b.agendaOrder)
          )
          .sort((x, y) => (x.pinned === y.pinned ? 0 : x.pinned ? -1 : 1))
          .sort((x, y) =>
            x.completionInstances.length === y.completionInstances.length
              ? 0
              : x.completionInstances.length === 0
              ? -1
              : 0
          )}
        // estimatedItemSize={200}
        initialNumToRender={10}
        contentContainerStyle={{
          padding: breakpoints.md ? 15 : 0,
          paddingTop: 15,
          gap: 5,
          minHeight: "100%",
        }}
        renderItem={({ item }) => (
          <Entity
            showLabel
            item={item}
            onTaskUpdate={(newData) => onTaskUpdate(newData, item)}
            openColumnMenu={() => {}}
          />
        )}
        keyExtractor={(i: any, d) => `${i.id}-${d}`}
      />
    </>
  );
}

export default function Page() {
  const { id, type } = useLocalSearchParams();
  const { data, mutate, error } = useSWR(
    id && type ? ["space/collections/collection", { id }] : null
  );

  let content = null;
  switch (type) {
    case "agenda":
      content = <Perspectives />;
      break;
    case "kanban":
      content = <Kanban />;
      break;
    case "stream":
      content = <Stream />;
      break;
    case "grid":
      content = <Grid />;
      break;
    case "difficulty":
      content = <Text>Difficulty</Text>;
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  return (
    <CollectionContext.Provider value={{ data, mutate, error }}>
      {data ? (
        <ContentWrapper>
          <CollectionNavbar />
          {content}
        </ContentWrapper>
      ) : (
        <ContentWrapper
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          {error ? <ErrorAlert /> : <Spinner />}
        </ContentWrapper>
      )}
    </CollectionContext.Provider>
  );
}
