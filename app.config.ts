import { withSentry } from "@sentry/react-native/expo";
import { ConfigContext, ExpoConfig } from "expo/config";
import * as themeColors from "./themes.js";

export function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

const themes = [
  "tomato",
  "red",
  "crimson",
  "ruby",
  "jade",
  "iris",
  "pink",
  "plum",
  "purple",
  "violet",
  "indigo",
  "blue",
  "cyan",
  "teal",
  "green",
  "grass",
  "orange",
  "brown",
  "sky",
  "mint",
  "lime",
  "yellow",
  "amber",
  "gray",
  "mauve",
  "slate",
  "sage",
  "olive",
  "sand",
  "bronze",
  "gold",
];

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig =>
  withSentry(
    {
      ...config,
      name: IS_DEV ? "Dysperse (Dev)" : "Dysperse",
      description: "The new standard for productivity",
      slug: "Dysperse",
      scheme: "dysperse",
      // version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "automatic",
      experiments: {
        tsconfigPaths: true,
      },
      notification: {
        iosDisplayInForeground: true,
        icon: "./assets/notification.png",
      },
      assetBundlePatterns: ["**/*"],
      ios: {
        bundleIdentifier: IS_DEV ? "com.dysperse.dev" : "com.dysperse.app",
        supportsTablet: true,
        splash: {
          dark: {
            backgroundColor: "#0a1f1d",
            image: "./assets/splash-screens/dark.png",
          },
          image: "./assets/splash-screens/light.png",
          backgroundColor: "#effefa",
        },
        googleServicesFile: IS_DEV
          ? process.env.GOOGLE_SERVICE_PLIST_DEV
          : process.env.GOOGLE_SERVICE_PLIST,
      },
      android: {
        googleServicesFile: IS_DEV
          ? process.env.GOOGLE_SERVICES_DEV
          : process.env.GOOGLE_SERVICES,
        intentFilters: [
          {
            action: "VIEW",
            autoVerify: true,
            data: [
              {
                scheme: "https",
                host: "dysperse.com",
                pathPrefix: "/",
              },
            ],
          },
        ],
        icon: "./assets/icon.png",
        adaptiveIcon: {
          backgroundColor: "#156359",
          foregroundImage: "./assets/android-icons/adaptive-icon.png",
          monochromeImage: "./assets/android-icons/monochrome.png",
        },
        softwareKeyboardLayoutMode: "pan",
        package: IS_DEV ? "com.dysperse.dev" : "com.dysperse.app",
      },
      web: {
        name: "Dysperse",
        lang: "en",
        orientation: "portrait",
        themeColor: "#effefa",
        favicon: "./assets/favicon.png",
        bundler: "metro",
        backgroundColor: "#ffffff",
        display: "standalone",
      },
      plugins: [
        [
          "expo-alternate-app-icons",
          [
            ...themes.map((key) => ({
              name: `${key}Dark`,
              ios: `./assets/icons/${key}Dark.png`,
              android: {
                foregroundImage: `./assets/icons/${key}Dark.png`,
                backgroundColor: hslToHex(
                  ...(themeColors[`${key}Dark`][`${key}8`]
                    .replace("hsl", "")
                    .replace("(", "")
                    .replace(")", "")
                    .replaceAll("%", "")
                    .split(",")
                    .map(Number) as [number, number, number])
                ),
              },
            })),

            ...themes.map((key) => ({
              name: `${key}Light`,
              ios: `./assets/icons/${key}Light.png`,
              android: {
                foregroundImage: `./assets/icons/${key}Light.png`,
                backgroundColor: hslToHex(
                  ...(themeColors[key][`${key}8`]
                    .replace("hsl", "")
                    .replace("(", "")
                    .replace(")", "")
                    .replaceAll("%", "")
                    .split(",")
                    .map(Number) as [number, number, number])
                ),
              },
            })),
          ],
        ],
        "react-native-edge-to-edge",
        [
          "expo-splash-screen",
          {
            backgroundColor: "#effefa",
            image: "./assets/splash-screens/light.png",
            dark: {
              image: "./assets/splash-screens/dark.png",
              backgroundColor: "#0a1f1d",
            },
            imageWidth: 150,
          },
        ],
        [
          "expo-camera",
          {
            cameraPermission: "Allow $(PRODUCT_NAME) to access your camera.",
          },
        ],
        [
          "expo-build-properties",
          {
            android: {
              compileSdkVersion: 35,
            },
          },
        ],
        [
          "@react-native-google-signin/google-signin",
          {
            iosUrlScheme:
              "com.googleusercontent.apps.990040256661-kf469e9rml2dbq77q6f5g6rprmgjdlkf",
          },
        ],
        [
          "expo-speech-recognition",
          {
            microphonePermission:
              "Allow $(PRODUCT_NAME) to use the microphone.",
            speechRecognitionPermission:
              "Allow $(PRODUCT_NAME) to use speech recognition.",
            androidSpeechServicePackages: [
              "com.google.android.googlequicksearchbox",
            ],
          },
        ],
        [
          "expo-notifications",
          {
            icon: "./assets/notification.png",
            color: "#ffffff",
            defaultChannel: "default",
          },
        ],
        "expo-router",
        "expo-secure-store",
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
      updates: {
        url: "https://u.expo.dev/c0997b30-888c-4328-83fb-f91557e70d3e",
      },
      runtimeVersion: {
        policy: "appVersion",
      },
    },
    {
      url: "https://sentry.io/",
      project: "new-dashboard",
      organization: "dysperse",
    }
  );

