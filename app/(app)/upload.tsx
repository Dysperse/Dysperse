import ContentWrapper from "@/components/layout/content";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import SkeletonContainer from "@/ui/Skeleton/container";
import { LinearSkeletonArray } from "@/ui/Skeleton/linear";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
// import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import useSWR from "swr";
import { MenuButton } from "./home";

const PasteInput = ({ input, setInput, handleContinue }) => {
  return (
    <>
      <TextField
        variant="filled+outlined"
        multiline
        value={input}
        onChangeText={setInput}
        style={{
          flex: 1,
          fontFamily: "mono",
          paddingHorizontal: 20,
          paddingVertical: 20,
        }}
        placeholder="Paste anything here..."
      />
      <Button
        large
        bold
        disabled={!input.trim()}
        text="Continue"
        iconPosition="end"
        onPress={handleContinue}
        icon="east"
        variant="filled"
        containerStyle={{ marginTop: 10, opacity: input.trim() ? 1 : 0.5 }}
      />
    </>
  );
};

const AITasks = ({ input, setSlide }) => {
  const theme = useColorTheme();
  const { data, error } = useSWR([
    "ai/import-tasks",
    {},
    process.env.EXPO_PUBLIC_API_URL,
    {
      method: "POST",
      body: JSON.stringify({ text: input }),
    },
  ]);
  return (
    <View style={{ flex: 1 }}>
      {data ? (
        <>
          <LinearGradient
            colors={[theme[1], "transparent"]}
            style={{
              height: 60,
              marginBottom: -60,
              zIndex: 1,
              marginTop: -20,
              pointerEvents: "none",
            }}
          />
          <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
            {Array.isArray(data) &&
              data.map((task, i) => (
                <ListItemButton key={i}>
                  <Icon>circle</Icon>
                  <ListItemText
                    primary={task.name}
                    secondary={task.description}
                  />
                </ListItemButton>
              ))}
            {/* {JSON.stringify(data)} */}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
            }}
          >
            <IconButton
              icon="west"
              size={50}
              onPress={() => setSlide(0)}
              variant="outlined"
            />
            <Button
              text="Add tasks"
              icon="add"
              iconPosition="start"
              variant="filled"
              large
              bold
              containerStyle={{ flex: 1 }}
            />
          </View>
        </>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <SkeletonContainer>
          <LinearSkeletonArray
            animateWidth
            widths={[79, 84, 46, 65, 23, 58, 60]}
            height={50}
          />
        </SkeletonContainer>
      )}
    </View>
  );
};

export default function Page() {
  const breakpoints = useResponsiveBreakpoints();
  const insets = useSafeAreaInsets();

  const [input, setInput] = useState("");
  const [slide, setSlide] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ContentWrapper noPaddingTop>
        {!breakpoints.md && <MenuButton />}
        <KeyboardAvoidingView
          behavior="height"
          style={{
            flex: 1,
            maxWidth: 500,
            marginHorizontal: "auto",
            width: "100%",
            padding: 20,
            paddingBottom: insets.bottom + 20,
            paddingTop: breakpoints.md ? 0 : 40,
          }}
        >
          <View
            style={{
              paddingVertical: 35,
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            <Avatar icon="upload" size={60} iconProps={{ size: 40 }} />
            <Text
              style={{
                marginTop: 8,
                fontFamily: "serifText800",
                fontSize: 30,
              }}
            >
              Import tasks
            </Text>
            <Text style={{ opacity: 0.6 }}>
              Paste any text here and we'll to convert it into tasks!
            </Text>
          </View>

          {slide === 0 ? (
            <PasteInput
              handleContinue={() => setSlide(1)}
              input={input}
              setInput={setInput}
            />
          ) : (
            <AITasks input={input} setSlide={setSlide} />
          )}
        </KeyboardAvoidingView>
      </ContentWrapper>
    </SafeAreaView>
  );
}
