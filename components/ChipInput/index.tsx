import { addHslAlpha, useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { Portal } from "@gorhom/portal";
import { BlurView } from "expo-blur";
import React, { FC, useEffect, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { Dimensions, Keyboard, Platform, Pressable, View } from "react-native";
import {
  MentionInput,
  MentionSuggestionsProps,
} from "react-native-controlled-mentions";
import { ScrollView } from "react-native-gesture-handler";

const RenderSuggestions: FC<MentionSuggestionsProps & { suggestions: any }> = ({
  keyword,
  suggestions,
  onSuggestionPress,
}) => {
  const theme = useColorTheme();
  const isDark = useDarkMode();
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

  const keyboardHeight = isKeyboardVisible
    ? Keyboard.metrics?.()?.height ?? 0
    : 0;

  return (
    <Portal>
      <BlurView
        intensity={Platform.OS === "android" ? 0 : 50}
        tint={isDark ? "dark" : "light"}
        style={{
          width: Dimensions.get("window").width - 10,
          overflow: "hidden",
          position: "absolute",
          zIndex: 999,
          bottom: keyboardHeight,
          backgroundColor: addHslAlpha(
            theme[11],
            Platform.OS === "android" ? 1 : 0.1
          ),
          height: 50,
          margin: 5,
          borderRadius: 10,
        }}
      >
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          style={{
            borderRadius: 10,
            height: 50,
            paddingHorizontal: 10,
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
                  display: "inline-flex",
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
      </BlurView>
    </Portal>
  );
};

export default function ChipInput({
  onSubmitEditing,
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
  onSubmitEditing;
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

  const paddingStyles = {
    paddingLeft: padding.left || 5,
    paddingRight: padding.right || 5,
    paddingTop: padding.top || 5,
    paddingBottom: padding.bottom || 5,
  };

  return Platform.OS === "web" ? (
    <MentionsInput
      inputRef={inputRef}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
      {...inputProps}
      style={{
        control: {
          fontSize: 35,
          flex: 1,
        },
        "&multiLine": {
          control: {
            fontFamily: "serifText800",
            minHeight: 100,
          },
          highlighter: { ...paddingStyles, border: "1px solid transparent" },
          input: {
            ...paddingStyles,
            border: "none",
            boxShadow: "none",
            height,
            flex: 1,
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
        <View
          style={{
            borderRadius: 25,
            overflow: "hidden",
            maxHeight: 155,
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
        </View>
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
          renderSuggestion={({ display, icon }: any) => (
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
        fontSize: 35,
        fontFamily: "serifText700",
        height: "100%",
        color: theme[11],
        verticalAlign: "top",
        ...paddingStyles,
      }}
      placeholder={placeholder}
      {...inputProps}
      multiline
      {...(onSubmitEditing && { onSubmitEditing })}
      inputRef={inputRef}
      placeholderTextColor={addHslAlpha(theme[11], 0.2)}
      cursorColor={theme[8]}
      selectionColor={theme[8]}
      blurOnSubmit
      partTypes={[
        ...suggestions.map((item) => ({
          trigger: item.key,
          renderSuggestions: (props) => (
            <RenderSuggestions {...props} suggestions={item.suggestions} />
          ),
          isInsertSpaceAfterMention: true,
          textStyle: {
            fontFamily: "serifText700",
            color: theme[11],
            backgroundColor: theme[6],
            overflow: "hidden",
          },
        })),
      ]}
    />
  );
}

