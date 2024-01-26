import { columnStyles } from "@/components/collections/columnStyles";
import {
  CollectionContext,
  CollectionType,
  useCollectionContext,
} from "@/components/collections/context";
import { Entity } from "@/components/collections/entity";
import { CollectionNavbar } from "@/components/collections/navbar";
import { CreateEntityTrigger } from "@/components/collections/views/CreateEntityTrigger";
import { Perspectives } from "@/components/collections/views/agenda";
import { ColumnEmptyComponent } from "@/components/collections/views/agenda/Column";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { ContentWrapper } from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { omit } from "@/helpers/omit";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { Menu } from "@/ui/Menu";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { ReactElement, memo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
});

const LabelEditModal = memo(function LabelEditModal({
  label,
  trigger,
  onLabelUpdate,
}: {
  label: any;
  trigger: ReactElement;
  onLabelUpdate: any;
}) {
  const menuRef = useRef<BottomSheetModal>(null);
  const colors = useLabelColors();
  const { session } = useSession();
  const { control, handleSubmit } = useForm({
    defaultValues: {
      emoji: label.emoji,
      name: label.name,
      color: label.color,
    },
  });

  const onSubmit = async (updatedLabel) => {
    try {
      menuRef.current?.close();
      onLabelUpdate(updatedLabel);
      await sendApiRequest(
        session,
        "PUT",
        "space/labels",
        {},
        { body: JSON.stringify({ ...updatedLabel, id: label.id }) }
      );
      Toast.show({ type: "success", text1: "Saved!" });
    } catch {
      Toast.show({ type: "error" });
    }
  };

  return (
    <Menu trigger={trigger} height={[360]} menuRef={menuRef}>
      <View style={{ padding: 15, gap: 15 }}>
        <Text
          style={{ fontSize: 20, marginLeft: 5, marginTop: -5 }}
          weight={900}
        >
          Edit label
        </Text>
        <View style={{ flexDirection: "row", gap: 20 }}>
          <Controller
            render={({ field: { onChange, value } }) => (
              <EmojiPicker emoji={value} setEmoji={onChange}>
                <IconButton
                  variant="outlined"
                  size={90}
                  style={{ borderWidth: 2, borderStyle: "dashed" }}
                >
                  <Emoji emoji={value || "1f4ad"} size={50} />
                </IconButton>
              </EmojiPicker>
            )}
            name="emoji"
            control={control}
          />
          <View style={{ flex: 1 }}>
            <Controller
              control={control}
              rules={{
                required: true,
              }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginTop: 10,
                    gap: 10,
                  }}
                >
                  {Object.keys(colors).map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => onChange(color)}
                      style={() => ({
                        width: 30,
                        height: 30,
                        borderRadius: 999,
                        backgroundColor: colors[color][9],
                        borderWidth: 3,
                        borderColor: colors[color][color === value ? 7 : 9],
                      })}
                    />
                  ))}
                </View>
              )}
              name="color"
            />
          </View>
        </View>
        <Controller
          rules={{ required: true }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              variant="filled+outlined"
              style={{ height: 60, fontSize: 20, borderRadius: 99 }}
              placeholder="Label name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="name"
          control={control}
        />
        <Button
          style={{ height: 60 }}
          onPress={handleSubmit(onSubmit, (err) =>
            Toast.show({ type: "error", text1: "Please type a name" })
          )}
          text="Done"
          icon="check"
          iconPosition="end"
          variant="filled"
        />
      </View>
    </Menu>
  );
});

const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
  label,
  children,
}: {
  label: any;
  children: ReactElement;
}) {
  const { mutate } = useCollectionContext();
  return (
    <MenuPopover
      trigger={children}
      containerStyle={{ width: 150 }}
      options={[
        {
          renderer: () => (
            <LabelEditModal
              label={label}
              onLabelUpdate={(newLabel) => {
                mutate(
                  (oldData) => {
                    const labelIndex = oldData.labels.findIndex(
                      (l) => l.id === label.id
                    );
                    if (labelIndex === -1) return oldData;
                    return {
                      ...oldData,
                      labels: oldData.labels.map((l) =>
                        l.id === label.id ? { ...l, ...newLabel } : l
                      ),
                    };
                  },
                  { revalidate: false }
                );
              }}
              trigger={
                <MenuItem>
                  <Icon>edit</Icon>
                  <Text variant="menuItem">Edit</Text>
                </MenuItem>
              }
            />
          ),
        },
      ]}
    />
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
    <View
      style={[
        columnStyles.header,
        grid && {
          height: 60,
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
          {label.entitiesLength}
          {!grid && ` item${label.entities?.length !== 1 && "s"}`}
        </Text>
      </View>
      {grid && (
        <>
          {label?.id && (
            <ColumnMenuTrigger label={label}>
              <IconButton icon="more_horiz" />
            </ColumnMenuTrigger>
          )}
          <CreateEntityTrigger
            menuProps={{ style: { marginRight: -25, marginLeft: -10 } }}
            defaultValues={{
              label: omit(["entities"], label),
            }}
            mutateList={onEntityCreate}
          >
            <IconButton icon="add" variant="filled" />
          </CreateEntityTrigger>
        </>
      )}
    </View>
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
                  <Button variant="filled" style={{ flex: 1, minHeight: 50 }}>
                    <ButtonText>New</ButtonText>
                    <Icon>add</Icon>
                  </Button>
                </CreateEntityTrigger>
                {props.label && (
                  <ColumnMenuTrigger label={props.label}>
                    <Button variant="outlined" style={{ minHeight: 50 }}>
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

function ReorderingGrid({ labels }) {
  const { session } = useSession();
  const theme = useColorTheme();

  const { data: collectionData, mutate } = useCollectionContext();

  const updateLabelOrder = async (newOrder) => {
    const data = newOrder.map((l) => l.key).filter((e) => e);

    console.log(data);

    mutate(
      (oldData) => ({
        ...oldData,
        gridOrder: data,
        labels: newOrder.map((e) => e.label),
      }),
      {
        revalidate: false,
      }
    );

    await sendApiRequest(
      session,
      "PUT",
      "space/collections",
      {},
      { body: JSON.stringify({ id: collectionData.id, gridOrder: data }) }
    );
  };

  return (
    <DraggableGrid
      style={{
        alignItems: "center",
        justifyContent: "center",
      }}
      numColumns={labels.length / 2}
      renderItem={(data) => (
        <View
          style={{
            backgroundColor: theme[4],
            flex: 1,
            width: 200,
            minHeight: 200,
            borderRadius: 20,
            padding: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!data.key ? null : (
            <>
              <Emoji emoji={data.label.emoji} size={50} />
              <Text
                weight={900}
                style={{
                  fontSize: 20,
                  textAlign: "center",
                  marginTop: 10,
                  paddingHorizontal: 10,
                  marginBottom: 5,
                }}
                numberOfLines={1}
              >
                {data.label.name}
              </Text>
              <Text>
                {data.label.entities?.length} item
                {data.label.entities?.length !== 1 && "s"}
              </Text>
            </>
          )}
        </View>
      )}
      data={labels
        .map((label) => ({
          label,
          key: label?.id,
        }))
        .filter((e) => e.key)}
      onDragRelease={updateLabelOrder}
    />
  );
}

function Grid({ editOrderMode }) {
  const { data } = useCollectionContext();
  const theme = useColorTheme();
  const { width } = useWindowDimensions();
  if (!Array.isArray(data.labels) || !data.gridOrder) return null;

  // Create a new array for rendering purposes without modifying the original data
  const displayLabels = data.gridOrder.map((id) =>
    data.labels.find((l) => l.id === id)
  );

  if (data.entities.length > 0) displayLabels.push({ other: true });
  if (displayLabels.length % 2 !== 0) displayLabels.push({ empty: true });
  if (displayLabels.length < 4)
    displayLabels.push(
      ...new Array(4 - displayLabels.length).fill({
        empty: true,
      })
    );

  if (editOrderMode) {
    return <ReorderingGrid labels={displayLabels} />;
  }

  const rowCount = 2;
  const itemsPerRow = displayLabels.length / rowCount;
  const rows = [];

  for (let i = 0; i < rowCount; i++) {
    const row = displayLabels.slice(i * itemsPerRow, (i + 1) * itemsPerRow);
    rows.push(
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
          .filter((e) => e)
          .map((label, i) => (
            <View
              key={label.id || i}
              style={{ flex: 1, minWidth: 5, minHeight: 5 }}
            >
              <View
                style={{
                  flex: 1,
                  backgroundColor: theme[2],
                  borderRadius: 25,
                  width:
                    displayLabels.length > 4
                      ? width / 2 - 230
                      : width / 2 - 145,
                }}
              >
                {label.empty ? (
                  <></>
                ) : label.other ? (
                  <KanbanColumn grid entities={data.entities} />
                ) : (
                  <KanbanColumn key={label.id} grid label={label} />
                )}
              </View>
            </View>
          ))}
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
        flexDirection: "column",
      }}
      style={{
        minWidth: "100%",
      }}
    >
      {rows}
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
    id && type
      ? [
          "space/collections/collection",
          id === "all" ? { all: "true", id: "??" } : { id },
        ]
      : null
  );

  const [editOrderMode, setEditOrderMode] = useState(false);
  const comingSoon = (
    <View
      style={{
        padding: 20,
        paddingTop: 0,
        maxWidth: 800,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: "auto",
      }}
    >
      <Alert
        style={{ marginTop: 20 }}
        emoji="1f6a7"
        title="Coming soon"
        subtitle="We're working on this view. Choose another one for now."
      />
    </View>
  );
  let content = null;
  switch (type as CollectionType) {
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
      content = <Grid editOrderMode={editOrderMode} />;
      break;
    case "workload":
      content = comingSoon;
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  return (
    <CollectionContext.Provider value={{ data, mutate, error, type }}>
      {data ? (
        <ContentWrapper>
          <CollectionNavbar
            editOrderMode={editOrderMode}
            setEditOrderMode={setEditOrderMode}
          />
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
