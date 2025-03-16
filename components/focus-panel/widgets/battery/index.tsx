import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useDarkMode } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import { getBatteryLevelAsync, getBatteryStateAsync } from "expo-battery";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Svg, { Path } from "react-native-svg";

export default function BatteryWidget({ menuActions }) {
  const theme = useColorTheme();
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
        <Text variant="eyebrow" style={{ marginBottom: 10 }}>
          Battery
        </Text>
        <MenuPopover
          options={menuActions}
          trigger={
            <Pressable
              style={{
                backgroundColor: theme[2],
                borderRadius: 20,
                padding: 16,
                borderWidth: 1,
                borderColor: theme[5],
              }}
            >
              <View
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <View
                  style={{
                    position: "relative",
                  }}
                >
                  <Svg
                    viewBox="0 0 1024 1024"
                    height={50}
                    fill={theme[11]}
                    style={{ marginTop: -10 }}
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
                      paddingBottom: 12,
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
                        size={30}
                      >
                        bolt
                      </Icon>
                    )}
                  </View>
                  <Text
                    weight={900}
                    style={{
                      fontSize: 17,
                      color: theme[11],
                      marginTop: -10,
                      textAlign: "center",
                    }}
                  >
                    {Math.round(batteryLevel * 100)}%
                  </Text>
                </View>
              </View>
            </Pressable>
          }
        />
      </View>
    )
  );
}

