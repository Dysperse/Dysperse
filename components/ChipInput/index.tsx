import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import { FC, useCallback, useEffect, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { Keyboard, Platform, Pressable, View } from "react-native";
import {
  MentionInput,
  MentionSuggestionsProps,
} from "react-native-controlled-mentions";
import { ScrollView } from "react-native-gesture-handler";

const renderSuggestions: FC<MentionSuggestionsProps & { suggestions: any }> = ({
  keyword,
  suggestions,
  onSuggestionPress,
}) => {
  const theme = useColorTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  if (keyword == null) {
    return null;
  }

  return (
    <View
      style={{
        width: 250,
        borderRadius: 25,
        overflow: "hidden",
        position: "absolute",
        zIndex: 999,
        top: 50,
        backgroundColor: theme[5],
      }}
    >
      <ScrollView
        keyboardShouldPersistTaps="always"
        style={{
          borderRadius: 10,
          maxHeight: isKeyboardVisible ? 200 : 300,
        }}
      >
        {suggestions
          .filter((one) =>
            one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
          )
          .map((one) => (
            <Pressable
              android_ripple={{ color: addHslAlpha(theme[9], 0.5) }}
              key={one.id}
              onPress={() => onSuggestionPress(one)}
              style={{
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
              }}
            >
              {one.icon && one.icon}
              <Text variant="menuItem">{one.name}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
};

export default function ChipInput({
  inputRef,
  suggestions,
  value,
  setValue,
  height = undefined,
  inputStyles,
  padding = { top: 2, right: 2, bottom: 2, left: 2 },
  placeholder = "",
  inputProps,
}: {
  inputRef: any;
  suggestions: any;
  value: string;
  setValue: (value: string) => void;
  height?: number;
  inputStyles?: any;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
  placeholder?: string;
  inputProps?: any;
}) {
  const theme = useColorTheme();
  const isDark = useDarkMode();
  const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

  const paddingStyles = {
    paddingLeft: padding.left || 5,
    paddingRight: padding.right || 5,
    paddingTop: padding.top || 5,
    paddingBottom: padding.bottom || 5,
  };

  useEffect(() => {
    return () => {
      // Reset the flag on unmount
      shouldHandleKeyboardEvents.value = false;
    };
  }, [shouldHandleKeyboardEvents]);
  //#endregion

  //#region callbacks
  const handleOnFocus = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = true;
    },
    [shouldHandleKeyboardEvents]
  );
  const handleOnBlur = useCallback(
    (args) => {
      shouldHandleKeyboardEvents.value = false;
    },
    [shouldHandleKeyboardEvents]
  );
  //#endregion

  return Platform.OS === "web" ? (
    <MentionsInput
      inputRef={inputRef}
      value={value}
      placeholder={placeholder}
      onChange={(e) => {
        console.log(e.target.value);
        setValue(e.target.value);
      }}
      {...inputProps}
      style={{
        height,
        control: {
          fontSize: 25,
          flex: 1,
        },
        "&multiLine": {
          control: {
            fontFamily: "body_900",
          },
          highlighter: { ...paddingStyles, border: "1px solid transparent" },
          input: {
            ...paddingStyles,
            border: "none",
            boxShadow: "none",
            height,
            ...inputStyles,
            overflow: "auto",
            color: theme[11],
          },
        },

        suggestions: {
          background: addHslAlpha(theme[6], 0.4),
          boxShadow:
            "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
          borderRadius: 25,
          list: {
            fontSize: 20,
            overflow: "hidden",
            borderRadius: 15,
          },
          item: {
            borderRadius: 15,
            "&focused": {
              backgroundColor: addHslAlpha(theme[6], 0.4),
            },
          },
        },
      }}
      customSuggestionsContainer={(children) => (
        <BlurView
          tint={isDark ? "dark" : "prominent"}
          style={{
            borderRadius: 25,
            overflow: "hidden",
            maxHeight: 300,
            width: 200,
            backgroundColor: theme[5],
          }}
        >
          <ScrollView
            contentContainerStyle={{ padding: 5 }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        </BlurView>
      )}
    >
      {suggestions.map((item) => (
        <Mention
          key={item.key}
          trigger={item.key}
          data={item.suggestions.map((d) => ({
            id: d.id,
            display: d.name,
            icon: d.icon,
          }))}
          className="animate-chip"
          style={{
            backgroundColor: theme[6],
            padding: 2,
            borderRadius: 10,
            marginLeft: -2,
          }}
          {...(item.onAdd && { onAdd: item.onAdd })}
          renderSuggestion={({ display, icon }, { query }) => (
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
                paddingHorizontal: 15,
                paddingVertical: 10,
              }}
            >
              {icon}
              <Text numberOfLines={1} variant="menuItem">
                {display}
              </Text>
            </View>
          )}
        />
      ))}
    </MentionsInput>
  ) : (
    // cursed code LMAO 💀💀💀
    <MentionInput
      value={value.replaceAll("/", "‎").replace("‎‎", "")}
      onChange={(d) => setValue(d.replaceAll("‎", "/").replace("‎‎", ""))}
      style={{
        fontSize: 25,
        fontFamily: "body_900",
        height,
        verticalAlign: "top",
        ...paddingStyles,
      }}
      placeholder={placeholder}
      {...inputProps}
      multiline
      onFocus={handleOnFocus}
      inputRef={inputRef}
      placeholderTextColor={theme[6]}
      cursorColor={theme[8]}
      selectionColor={theme[8]}
      partTypes={[
        ...suggestions.map((item) => ({
          trigger: item.key,
          renderSuggestions: (props) =>
            renderSuggestions({ ...props, suggestions: item.suggestions }),
          isInsertSpaceAfterMention: true,
          textStyle: {
            fontFamily: "body_900",
            color: theme[11],
            backgroundColor: theme[6],
            borderRadius: 10,
            overflow: "hidden",
          },
        })),
      ]}
    />
  );
}
