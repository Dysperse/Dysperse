import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { InteractionManager, View } from "react-native";
import {
  flip,
  offset,
  RenderProps,
  shift,
  SpotlightTour,
  SpotlightTourProvider,
  SpotlightTourProviderProps,
} from "react-native-spotlight-tour";
import { Button, ButtonText } from "../Button";
import { useColorTheme } from "../color/theme-provider";
import Icon from "../Icon";
import IconButton from "../IconButton";
import Text from "../Text";

const tourKeys = ["collectionNavbar", "sidebarNavigation"];
type TourKey = (typeof tourKeys)[number];

export function TourProvider(
  props: SpotlightTourProviderProps & {
    tourKey: TourKey;
    forceShow?: boolean;
  }
) {
  const { sessionToken, session, mutate } = useUser();
  const theme = useColorTheme();
  const ref = useRef<SpotlightTour>(null);
  const hasViewedTour =
    session?.user?.toursViewed?.includes(props.tourKey) || props.forceShow;

  const localHide = useRef(false);

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      if (
        (props.forceShow && localHide.current !== true) ||
        (session && !hasViewedTour && localHide.current !== true)
      ) {
        ref.current?.start();
      }
    });
    return () => ref.current?.stop();
  }, [ref, session, hasViewedTour, props.forceShow]);

  if (hasViewedTour && !props.forceShow) {
    return props.children as any;
  }

  return (
    <SpotlightTourProvider
      overlayColor={theme[11]}
      nativeDriver
      motion="slide"
      onBackdropPress="stop"
      spotPadding={15}
      overlayOpacity={0.2}
      shape="rectangle"
      ref={ref}
      onStop={() => {
        const t = {
          ...session,
          user: {
            ...session.user,
            toursViewed: [
              ...(session.user?.toursViewed || []),
              props.tourKey,
            ].filter((v, i, a) => a.indexOf(v) === i),
          },
        };
        mutate(() => t, { revalidate: false });
        localHide.current = true;
        sendApiRequest(
          sessionToken,
          "PUT",
          "user/account",
          {},
          {
            body: JSON.stringify({
              toursViewed: [
                ...(session?.user?.toursViewed || []),
                props.tourKey,
              ],
            }),
          }
        );
      }}
      floatingProps={{
        middleware: [offset(5), shift({ padding: 10 }), flip()],
        placement: "bottom",
      }}
      {...props}
    />
  );
}

export function TourPopover({
  children,
  step,
  tips,
}: {
  children?: React.ReactNode;
  step: RenderProps;
  tips?: string[];
}) {
  const theme = useColorTheme();
  return (
    <View
      style={{
        backgroundColor: theme[1],
        borderRadius: 20,
        maxWidth: 300,
        overflow: "hidden",
      }}
    >
      <LinearGradient
        colors={[theme[2], theme[3]]}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          gap: 10,
        }}
      >
        <Icon style={{ opacity: 0.5 }}>
          {step.isFirst ? "waving_hand" : "info"}
        </Icon>
        <Text variant="eyebrow">
          {step.isFirst ? "Hey there!" : `Tip #${step.current + 1}`}
        </Text>
      </LinearGradient>
      <View style={{ padding: 20 }}>
        {children ||
          tips.map((tip, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: i === tips.length - 1 ? 0 : 10,
              }}
            >
              {tips.length !== 1 && (
                <View
                  style={{
                    flexDirection: "row",
                    gap: 20,
                    width: 10,
                    height: 10,
                    backgroundColor: theme[6],
                    borderRadius: 99,
                    marginTop: 7,
                  }}
                />
              )}
              <Text weight={600} style={{ color: theme[11] }}>
                {tip}
              </Text>
            </View>
          ))}
        <View
          style={{
            flexDirection: "row",
            marginTop: 20,
            alignItems: "center",
            gap: 5,
          }}
        >
          <Button
            dense
            containerStyle={{ marginRight: "auto" }}
            onPress={step.stop}
          >
            <ButtonText>Skip</ButtonText>
          </Button>
          <IconButton size={40} icon="west" onPress={step.previous} />
          <IconButton
            variant="filled"
            size={40}
            icon="east"
            onPress={step.next}
          />
        </View>
      </View>
    </View>
  );
}
