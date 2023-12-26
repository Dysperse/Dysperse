import { ParamListBase, StackNavigationState } from "@react-navigation/native";
import {
  createStackNavigator,
  StackNavigationEventMap,
  StackNavigationOptions,
} from "@react-navigation/stack";
import { withLayoutContext } from "expo-router";

const { Navigator } = createStackNavigator();

export const JsStack = withLayoutContext<
  StackNavigationOptions,
  typeof Navigator,
  StackNavigationState<ParamListBase>,
  StackNavigationEventMap
>(Navigator);
