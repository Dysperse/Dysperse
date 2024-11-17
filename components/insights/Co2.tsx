import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export const Co2 = ({ data }) => {
  const theme = useColorTheme();
  const breakpoints = useResponsiveBreakpoints();

  return (
    <View
      style={{
        flex: 2,
        backgroundColor: theme[3],
        borderWidth: 1,
        borderColor: theme[5],
        borderRadius: 25,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1 }}>
        <Text variant="eyebrow" weight={900}>
          By using #dysperse, you've saved
        </Text>
        <Text style={{ fontSize: breakpoints.md ? 45 : 30 }} weight={300}>
          {(data?.co2 || 0).toFixed(2)} grams of CO
          <Text style={{ fontSize: 18 }} weight={300}>
            2
          </Text>
          <IconButton
            icon={<Icon style={{ fontSize: 20 }}>info</Icon>}
            style={{ opacity: 0.5, marginLeft: 10 }}
            onPress={() =>
              Toast.show({
                type: "info",
                text1:
                  "CO2 is measured by taking all of your tasks and listing them on traditional notebook paper (1 line per task). The amount of CO2 saved is calculated by the amount of paper you would've used.",
              })
            }
          />
        </Text>
        <Text
          style={{ fontSize: 20, opacity: 0.5, marginTop: -3 }}
          weight={200}
        >
          from being polluted into the atmosphere
        </Text>
      </View>
    </View>
  );
};

