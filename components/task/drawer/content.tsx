import { LabelPicker } from "@/components/labels/picker";
import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { Menu } from "@/ui/Menu";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  TouchableOpacity,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import mime from "mime-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Keyboard,
  Platform,
  Pressable,
  View,
  useColorScheme,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { useLabelColors } from "../../labels/useLabelColors";
import { styles } from "../create/styles";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

function ImagePickerItem({ task, item }: { task; item: MediaLibrary.Asset }) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const handlePress = useCallback(async () => {
    try {
      setLoading(true);
      const form: any = new FormData();
      form.append("image", {
        uri: item.uri,
        name: item.filename,
        type: mime.lookup(item.filename),
      });

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=9fb5ded732b6b50da7aca563dbe66dec",
        {
          method: "POST",
          body: form,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then((res) => res.json());
      const d = await sendApiRequest(
        session,
        "POST",
        "space/entity/attachments",
        {},
        {
          body: JSON.stringify({
            id: task.id,
            type: "IMAGE",
            data: res.data.display_url,
          }),
        }
      );
      console.log(d, res);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [item]);

  return (
    <View
      style={{
        width: "33.3333%",
        padding: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TouchableOpacity onPress={handlePress}>
        <Image
          transition={100}
          source={{
            uri: item.uri,
            height: 200,
            width: 200,
          }}
          style={{ width: "100%", aspectRatio: 1, borderRadius: 10 }}
        />
        {loading && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.9)",
              zIndex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
            }}
          >
            <Spinner />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

function TaskImagePicker({ task }) {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectAlbums, setSelectAlbums] = useState(false);

  const getAlbumsAsync = async () => {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Toast.show({
        type: "error",
        text1: "Please enable media library permissions in your settings.",
      });
    }

    const albums = await MediaLibrary.getAlbumsAsync();
    setAlbums(albums);

    // find album with highest number of assets
    setSelectedAlbum(
      albums.reduce((a, b) => (a.assetCount > b.assetCount ? a : b), albums[0])
    );
  };

  useEffect(() => {
    getAlbumsAsync();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      MediaLibrary.getAssetsAsync({
        first: 50,
        mediaType: "photo",
        sortBy: "modificationTime",
        album: selectedAlbum.id,
      }).then((e) => setAssets(e.assets));
    }
  }, [selectedAlbum]);

  const loadMoreAlbums = () => {
    if (!selectedAlbum || assets.length === 0) {
      return;
    }
    MediaLibrary.getAssetsAsync({
      first: 50,
      mediaType: "photo",
      sortBy: "modificationTime",
      album: selectedAlbum.id,
      after:
        Platform.OS === "android"
          ? (assets.length + 1).toString()
          : assets[assets.length - 1].id,
    })
      .then((e) => setAssets([...assets, ...e.assets]))
      .catch((e) => alert("Error"));
  };

  return selectAlbums ? (
    <FlatList
      data={albums}
      renderItem={({ item }) => (
        <ListItemButton
          onPress={() => {
            setSelectedAlbum(item);
            setSelectAlbums(false);
          }}
        >
          <ListItemText
            primary={item.title}
            secondary={item.assetCount + " photos"}
          />
          {selectedAlbum?.id === item.id && <Icon>check</Icon>}
        </ListItemButton>
      )}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <>
      <BottomSheetFlatList
        data={assets}
        key={selectedAlbum?.id}
        numColumns={3}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.uri}
        onEndReached={loadMoreAlbums}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          this.onEndReachedCalledDuringMomentum = false;
        }}
        ListHeaderComponent={
          <View style={{ padding: 5 }}>
            <Button
              variant="filled"
              style={{ marginTop: 10 }}
              onPress={() => setSelectAlbums(true)}
            >
              <ButtonText>{selectedAlbum?.title}</ButtonText>
              <Icon>expand_more</Icon>
            </Button>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => <ImagePickerItem task={task} item={item} />}
      />
    </>
  );
}

function TaskCompleteButton() {
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const { task, updateTask, mutateList } = useTaskDrawerContext();
  const green = useColor("green", useColorScheme() == "dark");
  const isCompleted = task.completionInstances.length > 0;
  const [isLoading, setIsLoading] = useState(false);
  const { animatedIndex } = useBottomSheet();

  const handlePress = async () => {
    try {
      const newArr = isCompleted ? [] : [...task.completionInstances, true];
      updateTask("completionInstances", newArr, false);
      await sendApiRequest(
        sessionToken,
        isCompleted ? "DELETE" : "POST",
        "space/entity/complete-task",
        {},
        {
          body: JSON.stringify({
            id: task.id,
            recurring: false,
          }),
        }
      );
      if (animatedIndex.value === -1) {
        mutateList({
          ...task,
          completionInstances: newArr,
        });
      }
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
    }
  };

  return (
    <>
      <IconButton
        style={({ pressed, hovered }) => ({
          borderWidth: 1,
          borderColor: isCompleted
            ? green[pressed ? 8 : hovered ? 7 : 6]
            : theme[pressed ? 8 : hovered ? 7 : 6],
          backgroundColor: isCompleted
            ? green[pressed ? 6 : hovered ? 5 : 4]
            : theme[pressed ? 4 : hovered ? 3 : 2],
        })}
        size={55}
        onPress={handlePress}
      >
        {isLoading ? (
          <Spinner color={isCompleted ? green[11] : theme[11]} />
        ) : (
          <Icon
            size={27}
            style={{
              color: isCompleted ? green[11] : theme[11],
            }}
          >
            done_outline
          </Icon>
        )}
      </IconButton>
    </>
  );
}

function TaskNameInput() {
  const { task, updateTask } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);

  return (
    <AutoSizeTextArea
      onBlur={(e) => {
        if (name === task.name) return;
        updateTask("name", name);
      }}
      onChangeText={(text) => setName(text.replaceAll("\n", ""))}
      value={name}
      style={{
        fontFamily: "body_200",
        color: theme[12],
        paddingHorizontal: 20,
        marginVertical: 20,
        textAlign: "center",
      }}
      fontSize={50}
    />
  );
}

function TaskAttachmentPicker({
  placeholder,
  updateTask,
  onAttachmentCreate,
  task,
  handleParentClose,
  footer = null,
  multiline,
  type,
}: {
  placeholder: string;
  updateTask?: any;
  onAttachmentCreate: (newData) => void;
  task: any;
  handleParentClose: any;
  footer?: JSX.Element;
  multiline?: boolean;
  type: string;
}) {
  const theme = useColorTheme();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      data: type == "NOTE" ? task.note ?? "" : "",
    },
  });

  const { session } = useSession();

  const onSubmit = useCallback(
    async (values) => {
      try {
        if (type === "NOTE") {
          await updateTask("note", values.data);
          setIsLoading(false);
          return;
        }
        if (typeof onAttachmentCreate === "function") {
          onAttachmentCreate(values.location);
          return;
        }
        Keyboard.dismiss();
        setIsLoading(true);
        const d = await sendApiRequest(
          session,
          "POST",
          "space/entity/attachments",
          {},
          {
            body: JSON.stringify({
              id: task.id,
              type,
              data: values.data,
            }),
          }
        );
        updateTask("attachments", [...task.attachments, d], false);
      } catch {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      } finally {
        handleParentClose();
        setIsLoading(false);
      }
    },
    [session, task, updateTask, onAttachmentCreate, handleParentClose, type]
  );

  useEffect(() => {
    if (errors.data) {
      Toast.show({
        type: "error",
        text1: "Please enter a " + type.toLowerCase(),
      });
    }
  }, [errors.data, type]);

  return (
    <View style={{ padding: 20, gap: 20, flex: 1 }}>
      <Controller
        control={control}
        rules={{ required: true }}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            bottomSheet
            placeholder={placeholder}
            variant="filled+outlined"
            style={{
              paddingHorizontal: 25,
              paddingVertical: 15,
              fontSize: 20,
              borderRadius: 30,
              ...(multiline && {
                flex: 1,
              }),
            }}
            multiline={multiline}
            autoFocus
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
          />
        )}
        name="data"
      />
      {footer}
      <Button
        onPress={handleSubmit(onSubmit)}
        isLoading={isLoading}
        style={({ pressed, hovered }: any) => ({
          backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
          width: "100%",
          height: 60,
          marginBottom: -20,
        })}
      >
        <ButtonText style={{ fontSize: 20 }}>Done</ButtonText>
        <Icon>check</Icon>
      </Button>
    </View>
  );
}

function AttachmentGrid({
  task,
  updateTask,
  setView,
  onAttachmentCreate,
  onClose,
  menuRef,
}) {
  const theme = useColorTheme();

  const taskMenuCardStyle = ({ pressed, hovered }: any) => [
    styles.attachmentCard,
    { backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3] },
  ];

  const menuRows = [
    [
      { icon: "location_on", text: "Location" },
      { icon: "link", text: "Link" },
    ],
    [
      { icon: "sticky_note_2", text: "Note" },
      { icon: "camera_alt", text: "Image" },
    ],
  ];

  return menuRows.map((row, rowIndex) => (
    <View key={rowIndex} style={styles.gridRow}>
      {row.map((item, itemIndex) => (
        <Pressable
          key={itemIndex}
          onPress={() => setView(item.text)}
          style={taskMenuCardStyle}
        >
          <Avatar size={45} disabled>
            <Icon>{item.icon}</Icon>
          </Avatar>
          <Text style={styles.attachmentCardText}>{item.text}</Text>
        </Pressable>
      ))}
    </View>
  ));
}

type TaskAttachmentType = "Add" | "Location" | "Link" | "Note" | "Image";
export function TaskAttachmentButton({
  children,
  onClose,
  onOpen,
  onAttachmentCreate,
  defaultView = "Add",
  lockView = false,
}: {
  children?: JSX.Element;
  onClose?: () => void;
  onOpen?: () => void;
  onAttachmentCreate?: (data: string) => void;
  defaultView?: TaskAttachmentType;
  lockView?: boolean;
}) {
  const { task, updateTask } = useTaskDrawerContext();

  const menuRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();

  const [view, setView] = useState<TaskAttachmentType>(defaultView);

  return (
    <Menu
      menuRef={menuRef}
      height={[view === "Image" ? "60%" : 390]}
      onClose={() => {
        onClose?.();
        if (lockView) return;
        setView("Add");
      }}
      width={400}
      onOpen={onOpen}
      trigger={
        children || (
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={27}>edit</Icon>
          </IconButton>
        )
      }
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        <IconButton
          onPress={() => {
            if (view === "Add" || lockView) {
              menuRef.current.close();
            } else {
              onClose?.();
              setView("Add");
            }
          }}
          variant="outlined"
          size={55}
        >
          <Icon>
            {view === "Add" || lockView ? "close" : "arrow_back_ios_new"}
          </Icon>
        </IconButton>
        <Text weight={700} style={{ fontSize: 23 }}>
          {view}
        </Text>
      </View>
      {view === "Add" && (
        <AttachmentGrid
          task={task}
          updateTask={updateTask}
          menuRef={menuRef}
          onClose={onClose}
          onAttachmentCreate={onAttachmentCreate}
          setView={setView}
        />
      )}
      {view === "Location" && (
        <TaskAttachmentPicker
          type="LOCATION"
          placeholder="Enter a location"
          handleParentClose={() => menuRef.current?.close()}
          onAttachmentCreate={onAttachmentCreate}
          task={task}
          updateTask={updateTask}
        />
      )}
      {view === "Link" && (
        <TaskAttachmentPicker
          type="LINK"
          placeholder="Enter a link"
          handleParentClose={() => menuRef.current?.close()}
          onAttachmentCreate={onAttachmentCreate}
          task={task}
          updateTask={updateTask}
          footer={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
              }}
            >
              <Icon>lightbulb</Icon>
              <Text>Supports YouTube, Canvas, Zoom, and more.</Text>
            </View>
          }
        />
      )}
      {view === "Image" && <TaskImagePicker task={task} />}
      {view === "Note" && (
        <TaskAttachmentPicker
          type="NOTE"
          multiline
          placeholder="Type in a note..."
          handleParentClose={() => menuRef.current?.close()}
          onAttachmentCreate={onAttachmentCreate}
          task={task}
          updateTask={updateTask}
        />
      )}
    </Menu>
  );
}

export function TaskDrawerContent({ handleClose }) {
  const theme = useColorTheme();
  const labelColors = useLabelColors();
  const { task, updateTask, mutateList } = useTaskDrawerContext();

  const rotate = useSharedValue(task.pinned ? -35 : 0);

  const handlePriorityChange = useCallback(() => {
    rotate.value = withSpring(!task.pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
    updateTask("pinned", !task.pinned);
  }, [task.pinned, updateTask, rotate]);

  const handleDelete = useCallback(async () => {
    try {
      updateTask("trash", true);
      handleClose();
      setImmediate(async () => {
        mutateList({ ...task, trash: true });
        Toast.show({
          type: "success",
          text1: "Task deleted!",
        });
      });
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
    }
  }, [handleClose, updateTask, mutateList, task]);

  // Rotate the pin icon by 45 degrees if the task is pinned using react-native-reanimated
  const rotateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${rotate.value}deg`,
        },
      ],
    };
  });

  return (
    <>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: theme[2],
          paddingHorizontal: 20,
          left: 0,
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            paddingTop: 10,
            flexDirection: "row",
            gap: 10,
            width: "100%",
          }}
        >
          <IconButton
            onPress={handleClose}
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
          >
            <Icon size={28}>close</Icon>
          </IconButton>
          <View style={{ flex: 1 }} />
          <TaskCompleteButton />
          <IconButton
            style={{ borderWidth: 1, borderColor: theme[6] }}
            size={55}
            onPress={handleDelete}
          >
            <Icon size={27}>delete</Icon>
          </IconButton>
          <TaskAttachmentButton />
        </View>
      </View>
      <BottomSheetScrollView>
        <View style={{ paddingBottom: 20, paddingHorizontal: 20 }}>
          <View
            style={{
              paddingHorizontal: 10,
              gap: 10,
              marginTop: 30,
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Chip
              onPress={handlePriorityChange}
              icon={
                <Animated.View style={rotateStyle}>
                  <Icon
                    filled={task.pinned}
                    style={{
                      ...(task.pinned ? { color: labelColors.orange[3] } : {}),
                    }}
                  >
                    push_pin
                  </Icon>
                </Animated.View>
              }
              style={{
                backgroundColor: task.pinned
                  ? labelColors.orange[11]
                  : "transparent",
                borderWidth: 1,
                borderColor: task.pinned ? labelColors.orange[3] : theme[6],
              }}
            />
            <LabelPicker
              label={task.labelId}
              setLabel={(e) => {
                updateTask("labelId", e.id);
                updateTask("label", e, false);
              }}
              onClose={() => {}}
              autoFocus={false}
            >
              <Chip
                icon={<Icon>new_label</Icon>}
                label="Add label"
                style={({ pressed }) => ({
                  backgroundColor: theme[pressed ? 4 : 2],
                  borderWidth: 1,
                  borderColor: theme[6],
                })}
                {...(task.label && {
                  icon: <Emoji emoji={task.label.emoji} />,
                  label: (
                    <Text style={{ color: labelColors[task.label.color][11] }}>
                      {task.label.name}
                    </Text>
                  ),
                  style: {
                    backgroundColor: labelColors[task.label.color][5],
                  },
                })}
              />
            </LabelPicker>
          </View>
          <TaskNameInput />
          <TaskDetails />
        </View>
      </BottomSheetScrollView>
    </>
  );
}
