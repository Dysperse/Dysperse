import { SettingsLayout } from "@/components/settings/layout";
import { useSession } from "@/context/AuthProvider";
import BottomSheet from "@/ui/BottomSheet";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Logo from "@/ui/logo";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Linking, View } from "react-native";
import useSWR from "swr";

const Intro = ({ integration, setSlide }) => {
  const theme = useColorTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <View
          style={{
            transform: [{ rotate: "-10deg" }],
            width: 100,
            height: 100,
            backgroundColor: theme[1],
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: theme[6],
          }}
        >
          <Logo size={80} />
        </View>
        <Image
          source={{ uri: integration.icon }}
          style={{
            borderRadius: 20,
            width: 100,
            height: 100,
            transform: [{ rotate: "10deg" }],
          }}
        />
      </View>
      <View style={{ paddingHorizontal: 20, alignItems: "center", gap: 5 }}>
        <Text style={{ fontSize: 30 }} weight={700}>
          Dysperse + {integration.name}
        </Text>
        <Text weight={300} style={{ opacity: 0.7 }}>
          {integration.description}
        </Text>
      </View>
    </View>
  );
};

const HelperText = ({ helper, index }) => {
  const theme = useColorTheme();
  return (
    <View key={helper}>
      <View
        style={{
          width: 30,
          height: 30,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderRadius: 99,
          borderColor: theme[6],
        }}
      >
        <Text>{index + 1}</Text>
      </View>
      <Text key={helper} style={{ fontSize: 20, marginTop: 20 }}>
        {helper}
      </Text>
    </View>
  );
};

const ParamSlide = ({ slide }) => {
  const theme = useColorTheme();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{JSON.stringify(slide, null, 2)}</Text>
      {slide.helper.map((helper, index) => (
        <HelperText key={helper} helper={helper} index={index} />
      ))}
    </View>
  );
};

function ParamsModal({ integration, paramsModalRef }) {
  const handleClose = () => paramsModalRef.current?.close();
  const slides = ["intro", ...integration.authorization.params];
  const [slide, setSlide] = useState(0);

  const { control, handleSubmit } = useForm({
    defaultValues: {
      ...Object.fromEntries(
        integration.authorization.params.map((p) => [p, ""])
      ),
    },
  });

  return (
    <BottomSheet
      sheetRef={paramsModalRef}
      snapPoints={["90%"]}
      onClose={handleClose}
    >
      {slide === 0 && <Intro integration={integration} setSlide={setSlide} />}
      {slides.map(
        (s, i) => i !== 0 && slide === i && <ParamSlide key={i} slide={s} />
      )}
      <View
        style={{
          padding: 20,
          marginTop: "auto",
          width: "100%",
        }}
      >
        <Button
          variant="outlined"
          style={{ height: 60 }}
          onPress={() => setSlide(1)}
        >
          <ButtonText style={{ fontSize: 20 }}>Connect</ButtonText>
          <Icon>arrow_forward</Icon>
        </Button>
      </View>
    </BottomSheet>
  );
}

export default function Page() {
  const paramsModalRef = useRef<BottomSheetModal>(null);
  const theme = useColorTheme();
  const { session } = useSession();
  const { name } = useLocalSearchParams();

  const { data } = useSWR(
    name ? ["space/integrations/about", { id: name }] : null
  );

  const { data: integrations } = useSWR(["space/integrations"]);

  const handleBack = () => router.replace("/settings/space/integrations");
  const handleOpen = () => {
    if (isConnected) {
      return;
    }
    if (data.authorization.type === "oauth2")
      Linking.openURL(
        `${process.env.EXPO_PUBLIC_API_URL}/space/integrations/redirect?session=${session}&id=${name}`
      );
    else paramsModalRef.current?.present();
  };

  const isConnected = integrations?.find((i) => i.integration.name === name);

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button variant="outlined" onPress={handleBack}>
          <Icon>arrow_back_ios_new</Icon>
          <ButtonText>Integrations</ButtonText>
        </Button>
      </View>
      {data ? (
        <>
          {data.authorization.type === "params" && (
            <ParamsModal integration={data} paramsModalRef={paramsModalRef} />
          )}
          <View
            style={{
              alignItems: "center",
              marginTop: 50,
              backgroundColor: addHslAlpha(theme[3], 0.5),
              borderColor: theme[4],
              borderWidth: 2,
              borderRadius: 20,
              padding: 20,
              paddingVertical: 40,
            }}
          >
            <Image
              source={{ uri: data.icon }}
              style={{
                borderRadius: 10,
                width: 80,
                height: 80,
              }}
            />
            <Text weight={900} style={{ fontSize: 30, marginTop: 15 }}>
              {data.name}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              {data.description}
            </Text>
            <Button
              large
              variant={isConnected ? "outlined" : "filled"}
              icon={isConnected ? "check" : "add"}
              iconSize={30}
              text={isConnected ? "Connected" : "Connect"}
              onPress={handleOpen}
            />
          </View>
          <View
            style={{
              marginTop: 20,
              justifyContent: "space-between",
              backgroundColor: addHslAlpha(theme[3], 0.5),
              borderColor: theme[4],
              borderWidth: 2,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text weight={700} style={{ fontSize: 20, paddingBottom: 10 }}>
                About
              </Text>
              <Button
                dense
                iconPosition="end"
                icon="north_east"
                text="Source"
                style={{ marginLeft: "auto" }}
              />
            </View>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 10,
                opacity: 0.6,
                marginTop: 5,
              }}
            >
              {data.about?.text}
            </Text>
          </View>
        </>
      ) : (
        <View
          style={{
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </View>
      )}
    </SettingsLayout>
  );
}
