import {
  CollectionContext,
  CollectionType,
  useCollectionContext,
} from "@/components/collections/context";
import { useLabelColors } from "@/components/labels/useLabelColors";
import ContentWrapper from "@/components/layout/content";
import { useSession } from "@/context/AuthProvider";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router, useLocalSearchParams } from "expo-router";
import {
  ReactElement,
  cloneElement,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { InteractionManager, Pressable, StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

import CollectionNavbar from "@/components/collections/navbar";
import { CollectionLabelMenu } from "@/components/collections/navbar/CollectionLabelMenu";
import Calendar from "@/components/collections/views/calendar";
import Grid from "@/components/collections/views/grid";
import Kanban from "@/components/collections/views/kanban";
import List from "@/components/collections/views/list";
import Matrix from "@/components/collections/views/matrix";
import Planner from "@/components/collections/views/planner";
import Stream from "@/components/collections/views/stream";
import Workload from "@/components/collections/views/workload";
import { Modal } from "@/ui/Modal";

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
      onLabelUpdate({ ...updatedLabel, id: label.id });
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => menuRef.current?.close(), 0);
      });
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

  const _trigger = cloneElement(trigger, {
    onPress: () => {
      menuRef.current?.present();
      setTimeout(() => {
        nameRef.current?.focus({ preventScroll: true });
      }, 100);
    },
  });

  const nameRef = useRef(null);

  return (
    <>
      {_trigger}
      <Modal
        animation="SLIDE"
        onClose={() => menuRef.current.close()}
        ref={menuRef}
        maxWidth={400}
      >
        <View
          style={{
            padding: 15,
            paddingVertical: 25,
            gap: 20,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Controller
            render={({ field: { onChange, value } }) => (
              <EmojiPicker setEmoji={onChange}>
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
          <View style={{ width: "100%", gap: 5 }}>
            <Text variant="eyebrow">Name</Text>
            <Controller
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextField
                  variant="filled+outlined"
                  style={{
                    height: 60,
                    fontSize: 20,
                    borderRadius: 99,
                    textAlign: "center",
                    width: "100%",
                  }}
                  placeholder="Label name"
                  inputRef={nameRef}
                  onBlur={onBlur}
                  weight={900}
                  onChangeText={onChange}
                  value={value}
                  bottomSheet
                />
              )}
              name="name"
              control={control}
            />
          </View>
          <View style={{ width: "100%", gap: 10 }}>
            <Text variant="eyebrow">Color</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  {Object.keys(colors).map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => onChange(color)}
                      style={() => ({
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 999,
                        backgroundColor: colors[color][6],
                        borderWidth: 3,
                        borderColor: colors[color][color === value ? 11 : 6],
                      })}
                    />
                  ))}
                </View>
              )}
              name="color"
            />
          </View>
          <Button
            height={60}
            onPress={handleSubmit(onSubmit, (err) =>
              Toast.show({ type: "error", text1: "Please type a name" })
            )}
            text="Done"
            icon="check"
            iconPosition="end"
            variant="filled"
            bold
            large
            containerStyle={{ width: "100%" }}
          />
        </View>
      </Modal>
    </>
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

const Loading = ({ error }) => (
  <ContentWrapper noPaddingTop>
    <CollectionNavbar
      isLoading
      editOrderMode={false}
      setEditOrderMode={() => {}}
    />
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {error ? <ErrorAlert /> : <Spinner />}
    </View>
  </ContentWrapper>
);

export default function Page({ isPublic }: { isPublic: boolean }) {
  const { id, type }: any = useLocalSearchParams();
  const sheetRef = useRef(null);
  const swrKey = id
    ? [
        "space/collections/collection",
        id === "all"
          ? { all: "true", id: "??" }
          : { id, isPublic: isPublic ? "true" : "false" },
      ]
    : null;
  const { data, mutate, error } = useSWR(swrKey);

  const [editOrderMode, setEditOrderMode] = useState(false);

  useEffect(() => {
    if (!type && isPublic) {
      InteractionManager.runAfterInteractions(() => {
        setTimeout(() => router.setParams({ type: "kanban" }), 200);
      });
    }
  }, [isPublic, type]);

  let content = null;
  switch ((type || (isPublic ? "kanban" : null)) as CollectionType) {
    case "planner":
      content = <Planner />;
      break;
    case "kanban":
      content = <Kanban editOrderMode={editOrderMode} />;
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
    case "list":
      content = <List />;
      break;
    case "matrix":
      content = <Matrix />;
      break;
    case "calendar":
      content = <Calendar />;
      break;
    case "pano":
      content = (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>We're working hard on this view! Stay tuned for updates.</Text>
        </View>
      );
      break;
    default:
      content = <Text>404: {type}</Text>;
      break;
  }

  return (
    <CollectionContext.Provider
      value={{
        data,
        mutate,
        error,
        type,
        access: data?.access,
        swrKey,
        openLabelPicker: () => sheetRef.current?.present(),
      }}
    >
      <CollectionLabelMenu sheetRef={sheetRef}>
        <Pressable />
      </CollectionLabelMenu>
      {data && !data?.error ? (
        <ContentWrapper noPaddingTop>
          <CollectionNavbar
            editOrderMode={editOrderMode}
            setEditOrderMode={setEditOrderMode}
          />
          {content}
        </ContentWrapper>
      ) : (
        <Loading error={error || data?.error} />
      )}
    </CollectionContext.Provider>
  );
}

