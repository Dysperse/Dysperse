// the v2 config imports the css driver on web and react-native on native

// for reanimated: @tamagui/config/v2-reanimated

// for react-native only: @tamagui/config/v2-native

import { config } from "@tamagui/config/v2";

import { Text, View } from "react-native";
import { Tokens } from "tamagui";

import { createTamagui, createTokens } from "tamagui"; // or '@tamagui/core'
const appConfig = createTamagui(config);

// change $heading to "heading" in the tokens
export const tokens = createTokens({
  $heading: "heading",
});

export type AppConfig = typeof appConfig;

declare module "tamagui" {
  // or '@tamagui/core'
  // overrides TamaguiCustomConfig so your custom types

  // work everywhere you import `tamagui`

  interface TamaguiCustomConfig extends AppConfig {}
}
export default appConfig;
