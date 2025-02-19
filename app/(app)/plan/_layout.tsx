import { JsStack } from "@/components/layout/_stack";
import { PlanContextProvider } from "@/context/planContext";
import { useWebStatusBar } from "@/helpers/useWebStatusBar";
import { useColorTheme } from "@/ui/color/theme-provider";
import ConfirmationModal from "@/ui/ConfirmationModal";
import IconButton from "@/ui/IconButton";
import {
  StackNavigationProp,
  TransitionPresets,
} from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

const styles = StyleSheet.create({
  navbar: {
    paddingTop: 10,
    padding: 20,
    width: "100%",
    alignItems: "center",
    flexDirection: "row",
  },
});

const SLIDE_NUM = 4;

function PlanNavbar({
  navigation,
  route,
}: {
  navigation: StackNavigationProp<any>;
  route: any;
}) {
  const theme = useColorTheme();
  const handleClose = () =>
    router.canGoBack() ? router.back() : router.replace("/home");
  const currentSlide = parseInt(route?.name) || 0;

  return (
    <View style={{ backgroundColor: theme[2] }}>
      <View
        style={{
          height: 7,
          flexDirection: "row",
          paddingHorizontal: 20,
          marginTop: 10,
          gap: 10,
        }}
      >
        {[...Array(SLIDE_NUM + 1)].map((_, i) => (
          <LinearGradient
            colors={
              i <= currentSlide ? [theme[8], theme[11]] : [theme[5], theme[5]]
            }
            key={i}
            style={{
              flex: 1,
              borderRadius: 99,
            }}
          />
        ))}
      </View>
      <View style={styles.navbar}>
        <ConfirmationModal
          height={400}
          onSuccess={() => {
            if (currentSlide === 0) handleClose();
            // path can either be `/plan` or `/plan/1` until `/plan/4`
            else {
              navigation.replace(
                currentSlide === 1 ? "/plan" : `/plan/${currentSlide}`
              );
            }
          }}
          title="Exit?"
          disabled={currentSlide !== 0}
          secondary="Are you sure you want to exit? Tasks you've edited will be saved."
        >
          <IconButton
            onPress={handleClose}
            variant="outlined"
            icon={currentSlide !== 0 ? "arrow_back_ios_new" : "close"}
            size={55}
          />
        </ConfirmationModal>
      </View>
    </View>
  );
}

export default function Layout() {
  const theme = useColorTheme();

  useWebStatusBar({
    active: "#000",
    cleanup: theme[2],
  });

  return (
    <>
      <PlanContextProvider>
        <JsStack
          screenOptions={{
            ...TransitionPresets.SlideFromRightIOS,
            header: ({ navigation, route }) => (
              <PlanNavbar navigation={navigation} route={route} />
            ),
            headerMode: "float",
            detachPreviousScreen: false,
            cardStyle: { backgroundColor: theme[1], display: "flex" },
          }}
        />
      </PlanContextProvider>
    </>
  );
}

