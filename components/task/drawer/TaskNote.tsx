import { useSession } from "@/context/AuthProvider";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import Divider from "@/ui/Divider";
import DropdownMenu, { DropdownMenuItem } from "@/ui/DropdownMenu";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Modal from "@/ui/Modal";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { showErrorToast } from "@/utils/errorToast";
import React, {
  cloneElement,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Linking, Platform, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { toast } from "sonner-native";
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
      toast.error("Invalid URL");
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
    flexDirection: "row",
    position: "absolute",
  }));

  return (
    <Animated.View style={insertMenuStyles}>
      <DropdownMenu
        horizontalPlacement="right"
        // onclose: editorRef.current.focus()
        options={[
          {
            renderer: () => (
              <View style={{ flexDirection: "row" }}>
                <DropdownMenuItem
                  onPress={() => editorRef.current.insertHeading(1)}
                  containerStyle={{ flex: 1, minWidth: 0 }}
                >
                  <Icon>format_h1</Icon>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => editorRef.current.insertHeading(2)}
                  containerStyle={{ flex: 1, minWidth: 0 }}
                >
                  <Icon>format_h2</Icon>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onPress={() => editorRef.current.insertHeading(3)}
                  containerStyle={{ flex: 1, minWidth: 0 }}
                >
                  <Icon>format_h3</Icon>
                </DropdownMenuItem>
              </View>
            ),
          },
          {
            renderer: () => (
              <LinkModal
                onSubmit={(link) => editorRef.current.insertLink(link)}
              >
                <DropdownMenuItem text="Link" icon="link" />
              </LinkModal>
            ),
          },

          {
            icon: "format_list_bulleted",
            text: "Bullets",
            onPress: () => editorRef.current.toggleBulletList(),
          },
          {
            icon: "code",
            text: "Code block",
            onPress: () => editorRef.current.toggleCodeBlock(),
          },
          {
            icon: "horizontal_rule",
            text: "Divider",
            onPress: () => editorRef.current.setHorizontalRule(),
          },
        ]}
      >
        <Button
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
      </DropdownMenu>
      <Button
        backgroundColors={{
          default: addHslAlpha(theme[5], 0.7),
          hovered: addHslAlpha(theme[5], 0.8),
          pressed: addHslAlpha(theme[5], 0.9),
        }}
        iconPosition="end"
        containerStyle={{ marginLeft: 5 }}
        icon="check"
        variant="filled"
        dense
        onPress={() => editorRef.current.blur()}
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

      updateTask({ note: res, hasSimplifiedNote: true });
    } catch (e) {
      showErrorToast();
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
        marginBottom: 10,
        marginTop: 10,
        gap: 10,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: theme[11],
          opacity: 0.8,
          flex: 1,
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

export const TaskNote = ({
  task,
  updateTask,
  showEditorWhenEmpty,
  onContainerFocus,
  ref: editorRef,
}: {
  task: any;
  updateTask: any;
  showEditorWhenEmpty?: any;
  onContainerFocus?: any;
  ref?: any;
}) => {
  const theme = useColorTheme();
  const { session } = useUser();
  const formatMenuRef = useRef(null);
  const { isReadOnly } = useTaskDrawerContext();
  const isFocused = useSharedValue(0);
  const [collapsed, setCollapsed] = useState(Platform.OS !== "web");

  const focusedStyles = useAnimatedStyle(() => ({
    borderRadius: 10,
    marginLeft: Platform.OS === "web" ? 0 : 35,
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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(Platform.OS !== "web");

  return (
    <>
      {Platform.OS !== "web" && (
        <Button
          dense
          style={{ gap: 10, marginRight: "auto" }}
          containerStyle={{ opacity: 0.6, marginRight: "auto" }}
          onPress={
            isLoading
              ? undefined
              : () => {
                  setCollapsed((c) => !c);
                  if (!task.note) editorRef.current.focus();
                }
          }
          icon={
            isLoading ? (
              <Spinner size={20} style={{ marginRight: 4 }} />
            ) : (
              "stylus_note"
            )
          }
          text={
            task.note ? (collapsed ? "Show note" : "Hide note") : "Add a note"
          }
        />
      )}
      {Platform.OS === "web" && (
        <View style={{ padding: 13, paddingBottom: 10 }}>
          <Divider style={{ height: 1.5, opacity: 0.5, borderRadius: 99 }} />
        </View>
      )}
      <Animated.View
        style={[
          focusedStyles,
          collapsed &&
            Platform.OS !== "web" && {
              maxHeight: 0,
              overflow: "hidden",
            },
          collapsed && Platform.OS === "web" && { display: "none" },
        ]}
        key={task.hasSimplifiedNote ? "simplified" : "normal"}
      >
        {task.note &&
          countWords(task.note) > 100 &&
          !task.hasSimplifiedNote &&
          session.user.betaTester && (
            <AISimplification id={task.id} updateTask={updateTask} />
          )}
        <NoteFormatMenu
          formatMenuRef={formatMenuRef}
          isFocused={isFocused}
          editorRef={editorRef}
        />
        <TaskNoteEditor
          openLink={(href) => Linking.openURL(href)}
          onContainerFocus={onContainerFocus}
          showEditorWhenEmpty={showEditorWhenEmpty}
          isReadOnly={isReadOnly}
          ref={editorRef}
          setSelectionState={(state) =>
            formatMenuRef.current.setSelectionState(state)
          }
          updateTask={updateTask as any}
          theme={theme}
          dom={{
            useWebKit: Platform.OS === "web",
            matchContents: true,
            scrollEnabled: false,
            // keyboardDisplayRequiresUserAction: false,
            hideKeyboardAccessoryView: true,
            // dataDetectorTypes: "none",
            // setBuiltInZoomControls: false,

            // Set isLoaded to true after the webview has loaded
            onLoadEnd: () => setIsLoading(false),

            // prevent navigating to another web page within the webview
            onShouldStartLoadWithRequest: () => {
              if (hasLoaded) {
                return false;
              }
              setHasLoaded(true);
              return true;
            },
          }}
          setFocused={(t) => (isFocused.value = withSpring(t ? 1 : 0))}
          content={task.note?.replaceAll("] (http", "](http")?.trim()}
        />
      </Animated.View>
    </>
  );
};

