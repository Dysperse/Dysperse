import { ContentWrapper } from "@/components/layout/content";
import { ProfilePicture } from "@/ui/Avatar";
import Chip from "@/ui/Chip";
import Divider from "@/ui/Divider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColor } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { cloneElement } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ActivityIndicator, View, useColorScheme } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useSWR from "swr";

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
  const divider = (
    <View style={{ paddingHorizontal: 20 }}>
      <Divider />
    </View>
  );

  return (
    <ScrollView>
      <LinearGradient
        colors={[theme[5], theme[4], theme[6]]}
        style={{
          borderBottomLeftRadius: 25,
          borderBottomRightRadius: 25,
          padding: 25,
          paddingTop: 25 + insets.top,
        }}
      >
        <View style={{ flexDirection: "row", gap: 3 }}>
          <IconButton style={{ marginLeft: "auto" }}>
            <Icon size={26}>edit</Icon>
          </IconButton>
          <IconButton>
            <Icon size={26}>schedule</Icon>
          </IconButton>
          <IconButton>
            <Icon size={26}>pending</Icon>
          </IconButton>
        </View>
        <Text heading style={{ fontSize: 45, marginTop: 30 }}>
          {space.name}
        </Text>
        <View style={{ flexDirection: "row" }}>
          <Chip
            icon={<Icon>visibility</Icon>}
            label="View only"
            style={{ backgroundColor: theme[7], marginTop: 5 }}
          />
        </View>
      </LinearGradient>
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
    </ScrollView>
  );
}

export default function Page() {
  const params = useLocalSearchParams();
  const { data, error } = useSWR(
    params.id ? ["space", { spaceId: params.id }] : null
  );

  return (
    <>
      {data ? (
        <SpacePage space={data} />
      ) : error ? (
        <ErrorAlert />
      ) : (
        <ActivityIndicator />
      )}
    </>
  );
}
