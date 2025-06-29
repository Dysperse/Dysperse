import MarkdownRenderer from "@/components/MarkdownRenderer";
import { LocationPickerModal } from "@/components/collections/views/map";
import LabelPicker from "@/components/labels/picker";
import { STORY_POINT_SCALE } from "@/constants/workload";
import { AttachStep, OnboardingContainer } from "@/context/OnboardingProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useHotkeys } from "@/helpers/useHotKeys";
import AutoSizeTextArea from "@/ui/AutoSizeTextArea";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import ModalHeader from "@/ui/ModalHeader";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { FlashList } from "@shopify/flash-list";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { Image } from "expo-image";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useGlobalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, Keyboard, Platform, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import { useLabelColors } from "../../labels/useLabelColors";
import CreateTask, { AiLabelSuggestion } from "../create";
import { TaskShareButton } from "./TaskShareButton";
import { TaskCompleteButton } from "./attachment/TaskCompleteButton";
import { useTaskDrawerContext } from "./context";
import { TaskDetails } from "./details";

let AutoGrowingTextInput;

if (Platform.OS !== "ios") {
  AutoGrowingTextInput = () => null; // Provide a fallback or use a working alternative.
} else {
  AutoGrowingTextInput =
    require("react-native-autogrow-textinput").AutoGrowingTextInput;
}

function AISubtask({ task, updateTask }) {
  const modalRef = useRef(null);
  const { sessionToken } = useUser();

  const [open, setOpen] = useState(false);
  const [selectedSubtasks, setSelectedSubtasks] = useState([]);
  const [isCreationLoading, setIsCreationLoading] = useState(false);

  const { data, error } = useSWR(
    open
      ? [
          "ai/generate-subtasks",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({ task }),
          },
        ]
      : null,
    { revalidateOnFocus: false }
  );

  const handleAddSubtasks = async () => {
    setIsCreationLoading(true);
    try {
      const subtasks = selectedSubtasks.map((i) => data[i]);

      const t = await sendApiRequest(
        sessionToken,
        "PATCH",
        "space/entity",
        {},
        {
          body: JSON.stringify({
            entities: subtasks.map((subtask) => ({
              name: subtask.title,
              type: "TASK",
              parentTask: task,
              parentId: task.id,
              note: subtask.description,
              collectionId: task.collectionId,
            })),
          }),
        }
      );
      updateTask(
        {
          subtasks: {
            ...task.subtasks,
            ...t.reduce((acc, curr) => {
              acc[curr.id] = curr;
              return acc;
            }, {}),
          },
        },
        false
      );
      modalRef.current?.close();
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setIsCreationLoading(false);
    }
  };

  return (
    <>
      <MenuItem
        onPress={async () => {
          setOpen(true);
          modalRef.current?.present();
        }}
      >
        <Icon>prompt_suggestion</Icon>
        <Text variant="menuItem">Create subtasks</Text>
      </MenuItem>
      <Modal
        maxWidth={400}
        height="auto"
        innerStyles={{
          minHeight: 400,
          flex: Platform.OS === "web" ? 1 : undefined,
        }}
        animation="SCALE"
        transformCenter
        sheetRef={modalRef}
      >
        <ModalHeader title="AI subtasks" />
        <View style={{ flex: 1 }}>
          {data ? (
            <View
              style={{ flex: 1, padding: 10, paddingTop: 0, marginTop: -10 }}
            >
              {data.map((subtask, i) => (
                <ListItemButton
                  key={i}
                  onPress={() => {
                    setSelectedSubtasks((prev) =>
                      prev.includes(i)
                        ? prev.filter((t) => t !== i)
                        : [...prev, i]
                    );
                  }}
                  style={{
                    paddingVertical: 15,
                    paddingHorizontal: 20,
                  }}
                  pressableStyle={{
                    alignItems: "flex-start",
                  }}
                >
                  <Icon
                    filled={selectedSubtasks.includes(i)}
                    style={{ marginTop: 2 }}
                    size={30}
                  >
                    {selectedSubtasks.includes(i) ? "check_circle" : "circle"}
                  </Icon>
                  <ListItemText
                    primary={subtask.title}
                    secondary={subtask.description}
                  />
                </ListItemButton>
              ))}

              <View style={{ padding: 5, marginTop: "auto" }}>
                <Button
                  isLoading={isCreationLoading}
                  onPress={handleAddSubtasks}
                  variant="filled"
                  large
                  bold
                  text={`Add ${selectedSubtasks.length} subtasks`}
                  icon="add"
                />
              </View>
            </View>
          ) : (
            <View
              style={{
                padding: 20,
                paddingTop: 0,
              }}
            >
              {error ? (
                <ErrorAlert />
              ) : (
                <SkeletonContainer>
                  <LinearSkeletonArray
                    animateWidth
                    widths={[90, 70, 68, 82, 71, 62, 83]}
                    height={33}
                  />
                </SkeletonContainer>
              )}
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

function AiExplanation({ task }) {
  const modalRef = useRef(null);
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [generation, setGeneration] = useState([]);

  return (
    <>
      <MenuItem
        onPress={async () => {
          setIsLoading(true);
          modalRef.current?.present();

          await sendApiRequest(
            sessionToken,
            "POST",
            "ai/generate-explanation",
            {},
            { body: JSON.stringify({ task }) }
          )
            .then((data) => {
              setGeneration(data);
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
              Toast.show({ type: "error" });
            });
        }}
      >
        <Icon>lightbulb</Icon>
        <Text variant="menuItem">Describe</Text>
      </MenuItem>
      <Modal
        maxWidth={400}
        height="auto"
        innerStyles={{
          minHeight: Platform.OS === "web" ? 200 : 400,
          flex: Platform.OS === "web" ? 1 : undefined,
        }}
        animation="SCALE"
        transformCenter
        sheetRef={modalRef}
      >
        <ModalHeader title="AI Explanation" />
        <View style={{ flex: 1 }}>
          {!isLoading ? (
            <ScrollView
              style={{ flex: 1, padding: 20, paddingTop: 0, marginTop: -10 }}
            >
              <MarkdownRenderer>{generation}</MarkdownRenderer>
            </ScrollView>
          ) : (
            <View
              style={{
                padding: 20,
                paddingTop: 0,
              }}
            >
              <SkeletonContainer>
                <LinearSkeletonArray
                  animateWidth
                  widths={[90, 70, 68, 20, 40, 41, 82, 71, 62, 83]}
                  height={20}
                />
              </SkeletonContainer>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
}

function TaskNameInput() {
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const theme = useColorTheme();
  const [name, setName] = useState(task.name);
  const inputRef = useRef(null);

  useEffect(() => {
    // on keyboard close, blur the input
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        inputRef.current?.blur();
      }
    );
    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);

  const GrowingTextInput =
    Platform.OS === "ios" ? AutoGrowingTextInput : AutoSizeTextArea;

  const [debouncedName] = useDebounce(name, 300);

  const handleSave = () => {
    if (name === task.name) return;
    console.log("saved");
    setName(name.replaceAll("\n", ""));
    updateTask({ name: name.replaceAll("\n", "") });
  };
  useEffect(() => {
    // growing text input has a weird bug
    if (Platform.OS !== "ios") handleSave();
  }, [debouncedName]);

  return (
    <>
      <GrowingTextInput
        selectionColor={theme[11]}
        ref={inputRef}
        onBlur={handleSave}
        onChangeText={(text) => setName(text)}
        blurOnSubmit
        enterKeyHint="done"
        defaultValue={name}
        bounces={false}
        onKeyPress={(e) => {
          if (e.nativeEvent.key === "Enter" || e.nativeEvent.key === "Escape") {
            e.preventDefault();
            e.target.blur();
          }
        }}
        disabled={isReadOnly}
        // disable scroll
        scrollEnabled={false}
        style={[
          {
            fontFamily: "serifText700",
            color: theme[11],
            padding: 12,
            paddingVertical: 0,
            marginTop: 10,
            marginBottom: 3,
            borderRadius: 20,
            borderWidth: 2,
            shadowRadius: 0,
            borderColor: "transparent",
          },
        ]}
        fontSize={35}
      />
    </>
  );
}

function WorkloadChip() {
  const theme = useColorTheme();
  const { task, isReadOnly, updateTask } = useTaskDrawerContext();
  const complexityScale = ["XS", "S", "M", "L", "XL"];
  const legacyComplexityScale = [2, 4, 8, 16, 32];
  const menuRef = useRef(null);

  return (
    !(isReadOnly && !task.storyPoints) && (
      <MenuPopover
        menuRef={menuRef}
        containerStyle={{ width: 200 }}
        options={
          [
            ...legacyComplexityScale.map((n) => ({
              renderer: () => (
                <MenuItem
                  onPress={() => {
                    updateTask({ storyPoints: n });
                    menuRef.current?.close();
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: addHslAlpha(
                        theme[11],
                        n === task.storyPoints ? 1 : 0.1
                      ),
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "mono",
                        color: theme[n === task.storyPoints ? 1 : 11],
                      }}
                    >
                      {
                        complexityScale[
                          legacyComplexityScale.findIndex((i) => i === n)
                        ]
                      }
                    </Text>
                  </View>
                  <Text variant="menuItem">
                    {
                      STORY_POINT_SCALE[
                        legacyComplexityScale.findIndex((i) => i === n)
                      ]
                    }
                  </Text>
                </MenuItem>
              ),
            })),
            task.storyPoints && { divider: true },
            task.storyPoints && {
              renderer: () => (
                <MenuItem
                  onPress={() => {
                    updateTask({ storyPoints: null });
                    menuRef.current?.close();
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      backgroundColor: addHslAlpha(theme[11], 0.1),
                      borderRadius: 10,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon style={{ color: theme[11] }}>remove</Icon>
                  </View>
                  <Text variant="menuItem">Clear</Text>
                </MenuItem>
              ),
            },
          ] as any
        }
        trigger={
          <Button
            chip
            disabled={isReadOnly}
            icon="exercise"
            text={
              STORY_POINT_SCALE[
                legacyComplexityScale.findIndex((i) => i === task.storyPoints)
              ]
            }
            large
            backgroundColors={{
              default: addHslAlpha(theme[11], task.storyPoints ? 0.1 : 0),
              hovered: addHslAlpha(theme[11], 0.1),
              pressed: addHslAlpha(theme[11], 0.2),
            }}
            borderColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
            variant={!task.storyPoints ? "outlined" : "filled"}
            iconStyle={{ marginTop: -3 }}
          />
        }
      />
    )
  );
}

function TaskMoreMenu({ handleDelete }) {
  const theme = useColorTheme();
  const { session } = useUser();
  const { task } = useTaskDrawerContext();

  return (
    <>
      <MenuPopover
        options={[
          session?.user?.betaTester && {
            icon: "content_copy",
            text: "Duplicate",
            callback: () => Toast.show({ type: "info", text1: "Coming soon!" }),
          },
          {
            icon: task.trash ? "restore_from_trash" : "delete",
            text: task.trash ? "Restore from trash" : "Move to trash",
            callback: handleDelete,
          },
          task?.integrationParams && {
            renderer: () => (
              <Text
                style={{
                  opacity: 0.6,
                  fontSize: 12,
                  textAlign: "center",
                  marginVertical: 5,
                  color: theme[11],
                }}
              >
                {`Synced with ${
                  task?.integrationParams?.from || "integration"
                }`}
              </Text>
            ),
          },
        ]}
        trigger={<IconButton icon="pending" size={45} />}
      />
    </>
  );
}

function AICategorizer({ task, updateTask }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const handleCreate = () => {
    setOpen(true);
    ref.current.present();
  };

  const { data, error } = useSWR(
    !open
      ? null
      : [
          "ai/categorize-tasks",
          {},
          process.env.EXPO_PUBLIC_API_URL,
          {
            method: "POST",
            body: JSON.stringify({ task }),
          },
        ],
    { revalidateOnFocus: false }
  );

  return (
    <>
      <MenuItem text="Categorize" icon="category" onPress={handleCreate} />
      <Modal animation="SCALE" sheetRef={ref} maxWidth={400} height="auto">
        <ModalHeader title="AI Sorting" />
        {data ? (
          <View
            style={{
              padding: 20,
              paddingHorizontal: 10,
              paddingTop: 0,
              marginTop: -10,
            }}
          >
            <ListItemButton>
              <Emoji emoji={data.label?.emoji} size={30} />
              <ListItemText primary="Label" secondary={data.label?.name} />
            </ListItemButton>
            <ListItemButton>
              <Avatar icon="priority_high" />
              <ListItemText
                primary="Urgency"
                secondary={data.pinned ? "Urgent" : "Normal"}
              />
            </ListItemButton>
            <ListItemButton>
              <Avatar icon="exercise" />
              <ListItemText
                primary={"Complexity"}
                secondary={`${data.storyPoints} - ${data.storyPointReason}`}
              />
            </ListItemButton>

            <Button
              onPress={() =>
                updateTask({
                  label: data.label,
                  pinned: data.pinned,
                  storyPoints: data.storyPoints,
                  storyPointReason: data.storyPointReason,
                })
              }
              text="Apply changes"
              variant="filled"
              bold
              large
              iconPosition="end"
              icon="east"
              containerStyle={{ marginTop: 10, marginHorizontal: 10 }}
            />
          </View>
        ) : (
          <View
            style={{
              padding: 20,
              paddingTop: 0,
            }}
          >
            {error ? (
              <ErrorAlert />
            ) : (
              <SkeletonContainer>
                <LinearSkeletonArray
                  animateWidth
                  widths={[90, 70, 68, 82]}
                  height={50}
                />
              </SkeletonContainer>
            )}
          </View>
        )}
      </Modal>
    </>
  );
}

function TaskSidekickMenu() {
  const { task, updateTask } = useTaskDrawerContext();
  return (
    <MenuPopover
      containerStyle={{ width: 200 }}
      trigger={<IconButton icon="raven" size={45} />}
      options={[
        {
          renderer: () => <AiExplanation task={task} updateTask={updateTask} />,
        },
        {
          renderer: () => <AISubtask task={task} updateTask={updateTask} />,
        },
        {
          renderer: () => <AICategorizer task={task} updateTask={updateTask} />,
        },
      ]}
    />
  );
}

function TaskHome({ labelPickerRef, forceClose }) {
  const theme = useColorTheme();
  const labelColors = useLabelColors();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const { id: collectionId } = useGlobalSearchParams();
  const rotate = useSharedValue(task.pinned ? -35 : 0);

  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

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

  const handlePriorityChange = useCallback(() => {
    if (Platform.OS !== "web") impactAsync(ImpactFeedbackStyle.Light);
    rotate.value = withSpring(!task.pinned ? -35 : 0, {
      mass: 1,
      damping: 10,
      stiffness: 200,
      overshootClamping: false,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 2,
    });
    updateTask({ pinned: !task.pinned });
  }, [task.pinned, updateTask, rotate]);

  useHotkeys(["shift+1"], () => handlePriorityChange());

  return (
    <SafeScrollView
      // bounces={false}
      showsHorizontalScrollIndicator={false}
      style={{
        maxHeight: Dimensions.get("window").height - 200,
      }}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <View
        style={{
          paddingHorizontal: 15,
          paddingTop: 45,
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            gap: 10,
            paddingHorizontal: 13,
            flexDirection: "row",
          }}
        >
          <Button
            chip
            large
            variant="outlined"
            disabled={isReadOnly}
            onPress={handlePriorityChange}
            icon={
              <Animated.View style={rotateStyle}>
                <Icon
                  filled={task.pinned}
                  style={{
                    marginTop: -1,
                    ...(task.pinned ? { color: labelColors.orange[11] } : {}),
                  }}
                >
                  push_pin
                </Icon>
              </Animated.View>
            }
            backgroundColors={
              task.pinned
                ? {
                    default: labelColors.orange[6],
                    hovered: labelColors.orange[7],
                    pressed: labelColors.orange[8],
                  }
                : {
                    default: addHslAlpha(theme[11], 0),
                    hovered: addHslAlpha(theme[11], 0.1),
                    pressed: addHslAlpha(theme[11], 0.2),
                  }
            }
            borderColors={
              task.pinned
                ? {
                    default: addHslAlpha(labelColors.orange[11], 0),
                    hovered: addHslAlpha(labelColors.orange[11], 0.1),
                    pressed: addHslAlpha(labelColors.orange[11], 0.2),
                  }
                : {
                    default: addHslAlpha(theme[11], 0.1),
                    hovered: addHslAlpha(theme[11], 0.2),
                    pressed: addHslAlpha(theme[11], 0.3),
                  }
            }
            style={task.pinned && { borderColor: labelColors.orange[11] }}
          />
          {task && !task.parentTaskId && (
            <LabelPicker
              label={task?.label || undefined}
              setLabel={(e: any) => {
                updateTask({ labelId: e.id, label: e });
              }}
              onClose={() => {}}
              sheetProps={{ sheetRef: labelPickerRef }}
              defaultCollection={collectionId as any}
            >
              <Button
                chip
                disabled={isReadOnly}
                icon={
                  task.label?.emoji || task.collection?.emoji ? (
                    <Emoji
                      emoji={task?.label?.emoji || task.collection.emoji}
                      size={20}
                    />
                  ) : (
                    <Icon>tag</Icon>
                  )
                }
                large
                text={task?.label?.name || task?.collection?.name}
                variant="outlined"
                backgroundColors={{
                  default: addHslAlpha(theme[11], 0),
                  hovered: addHslAlpha(theme[11], 0.1),
                  pressed: addHslAlpha(theme[11], 0.2),
                }}
                textStyle={{ fontSize: 15 }}
              />
            </LabelPicker>
          )}
          {!task.parentTaskId && <WorkloadChip />}
          {task && !task.label && task.collectionId && (
            <AiLabelSuggestion
              watch={(key) => task[key]}
              setValue={(key, value) => {
                if (key === "label")
                  updateTask({ label: value, labelId: value.id });
              }}
              style={{
                borderColor: addHslAlpha(theme[11], 0.2),
                borderWidth: 2,
                margin: -0.5,
                marginLeft: 1,
                borderRadius: 10,
              }}
            />
          )}
        </View>
        <TaskNameInput />
        <TaskDetails />
      </View>
    </SafeScrollView>
  );
}

function PhotoSelection() {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const [photos, setPhotos] = useState([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();

  useEffect(() => {
    const getPhotos = async () => {
      if (!permission?.granted) {
        const { status } = await requestPermission();
        if (status !== "granted") return;
      }

      const assets = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 10,
        sortBy: [["creationTime", false]], // false = descending
      });

      console.log("Assets:", assets.assets);

      setPhotos(assets.assets);
    };

    getPhotos();
  }, []);

  return (
    <View style={{ width: "100%" }}>
      <FlashList
        horizontal
        data={photos}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        ListHeaderComponent={() => (
          <IconButton
            size={100}
            variant="filled"
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
            style={{ borderRadius: 20, marginRight: 7 }}
            onPress={async () => {
              const result = await MediaLibrary.launchImageLibraryAsync({
                mediaTypes: MediaLibrary.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });

              if (!result.canceled) {
                const asset = result.assets[0];
                updateTask({
                  attachments: [
                    ...(task.attachments || []),
                    { uri: asset.uri, type: "image" },
                  ],
                });
              }
            }}
          >
            <Icon size={40}>add</Icon>
          </IconButton>
        )}
        renderItem={({ item }) => (
          <IconButton
            size={100}
            variant="filled"
            style={{ borderRadius: 20, marginRight: 7, overflow: "hidden" }}
          >
            <Image
              source={{ uri: item.uri }}
              style={{
                width: "100%",
                height: "100%",
              }}
            />
          </IconButton>
        )}
      />
    </View>
  );
}

function LocationSelector({ handleBack }) {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  const [loading, setLoading] = useState(false);

  const handleCurrent = async () => {
    setLoading(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      // const place = await Location.reverseGeocodeAsync({
      //   latitude,
      //   longitude,
      // });
      // fetch the place details with nominatim
      const placeDetails = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      ).then((r) => r.json());
      if (!placeDetails || !placeDetails.place_id) {
        Toast.show({
          type: "error",
          text1: "Could not find location",
        });
        return;
      }
      updateTask({
        location: {
          placeId: placeDetails.place_id,
          name: placeDetails.display_name,
          coordinates: [latitude, longitude],
        },
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Something went wrong",
      });
    }
    handleBack();
    setLoading(false);
  };

  return (
    <>
      <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
        <Button
          containerStyle={{ flex: 1 }}
          variant="filled"
          large
          icon="near_me"
          text="Current"
          onPress={handleCurrent}
          isLoading={loading}
          iconStyle={{ transform: [{ scale: 1.3 }] }}
          backgroundColors={{
            default: addHslAlpha(theme[11], 0.1),
            hovered: addHslAlpha(theme[11], 0.2),
            pressed: addHslAlpha(theme[11], 0.3),
          }}
        />
        <LocationPickerModal
          hideSkip
          defaultQuery={task.name.trim()}
          closeOnSelect
          onLocationSelect={(location) =>
            updateTask({
              location: {
                placeId: location.place_id,
                name: location.display_name,
                coordinates: [location.lat, location.lon],
              },
            })
          }
        >
          <Button
            containerStyle={{ flex: 1 }}
            backgroundColors={{
              default: addHslAlpha(theme[11], 0.1),
              hovered: addHslAlpha(theme[11], 0.2),
              pressed: addHslAlpha(theme[11], 0.3),
            }}
            variant="filled"
            large
            icon="search"
            text="Search"
          />
        </LocationPickerModal>
      </View>
    </>
  );
}

function SubtaskCreation({ handleBack }) {
  const theme = useColorTheme();
  const { task, updateTask } = useTaskDrawerContext();

  return (
    <View style={{ width: "100%", flexDirection: "row", gap: 10 }}>
      <CreateTask
        stackBehavior="replace"
        mutate={(t) => {
          updateTask({
            subtasks: {
              ...task.subtasks,
              [t.id]: t,
            },
          });
        }}
        onPress={() => {
          if (Platform.OS === "web" && !localStorage.getItem("subtaskTip")) {
            localStorage.setItem("subtaskTip", "true");
            Toast.show({
              type: "info",
              text1: "Pro tip",
              text2: "Tap twice on a task to open this popup",
              visibilityTime: 5000,
            });
          }
        }}
        defaultValues={{ parentTask: task }}
      >
        <Button
          containerStyle={{ flex: 1 }}
          variant="filled"
          large
          icon="prompt_suggestion"
          style={{ justifyContent: "flex-start", marginHorizontal: 5 }}
          text="Create subtask"
          backgroundColors={{
            default: addHslAlpha(theme[11], 0.1),
            hovered: addHslAlpha(theme[11], 0.2),
            pressed: addHslAlpha(theme[11], 0.3),
          }}
        />
      </CreateTask>
    </View>
  );
}

function AttachmentPicker({ forceClose, handleBack }) {
  const SafeScrollView = forceClose ? BottomSheetScrollView : ScrollView;

  return (
    <SafeScrollView
      // bounces={false}
      showsHorizontalScrollIndicator={false}
      style={{
        maxHeight: Dimensions.get("window").height - 200,
        paddingHorizontal: 15,
        paddingTop: 30,
        paddingBottom: 30,
      }}
      onScrollBeginDrag={Keyboard.dismiss}
    >
      <Text variant="eyebrow" style={{ marginBottom: 5 }}>
        Photo
      </Text>
      <PhotoSelection handleBack={handleBack} />
      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
        Location
      </Text>
      <LocationSelector handleBack={handleBack} />
      <Text variant="eyebrow" style={{ marginBottom: 5, marginTop: 20 }}>
        Subtask
      </Text>
      <SubtaskCreation handleBack={handleBack} />
    </SafeScrollView>
  );
}

export function TaskDrawerContent({
  forceClose,
}: {
  forceClose?: (config?: any) => void;
}) {
  const theme = useColorTheme();
  const { task, updateTask, isReadOnly } = useTaskDrawerContext();
  const labelPickerRef = useRef(null);

  const [view, setView] = useState<"HOME" | "ATTACH">("HOME");

  const handleDelete = useCallback(
    async (d) => {
      try {
        const t = typeof d === "boolean" ? d : !task.trash;
        updateTask({ trash: t });
        Toast.show({
          type: "success",
          text1: t ? "Task deleted!" : "Task restored!",

          props: {
            renderTrailingIcon: !t
              ? null
              : () => (
                  <IconButton
                    icon="undo"
                    size={40}
                    style={{
                      marginRight: 5,
                      marginLeft: -10,
                    }}
                    backgroundColors={{
                      default: theme[5],
                      hovered: theme[6],
                      pressed: theme[7],
                    }}
                    onPress={() => handleDelete(false)}
                  />
                ),
          },
        });
        forceClose();
      } catch (e) {
        Toast.show({
          type: "error",
          text1: "Something went wrong. Please try again later",
        });
      }
    },
    [updateTask, task, theme, forceClose]
  );

  useHotkeys(["delete", "backspace"], () => handleDelete(true));
  useHotkeys(["shift+3"], () => labelPickerRef.current?.present());

  return (
    <>
      <OnboardingContainer
        delay={1000}
        id="TASK_DRAWER"
        onlyIf={() => true}
        steps={[
          {
            text: "Tap to instantly share your task with others",
          },
          {
            text: "Mark your task as done",
          },
          {
            text: "Double-tap on any task to quickly create a subtask",
          },
        ]}
      >
        {() => (
          <>
            <KeyboardAvoidingView behavior="height">
              {view === "HOME" ? (
                <TaskHome
                  forceClose={forceClose}
                  labelPickerRef={labelPickerRef}
                />
              ) : (
                <AttachmentPicker
                  handleBack={() => setView("HOME")}
                  forceClose={forceClose}
                />
              )}
              {!isReadOnly && (
                <View
                  style={{
                    padding: 20,
                    flexDirection: "row",
                    gap: 5,
                    height: 90,
                  }}
                >
                  {view === "HOME" && <TaskShareButton />}
                  {view === "HOME" && <TaskCompleteButton />}

                  <AttachStep index={2} style={{ flex: 1 }}>
                    <Button
                      large
                      bold
                      icon={view === "HOME" ? "note_stack_add" : "close"}
                      onPress={() => {
                        impactAsync(ImpactFeedbackStyle.Heavy);
                        setView((t) => (t === "HOME" ? "ATTACH" : "HOME"));
                      }}
                      variant="filled"
                      text={view === "HOME" ? undefined : "Attach"}
                      iconPosition="end"
                      containerStyle={{
                        flex: 1,
                        marginLeft: view === "ATTACH" ? "auto" : undefined,
                      }}
                      style={
                        view === "ATTACH" && {
                          marginHorizontal: 5,
                        }
                      }
                      backgroundColors={{
                        default: addHslAlpha(theme[11], 0.1),
                        hovered: addHslAlpha(theme[11], 0.2),
                        pressed: addHslAlpha(theme[11], 0.3),
                      }}
                    />
                  </AttachStep>
                </View>
              )}
            </KeyboardAvoidingView>
          </>
        )}
      </OnboardingContainer>
    </>
  );
}

