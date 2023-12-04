import { TransitionPresets } from "@react-navigation/stack";
import { Stack } from "expo-router/stack";
import Navbar from "../../../ui/navbar";

import { ParamListBase, StackNavigationState } from "@react-navigation/native";
import {
  StackNavigationEventMap,
  StackNavigationOptions,
  createStackNavigator,
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
          header: (props: any) => null,
        }}
      />
    </RenderStack>
  );
}
