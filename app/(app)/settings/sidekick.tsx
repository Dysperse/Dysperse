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
      style={[
        {
          padding: 20,
          borderRadius: 50,
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: theme[3],
        },
        style,
      ]}
      source={{
        uri: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' version='1.1' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:svgjs='http://svgjs.dev/svgjs' viewBox='0 0 700 700' width='700' height='700'%3E%3Cdefs%3E%3ClinearGradient gradientTransform='rotate(-150, 0.5, 0.5)' x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='gggrain-gradient2'%3E%3Cstop stop-color='hsl(194, 83%25, 49%25)' stop-opacity='1' offset='-0%25'%3E%3C/stop%3E%3Cstop stop-color='rgba(255,255,255,0)' stop-opacity='0' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3ClinearGradient gradientTransform='rotate(150, 0.5, 0.5)' x1='50%25' y1='0%25' x2='50%25' y2='100%25' id='gggrain-gradient3'%3E%3Cstop stop-color='hsl(0, 100%25, 60%25)' stop-opacity='1'%3E%3C/stop%3E%3Cstop stop-color='rgba(255,255,255,0)' stop-opacity='0' offset='100%25'%3E%3C/stop%3E%3C/linearGradient%3E%3Cfilter id='gggrain-filter' x='-20%25' y='-20%25' width='140%25' height='140%25' filterUnits='objectBoundingBox' primitiveUnits='userSpaceOnUse' color-interpolation-filters='sRGB'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='2' seed='2' stitchTiles='stitch' x='0%25' y='0%25' width='100%25' height='100%25' result='turbulence'%3E%3C/feTurbulence%3E%3CfeColorMatrix type='saturate' values='0' x='0%25' y='0%25' width='100%25' height='100%25' in='turbulence' result='colormatrix'%3E%3C/feColorMatrix%3E%3CfeComponentTransfer x='0%25' y='0%25' width='100%25' height='100%25' in='colormatrix' result='componentTransfer'%3E%3CfeFuncR type='linear' slope='3'%3E%3C/feFuncR%3E%3CfeFuncG type='linear' slope='3'%3E%3C/feFuncG%3E%3CfeFuncB type='linear' slope='3'%3E%3C/feFuncB%3E%3C/feComponentTransfer%3E%3CfeColorMatrix x='0%25' y='0%25' width='100%25' height='100%25' in='componentTransfer' result='colormatrix2' type='matrix' values='1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 19 -11'%3E%3C/feColorMatrix%3E%3C/filter%3E%3C/defs%3E%3Cg%3E%3Crect width='100%25' height='100%25' fill='hsl(22, 100%25, 60%25)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='url(%23gggrain-gradient3)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='url(%23gggrain-gradient2)'%3E%3C/rect%3E%3Crect width='100%25' height='100%25' fill='transparent' filter='url(%23gggrain-filter)' opacity='1' style='mix-blend-mode: soft-light'%3E%3C/rect%3E%3C/g%3E%3C/svg%3E",
      }}
    >
      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
        }}
      >
        <Icon size={80} style={{ color: theme[12] }}>
          raven
        </Icon>
        <Text
          weight={300}
          style={{
            fontFamily: "serifText800",
            color: theme[12],
            fontSize: 70,
          }}
        >
          sidekick
        </Text>
      </View>
      <Text
        weight={900}
        style={{ opacity: 0.6, fontSize: 30, marginTop: 5, color: theme[12] }}
      >
        arriving 2026
      </Text>
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
            iconStyle={{ color: "#000" }}
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
    return (
      <SidekickComingSoon style={{ marginVertical: 50, marginBottom: 20 }} />
    );

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

