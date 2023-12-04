import { Stack } from "expo-router/stack";
import AccountNavbar from "../../../ui/account-navbar";
import Navbar from "../../../ui/navbar";
import { TransitionPresets } from "@react-navigation/stack";

import { ParamListBase, StackNavigationState } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationEventMap,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { withLayoutContext } from "expo-router";
import { Platform } from "react-native";

const { Navigator } = createStackNavigator();

export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);

export default function Layout() {
  const RenderStack = Platform.OS === "ios" ? Stack : JsStack;

  return (
    <RenderStack
      screenOptions={
        {
          ...TransitionPresets.ModalPresentationIOS,
          gestureEnabled: true,
          [Platform.OS === "ios" ? "contentStyle" : "cardStyle"]: {
            backgroundColor: "#fff",
          },
          header: (props: any) => <Navbar {...props} icon="arrow-back-ios" />,
        } as any
      }
    >
      <RenderStack.Screen
        name="index"
        options={{
          headerTitle: "Spaces",
        }}
      />
      <RenderStack.Screen
        name="[space]"
        options={{
          presentation: "modal",
          header: (props: any) => <Navbar {...props} icon="expand-more" />,
        }}
      />
    </RenderStack>
  );
}
