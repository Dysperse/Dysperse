const IS_DEV = process.env.APP_VARIANT === "development";

export default {
  expo: {
    name: IS_DEV ? "Dysperse (Dev)" : "Dysperse",
    description: "The new standard for productivity",
    slug: "Dysperse",
    scheme: "dysperse",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-screens/light.png",
      resizeMode: "cover",
      backgroundColor: "#DDF9F2",
    },
    experiments: {
      tsconfigPaths: true,
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      splash: {
        resizeMode: "cover",
        image: "./assets/splash-screens/light.png",
        backgroundColor: "#DDF9F2",
        dark: {
          resizeMode: "cover",
          image: "./assets/splash-screens/dark.png",
          backgroundColor: "#092C2B",
        },
      },
    },
    android: {
      splash: {
        resizeMode: "cover",
        image: "./assets/splash-screens/light.png",
        backgroundColor: "#DDF9F2",
        dark: {
          resizeMode: "cover",
          image: "./assets/splash-screens/dark.png",
          backgroundColor: "#092C2B",
        },
      },
      softwareKeyboardLayoutMode: "pan",
      package: "com.manucodes.Dysperse",
    },
    web: {
      name: "Dysperse",
      lang: "en",
      orientation: "portrait",
      splash: {
        image: "./assets/splash-screens/light.png",
        resizeMode: "cover",
        backgroundColor: "#DDF9F2",
      },
      themeColor: "#DDF9F2",
      favicon: "./assets/favicon.png",
      bundler: "metro",
      backgroundColor: "#ffffff",
      display: "standalone",
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(PRODUCT_NAME) to access your camera.",
        },
      ],
      [
        "@sentry/react-native/expo",
        {
          organization: "dysperse",
          project: "new-dashboard",
        },
      ],
      [
        "expo-font",
        {
          fonts: [
            "node_modules/@expo-google-fonts/jost/Jost_100Thin.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_200ExtraLight.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_300Light.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_400Regular.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_500Medium.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_600SemiBold.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_700Bold.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_800ExtraBold.ttf",
            "node_modules/@expo-google-fonts/jost/Jost_900Black.ttf",
          ],
        },
      ],
      "expo-router",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow $(PRODUCT_NAME) to use your location.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you share them with your friends.",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
          savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
          isAccessMediaLocationEnabled: true,
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "c0997b30-888c-4328-83fb-f91557e70d3e",
      },
    },
  },
};