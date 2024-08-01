import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import MenuPopover from "@/ui/MenuPopover";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { useBatteryLevel } from "expo-battery";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useFocusPanelContext } from "../../context";
import { widgetMenuStyles } from "../../widgetMenuStyles";

export default function BatteryWidget({ navigation, widget, menuActions }) {
  const theme = useColorTheme();
  const { panelState } = useFocusPanelContext();
  const batteryLevel = useBatteryLevel();

  return (
    batteryLevel !== -1 && (
      <View>
        {panelState !== "COLLAPSED" && (
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
        )}
        <View
          style={{
            backgroundColor: theme[3],
            borderRadius: 16,
            padding: panelState === "COLLAPSED" ? 16 : 0,
          }}
        >
          <View
            style={{
              flexDirection: panelState === "COLLAPSED" ? "column" : "row",
              justifyContent: "center",
              alignItems: "center",
              gap: panelState === "COLLAPSED" ? 0 : 7,
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
                height: 17,
                backgroundColor: theme[9],
                borderTopRightRadius: 99,
                borderBottomRightRadius: 99,
              }}
            />
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
          </View>
        </View>
      </View>
    )
  );
}
