import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { getBatteryLevelAsync, getBatteryStateAsync } from "expo-battery";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useFocusPanelContext } from "../../context";

export default function BatteryWidget({ navigation, widget, menuActions }) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const isDark = useDarkMode();
  const [batteryLevel, setBatteryLevel] = useState(-1);

  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    getBatteryLevelAsync().then((t) => setBatteryLevel(t));
    getBatteryStateAsync().then((state) => {
      setIsCharging(state === 2);
    });
    // const t = addBatteryStateListener((state) => {
    //   setIsCharging(state.batteryState === 2);
    // });

    // return () => {
    //   t.remove();
    // };
  });

  return (
    batteryLevel !== -1 && (
      <View>
        {/* {panelState !== "COLLAPSED" && (
          <MenuPopover
            options={menuActions}
            trigger={
              <Button style={widgetMenuStyles.button} dense>
                <ButtonText weight={800} style={widgetMenuStyles.text}>
                  Battery
                </ButtonText>
                <Icon style={{ color: theme[11] }}>expand_more</Icon>
              </Button>
            }
          />
        )} */}
        <View
          style={{
            backgroundColor: theme[3],
            borderRadius: 16,
            padding: panelState === "COLLAPSED" ? 16 : 0,
          }}
        >
          <View
            style={{
              flexDirection:
                panelState === "COLLAPSED" ? "column-reverse" : "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text
              weight={900}
              style={{
                fontSize: panelState === "COLLAPSED" ? 17 : 24,
                color: theme[11],
                marginTop: panelState === "COLLAPSED" ? -16 : 0,
              }}
            >
              {Math.round(batteryLevel * 100)}%
            </Text>
            <View
              style={{
                position: "relative",
              }}
            >
              <Svg
                viewBox="0 0 1024 1024"
                height={panelState === "COLLAPSED" ? 50 : 70}
                fill={theme[11]}
                style={{ marginTop: panelState === "COLLAPSED" ? -10 : 0 }}
              >
                <Path d="M792 288H128c-52.8 0-96 43.2-96 96v256c0 52.8 43.2 96 96 96h664c52.8 0 96-43.2 96-96V384c0-52.8-43.2-96-96-96z m40 352c0 22-18 40-40 40H128c-22 0-40-18-40-40V384c0-22 18-40 40-40h664c22 0 40 18 40 40v256z m96-230.8v205.6c32 0 64-55.4 64-102.8s-32-102.8-64-102.8z" />
                <Path
                  strokeWidth={2}
                  d={`M768 384H152c-13.2 0-24 10.8-24 24v208c0 13.2 10.8 24 24 24h${
                    batteryLevel * 616
                  }c13.2 0 24-10.8 24-24V408c0-13.2-10.8-24-24-24z`}
                />
              </Svg>
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  alignItems: "center",
                  // backgroundColor: "red",
                  paddingRight: 5,
                  paddingBottom: panelState === "COLLAPSED" ? 12 : 1,
                  justifyContent: "center",
                }}
              >
                {isCharging && (
                  <Icon
                    filled
                    style={{
                      color: theme[isDark ? 12 : 2],
                      textShadowColor: theme[isDark ? 2 : 11],
                      textShadowOffset: { width: 2, height: 2 },
                      textShadowRadius: 10,
                    }}
                    size={panelState === "COLLAPSED" ? 30 : 40}
                  >
                    bolt
                  </Icon>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  );
}

