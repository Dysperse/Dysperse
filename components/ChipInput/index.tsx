import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";
import { useBottomSheetInternal } from "@gorhom/bottom-sheet";
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
    <ScrollView
      keyboardShouldPersistTaps="always"
      style={{
        position: "absolute",
        zIndex: 999,
        top: 50,
        backgroundColor: "white",
        shadowColor: "black",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.1)",
        borderRadius: 10,
        maxHeight: isKeyboardVisible ? 300 : 400,
      }}
    >
      {suggestions
        .filter((one) =>
          one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
        )
        .map((one) => (
          <Pressable
            android_ripple={{ color: "rgba(0,0,0,0.1)" }}
            key={one.id}
            onPress={() => onSuggestionPress(one)}
            style={{ padding: 12 }}
          >
            <Text>{one.name}</Text>
          </Pressable>
        ))}
    </ScrollView>
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
          highlighter: {
            ...paddingStyles,

            border: "1px solid transparent",
          },
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
          list: {
            backgroundColor: "white",
            fontSize: 20,
            overflow: "hidden",
            borderRadius: 15,
            boxShadow: "5px 5px 20px rgba(0,0,0,0.15)",
          },
          item: {
            padding: "5px 20px",
            "&focused": {
              backgroundColor: "#cee4e5",
            },
          },
        },
      }}
    >
      <Mention
        trigger="@"
        data={suggestions.map((d) => ({
          id: d.id,
          display: d.name,
        }))}
        className="animate-chip"
        style={{
          backgroundColor: theme[6],
          padding: 2,
          borderRadius: 10,
          marginLeft: -2,
        }}
        renderSuggestion={({ id, display }, { query }) => (
          <View>
            <Text>{display}</Text>
          </View>
        )}
      />
    </MentionsInput>
  ) : (
    // cursed code LMAO 💀💀💀
    <MentionInput
      value={value.replaceAll("@", "‎")}
      onChange={(d) => setValue(d.replaceAll("‎", "@"))}
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
      // onBlur={handleOnBlur}
      partTypes={[
        {
          trigger: "‎",
          pattern: /@\[([^\]]*)\]\((\d*)\)/,
          renderSuggestions: (props) =>
            renderSuggestions({ ...props, suggestions }),
          isInsertSpaceAfterMention: true,
          textStyle: {
            fontFamily: "body_900",
            color: theme[11],
            backgroundColor: theme[6],
            borderRadius: 10,
            overflow: "hidden",
          },
        },
      ]}
    />
  );
}
