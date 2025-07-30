import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Modal from "@/ui/Modal";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { BlurView } from "expo-blur";
import { Image, ImageBackground } from "expo-image";
import { cloneElement, ReactElement, useRef, useState } from "react";
import { Platform, StyleProp, View, ViewStyle } from "react-native";
import Accordion from "react-native-collapsible/Accordion";
import Toast from "react-native-toast-message";
import useSWR from "swr";

function AiIntegration({ data, section, mutate }) {
  const apiKeyRef = useRef(null);
  const theme = useColorTheme();
  const { sessionToken } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await sendApiRequest(sessionToken, "POST", "ai", {
        type: section.id,
        token: apiKeyRef?.current.value,
      });
      await mutate();
      Toast.show({ type: "success", text1: "Saved!" });
    } catch {
      apiKeyRef.current.focus();
      Toast.show({ type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={{
        backgroundColor: theme[3],
        padding: 20,
        borderRadius: 10,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        borderTopWidth: 2,
        gap: 10,
        borderTopColor: theme[4],
        flexDirection: "row",
      }}
    >
      {section.id !== "DYSPERSE_AI" && section.id !== "NONE" && (
        <TextField
          editable={!isLoading}
          onSubmitEditing={handleSubmit}
          variant="filled+outlined"
          placeholder="API key"
          style={{ flex: 1, fontFamily: "mono" }}
          defaultValue={data?.type === section.id ? data?.token : ""}
          inputRef={apiKeyRef}
        />
      )}
      <Button
        onPress={handleSubmit}
        isLoading={isLoading}
        variant="filled"
        iconPosition="end"
        backgroundColors={{
          default: theme[5],
          hovered: theme[6],
          pressed: theme[7],
        }}
        text="Continue"
        icon="east"
        style={{ width: 130 }}
      />
    </View>
  );
}

function SidekickComingSoon({ style }: { style?: StyleProp<ViewStyle> }) {
  const theme = useColorTheme();
  return (
    <ImageBackground
      style={[style]}
      source={{
        uri: "https://images.unsplash.com/photo-1753128024209-81564c3c2976?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw3fHx8ZW58MHx8fHx8",
      }}
    >
      <BlurView
        style={{
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          padding: 20,
          flex: 1,
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Icon size={80} style={{ color: "#fff" }}>
          raven
        </Icon>
        <Text
          weight={300}
          style={{
            fontFamily: "serifText800",
            color: "#fff",
            fontSize: 70,
          }}
        >
          sidekick
        </Text>
        <Text
          weight={900}
          style={{
            opacity: 0.6,
            fontSize: 30,
            marginTop: -10,
            color: "#fff",
          }}
        >
          arriving 2026
        </Text>
      </BlurView>
    </ImageBackground>
  );
}

export function SidekickComingSoonModal({
  disabled,
  children,
}: {
  disabled?: boolean;
  children: ReactElement;
}) {
  const sheetRef = useRef(null);
  const t = cloneElement(children, {
    onPress: () => sheetRef.current?.present(),
  });
  if (disabled) return children;
  else {
    return (
      <>
        {t}
        <Modal animation="SLIDE" sheetRef={sheetRef} height={600}>
          <IconButton
            style={{ position: "absolute", zIndex: 999, top: 20, right: 20 }}
            icon="close"
            backgroundColors={{
              default: "transparent",
              hovered: "transparent",
              pressed: "transparent",
            }}
            onPress={() => sheetRef.current?.dismiss()}
            iconStyle={{ color: "#fff" }}
            iconProps={{ bold: true }}
          />
          <SidekickComingSoon style={{ borderRadius: 0, height: 600 }} />
        </Modal>
      </>
    );
  }
}

export default function Page() {
  const { session } = useUser();
  const [activeSections, setActiveSections] = useState([]);

  const { data, mutate, error } = useSWR(["ai"]);

  if (!session?.user?.betaTester)
    return <SidekickComingSoon style={{ flex: 1 }} />;

  const sections = [
    {
      id: "NONE",
      header: {
        icon: "https://em-content.zobj.net/source/apple/391/flexed-biceps_1f4aa.png",
        primary: "None",
        secondary: "Prefer the human touch? So do we.",
      },
    },
    {
      id: "DYSPERSE_AI",
      header: {
        icon: "https://cdn.brandfetch.io/idHe2DCaTM/w/800/h/800/theme/dark/symbol.png?c=1dxbfHSJFAPEGdCLU4o5B",
        primary: "Sidekick Free",
        secondary: "Free, but uptime won't be guaranteed.",
      },
    },
    {
      id: "GEMINI",
      header: {
        icon: "https://assets.dysperse.com/google.svg?t",
        primary: "Gemini 1.5",
        secondary: "by Google",
      },
    },
    {
      id: "OPENAI",
      header: {
        icon: "https://cdn.brandfetch.io/idR3duQxYl/theme/dark/symbol.svg?c=1dxbfHSJFAPEGdCLU4o5B",
        primary: "GPT 3.5",
        secondary: "by OpenAI",
      },
    },
    // {
    //   id: "ANTHROPIC",
    //   header: {
    //     icon: "https://cdn.brandfetch.io/idmJWF3N06/w/400/h/400/theme/dark/icon.jpeg?c=1bfwsmEH20zzEfSNTed",
    //     primary: "Claude",
    //     secondary: "by Anthropic",
    //   },
    // },
  ];

  return (
    <SettingsScrollView contentContainerStyle={{ gap: 20 }}>
      <Text style={settingStyles.title}>Sidekick</Text>
      <Text style={{ fontSize: 20, opacity: 0.6 }}>
        Laziness is the key to productivity
      </Text>

      {error && <ErrorAlert />}
      <Text style={settingStyles.heading}>How does it work?</Text>
      <Text style={{ marginBottom: 20 }}>
        Bring your own AI provider for no extra surcharge, or use our free AI
        service.
      </Text>
      <Text style={settingStyles.heading}>AI Provider</Text>
      <Accordion
        activeSections={activeSections}
        align="bottom"
        sections={sections}
        sectionContainerStyle={{ backgroundColor: "transparent" }}
        containerStyle={{ gap: 10, marginVertical: 5 }}
        renderHeader={(section) => (
          <ListItemButton
            variant="filled"
            style={{
              borderBottomLeftRadius: activeSections.includes(
                sections.indexOf(section)
              )
                ? 0
                : 20,
              borderBottomRightRadius: activeSections.includes(
                sections.indexOf(section)
              )
                ? 0
                : 20,
              ...(Platform.OS === "web" && {
                transitionProperty: "border-radius",
                transitionDuration: activeSections.includes(
                  sections.indexOf(section)
                )
                  ? 0
                  : "0.2s",
                transitionDelay: activeSections.includes(
                  sections.indexOf(section)
                )
                  ? 0
                  : ".1s",
              }),
            }}
            onPress={() => setActiveSections([sections.indexOf(section)])}
          >
            <Image
              source={{ uri: section.header.icon }}
              style={{ width: 30, height: 30 }}
            />
            <ListItemText
              primary={section.header.primary}
              secondary={section.header.secondary}
            />
            {data?.type === section.id && (
              <Icon filled size={30}>
                check_circle
              </Icon>
            )}
          </ListItemButton>
        )}
        renderContent={(t) => (
          <AiIntegration
            data={data}
            mutate={mutate}
            sections={sections}
            section={t}
          />
        )}
        onChange={setActiveSections}
      />

      <Text style={settingStyles.heading}>About you</Text>
      <Text>
        Our robots crave for this information. We'll use it to make your
        experience better.
      </Text>

      <ListItemButton variant="filled" style={{ marginTop: 10 }}>
        <ListItemText primary="I am a student" />
        <Icon>square</Icon>
      </ListItemButton>
    </SettingsScrollView>
  );
}

