import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import MenuPopover, { MenuItem } from "@/ui/MenuPopover";
import Modal from "@/ui/Modal";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import * as ImagePicker from "expo-image-picker";
import React, {
  cloneElement,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Platform, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Toast from "react-native-toast-message";
import { getPreviewText } from "..";
import TaskNoteEditor from "./TaskNoteEditor";
import { useTaskDrawerContext } from "./context";

function LinkModal({ children, onSubmit }) {
  const modalRef = useRef(null);
  const urlRef = useRef(null);
  const nameRef = useRef(null);

  const trigger = cloneElement(children, {
    onPress: () => {
      modalRef.current.present();
      setTimeout(() => {
        urlRef.current.focus();
      }, 400);
    },
  });

  const removeTrailingSlash = (site) => {
    return site.replace(/\/$/, "");
  };

  const handleSubmit = () => {
    try {
      onSubmit({
        name: nameRef.current.value || null,
        url: removeTrailingSlash(new URL(urlRef.current.value).toString()),
      });
      modalRef.current.close();
    } catch (e) {
      Toast.show({ type: "error", text1: "Please insert a valid URL" });
      setTimeout(() => {
        urlRef.current.focus();
      }, 400);
    }
  };

  return (
    <>
      {trigger}
      <Modal
        sheetRef={modalRef}
        maxWidth={350}
        animation="SCALE"
        innerStyles={{ padding: 20, gap: 10 }}
      >
        <View
          style={{
            marginBottom: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text weight={900} style={{ fontSize: 20 }}>
            Insert link
          </Text>
          <IconButton icon="close" variant="filled" />
        </View>
        <TextField
          onSubmitEditing={handleSubmit}
          inputRef={urlRef}
          variant="filled+outlined"
          placeholder="URL"
        />
        <TextField
          onSubmitEditing={handleSubmit}
          inputRef={nameRef}
          variant="filled+outlined"
          placeholder="Display name (optional)"
        />
        <Button
          variant="filled"
          onPress={handleSubmit}
          bold
          large
          text="Insert"
          icon="add"
        />
      </Modal>
    </>
  );
}

function countWords(str) {
  return str.trim().split(/\s+/).length;
}

function NoteInsertMenu({ isFocused, editorRef }) {
  const theme = useColorTheme();
  const insertMenuStyles = useAnimatedStyle(() => ({
    opacity: isFocused.value,
    top: 0,
    right: 0,
    margin: 5,
    zIndex: 9999,
    position: "absolute",
  }));

  const pickImageAsync = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    });

    if (!result.canceled) {
      Toast.show({
        type: "info",
        props: { loading: true },
        text1: "Uploading image...",
        swipeable: false,
        visibilityTime: 1e9,
      });

      // convert to File
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob());
      const form = new FormData();

      form.append(
        "source",
        new File([blob], "filename", {
          type: "image/png",
          lastModified: new Date().getTime(),
        })
      );

      const res = await fetch("https://api.dysperse.com/upload", {
        method: "POST",
        body: form,
      }).then((res) => res.json());

      editorRef.current.insertImage(res.image.display_url);
      Toast.hide();
      Toast.show({ type: "success", text1: "Image attached!" });
    } else {
      alert("You did not select any image.");
    }
  };

  return (
    <Animated.View style={insertMenuStyles}>
      <MenuPopover
        trigger={
          <Button
            // onPress={() => editorRef.current.focus()}
            // {...(Platform.OS === "web"
            //   ? {
            //       onMouseDown: () =>
            //         setTimeout(() => editorRef.current.focus(), 0),
            //     }
            //   : {})}
            backgroundColors={{
              default: addHslAlpha(theme[5], 0.7),
              hovered: addHslAlpha(theme[5], 0.8),
              pressed: addHslAlpha(theme[5], 0.9),
            }}
            icon="add"
            text="Insert"
            variant="filled"
            dense
          />
        }
        closeOnSelect
        menuProps={{
          // onOpen: () => editorRef.current.focus(),
          onClose: () => editorRef.current.focus(),
        }}
        options={[
          {
            renderer: () => (
              <View style={{ flexDirection: "row" }}>
                <MenuItem onPress={() => editorRef.current.insertHeading(1)}>
                  <Icon>format_h1</Icon>
                </MenuItem>
                <MenuItem onPress={() => editorRef.current.insertHeading(2)}>
                  <Icon>format_h2</Icon>
                </MenuItem>
                <MenuItem onPress={() => editorRef.current.insertHeading(3)}>
                  <Icon>format_h3</Icon>
                </MenuItem>
              </View>
            ),
          },
          {
            renderer: () => (
              <LinkModal
                onSubmit={(link) => editorRef.current.insertLink(link)}
              >
                <MenuItem>
                  <Icon>link</Icon>
                  <Text variant="menuItem">Link</Text>
                </MenuItem>
              </LinkModal>
            ),
          },
          { icon: "image", text: "Image", callback: pickImageAsync },
          {
            icon: "location_on",
            text: "Location",
            callback: () => Toast.show({ type: "info", text1: "Coming soon!" }),
          },

          {
            icon: "format_list_bulleted",
            text: "Bullets",
            callback: () => editorRef.current.toggleBulletList(),
          },
          {
            icon: "code",
            text: "Code block",
            callback: () => editorRef.current.toggleCodeBlock(),
          },
          {
            icon: "horizontal_rule",
            text: "Divider",
            callback: () => editorRef.current.setHorizontalRule(),
          },
        ]}
      />
    </Animated.View>
  );
}

function NoteFormatMenu({ isFocused, editorRef, formatMenuRef }) {
  const theme = useColorTheme();

  const formatMenuStyles = useAnimatedStyle(() => ({
    opacity: isFocused.value,
    pointerEvents: isFocused.value ? "auto" : "none",
    marginTop: withSpring(isFocused.value ? 0 : -40, {
      damping: 30,
      stiffness: 400,
    }),
  }));

  const [selectionState, setSelectionState] = useState({
    bold: false,
    italic: false,
    underline: false,
  });

  useImperativeHandle(formatMenuRef, () => ({
    setSelectionState,
  }));

  return (
    <Animated.View
      style={[
        formatMenuStyles,
        {
          flexDirection: "row",
          height: 40,
          borderBottomWidth: 1,
          paddingHorizontal: 5,
          borderBottomColor: addHslAlpha(theme[5], 0.6),
        },
      ]}
    >
      {[
        {
          id: "bold",
          icon: "format_bold",
          text: "Bold",
          callback: () => editorRef.current.toggleBold(),
        },
        {
          id: "italic",
          icon: "format_italic",
          text: "Italic",
          callback: () => editorRef.current.toggleItalic(),
        },
        {
          id: "underline",
          icon: "format_underlined",
          text: "Underline",
          callback: () => editorRef.current.toggleUnderline(),
        },
      ].map(({ id, icon, text, callback }) => (
        <IconButton
          key={text}
          icon={icon}
          onPress={() => {
            editorRef.current.focus();
            callback();
          }}
          iconProps={{ bold: selectionState[id] }}
          onPressIn={() => {
            editorRef.current.focus();
          }}
          {...(Platform.OS === "web" && {
            onMouseDown: () => setTimeout(() => editorRef.current.focus(), 0),
          })}
        />
      ))}

      <NoteInsertMenu isFocused={isFocused} editorRef={editorRef} />
    </Animated.View>
  );
}

function AISimplification({ id, updateTask }) {
  const theme = useColorTheme();
  const { session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleSimplify = async () => {
    try {
      setLoading(true);
      const res = await sendApiRequest(
        session,
        "POST",
        "ai/rewrite",
        {},
        {
          body: JSON.stringify({ id }),
        }
      );

      updateTask({ note: res.note, hasSimplifiedNote: true });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        padding: 10,
        paddingHorizontal: 20,
        backgroundColor: addHslAlpha(theme[9], 0.05),
        borderRadius: 50,
        marginTop: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: theme[11],
          opacity: 0.8,
        }}
        weight={700}
      >
        A simplified version of this task's note is available.
      </Text>
      <Button
        variant="filled"
        backgroundColors={{
          default: addHslAlpha(theme[9], 0.1),
          hovered: addHslAlpha(theme[9], 0.2),
          pressed: addHslAlpha(theme[9], 0.3),
        }}
        text="View"
        icon="east"
        iconStyle={{ lineHeight: 25, marginLeft: 5 }}
        iconPosition="end"
        dense
        containerStyle={{ marginLeft: "auto" }}
        onPress={handleSimplify}
        isLoading={loading}
      />
    </View>
  );
}

export const TaskNote = forwardRef(
  (
    {
      task,
      updateTask,
      showEditorWhenEmpty,
      onContainerFocus,
    }: {
      task: any;
      updateTask: any;
      showEditorWhenEmpty?: any;
      onContainerFocus?: any;
    },
    editorRef: any
  ) => {
    const theme = useColorTheme();
    const { session } = useUser();
    const formatMenuRef = useRef(null);
    const [hasClicked, setHasClicked] = useState(showEditorWhenEmpty || false);
    const shouldShow = Boolean(getPreviewText(task.note)) || hasClicked;

    const isFocused = useSharedValue(0);

    const focusedStyles = useAnimatedStyle(() => ({
      borderRadius: 10,
      position: "relative",
      backgroundColor: interpolateColor(
        isFocused.value,
        [0, 1],
        [
          theme[5].replace(")", `, ${0})`).replace("hsl", "hsla"),
          theme[5].replace(")", `, ${0.3})`).replace("hsl", "hsla"),
        ]
      ),
    }));
    const { isReadOnly } = useTaskDrawerContext() || {};

    return !shouldShow ? (
      !isReadOnly && (
        <Button
          dense
          onPress={() => setHasClicked(true)}
          containerStyle={{
            marginRight: "auto",
            opacity: 0.6,
            marginLeft: 5,
          }}
          style={{ gap: 10 }}
        >
          <Icon size={20} style={{ marginTop: -3 }}>
            sticky_note_2
          </Icon>
          <Text style={{ color: theme[11] }}>Add note</Text>
        </Button>
      )
    ) : (
      <Animated.View style={focusedStyles}>
        <NoteFormatMenu
          formatMenuRef={formatMenuRef}
          isFocused={isFocused}
          editorRef={editorRef}
        />
        {countWords(task.note) > 100 &&
          !task.hasSimplifiedNote &&
          session.user.betaTester && (
            <AISimplification id={task.id} updateTask={updateTask} />
          )}
        <TaskNoteEditor
          onContainerFocus={onContainerFocus}
          showEditorWhenEmpty={showEditorWhenEmpty}
          ref={editorRef}
          setSelectionState={(state) =>
            formatMenuRef.current.setSelectionState(state)
          }
          updateTask={updateTask as any}
          theme={theme}
          dom={{ matchContents: true, scrollEnabled: false }}
          setFocused={(t) => (isFocused.value = withSpring(t ? 1 : 0))}
          content={task.note?.replaceAll("] (http", "](http")?.trim()}
        />
      </Animated.View>
    );
  }
);

