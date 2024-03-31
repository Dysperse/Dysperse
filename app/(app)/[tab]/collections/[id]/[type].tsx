import {
  CollectionContext,
  CollectionType,
  useCollectionContext,
} from "@/components/collections/context";
import { CollectionNavbar } from "@/components/collections/navbar";
import { Grid } from "@/components/collections/views/grid";
import { Kanban } from "@/components/collections/views/kanban";
import { Perspectives } from "@/components/collections/views/planner";
import { useLabelColors } from "@/components/labels/useLabelColors";
import ContentWrapper from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import Alert from "@/ui/Alert";
import { Button } from "@/ui/Button";
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
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocalSearchParams } from "expo-router";
import { ReactElement, memo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { Stream } from "../../../../../components/collections/views/stream";
import { Workload } from "../../../../../components/collections/views/workload";

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    paddingBottom: 10,
    gap: 10,
    marginTop: -15,
  },
});

export const LabelEditModal = memo(function LabelEditModal({
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
              bottomSheet
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

export const ColumnMenuTrigger = memo(function ColumnMenuTrigger({
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

export default function Page() {
  const { id, type }: any = useLocalSearchParams();
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
    case "planner":
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
      content = <Workload />;
      break;
    case "matrix":
      content = comingSoon;
      break;
    case "calendar":
      content = comingSoon;
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  return (
    <CollectionContext.Provider
      value={{ data, mutate, error, type, access: data?.access }}
    >
      {data ? (
        <ContentWrapper noPaddingTop>
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
