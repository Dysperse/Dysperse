import { ContentWrapper } from "@/components/layout/content";
import { useUser } from "@/context/useUser";
import Text from "@/ui/Text";
import useSWR from "swr";
import { ProfilePicture } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import Divider from "@/ui/Divider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { cloneElement } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useColorScheme,
  useWindowDimensions,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { useSession } from "@/context/AuthProvider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import Spinner from "@/ui/Spinner";

const spaceStyles = StyleSheet.create({
  button: {
    padding: 20,
    paddingRight: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonContent: {
    flexGrow: 1,
  },
});

function ProgressBar({
  progress,
  height = 5,
}: {
  progress: number;
  height?: number;
}) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        height,
        backgroundColor: theme[3],
        borderRadius: 99,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height,
          width: `${progress * 100}%`,
          backgroundColor: theme[9],
        }}
      />
    </View>
  );
}

function MembersTrigger({ space }: any) {
  const theme = useColor(space.color, useColorScheme() === "dark");

  return (
    <TouchableOpacity>
      <View style={spaceStyles.button}>
        <View style={spaceStyles.buttonContent}>
          <Text variant="eyebrow">Members</Text>
          <View style={{ flexDirection: "row", marginLeft: 10 }}>
            {[...new Array(4)].map((_, i) => (
              <ProfilePicture
                name="Manu"
                image=""
                size={45}
                key={i}
                style={{
                  marginLeft: -10,
                  borderWidth: 3,
                  borderColor: theme[1],
                }}
              />
            ))}
          </View>
        </View>
        <Icon>arrow_forward_ios</Icon>
      </View>
    </TouchableOpacity>
  );
}

function StorageTrigger({ children }) {
  const trigger = cloneElement(children, {});
  return <>{trigger}</>;
}

function SpacePage({ space }: any) {
  const theme = useColor(space.color, useColorScheme() === "dark");
  const insets = useSafeAreaInsets();
  const { session } = useUser();
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();

  const divider = (
    <View style={{ paddingHorizontal: 20 }}>
      <Divider />
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ height }}>
      {Platform.OS === "ios" && (
        <View
          style={{
            backgroundColor: theme[5],
            height,
            position: "absolute",
            top: -height,
            left: 0,
            right: 0,
          }}
        />
      )}
      <LinearGradient
        colors={[theme[4], theme[2], theme[3]]}
        start={[0, 0]}
        end={[1, 1]}
        style={{
          borderRadius: 10,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row", gap: 10 }}>
          <IconButton
            onPress={() => router.back()}
            size={55}
            style={{ borderWidth: 1, borderColor: theme[6] }}
          >
            <Icon size={26}>close</Icon>
          </IconButton>
          <View style={{ flexGrow: 1 }} />
          <IconButton
            size={55}
            style={{ borderWidth: 1, borderColor: theme[6] }}
          >
            <Icon size={26}>edit</Icon>
          </IconButton>
          <IconButton
            size={55}
            style={{ borderWidth: 1, borderColor: theme[6] }}
          >
            <Icon size={26}>history</Icon>
          </IconButton>
          <IconButton
            size={55}
            style={{ borderWidth: 1, borderColor: theme[6] }}
          >
            <Icon size={26}>more_horiz</Icon>
          </IconButton>
        </View>
        <Text
          heading
          style={{
            fontSize: 50,
            marginVertical: 50,
            marginTop: 60,
            textAlign: "center",
          }}
        >
          {space.name}
        </Text>
      </LinearGradient>
      <View style={{ backgroundColor: theme[1], flex: 1 }}>
        <MembersTrigger space={space} />
        {divider}
        <StorageTrigger>
          <TouchableOpacity style={spaceStyles.button}>
            <View style={spaceStyles.buttonContent}>
              <Text variant="eyebrow" style={{ marginBottom: 10 }}>
                Storage
              </Text>
              <ProgressBar progress={0.4} height={10} />
              <Text style={{ opacity: 0.6, marginTop: 4 }}>40% used</Text>
            </View>
            <Icon>arrow_forward_ios</Icon>
          </TouchableOpacity>
        </StorageTrigger>
        {divider}
        <TouchableOpacity style={spaceStyles.button}>
          <View style={spaceStyles.buttonContent}>
            <Text variant="eyebrow">Integrations</Text>
            <Text style={{ opacity: 0.6 }}>Coming soon!</Text>
          </View>
          <Icon>arrow_forward_ios</Icon>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function Page() {
  const { session } = useUser();
  const { data, error } = useSWR(
    session?.space ? ["space", { spaceId: session?.space?.space?.id }] : null
  );
  return (
    <View>
      {data ? (
        <SpacePage space={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Spinner />
        </View>
      )}
    </View>
  );
}
