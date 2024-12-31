import { withSentry } from "@sentry/react-native/expo";
import { ConfigContext, ExpoConfig } from "expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig =>
  withSentry(
    {
      ...config,
      name: IS_DEV ? "Dysperse (Dev)" : "Dysperse",
      description: "The new standard for productivity",
      slug: "Dysperse",
      scheme: "dysperse",
      version: "1.0.0",
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
        supportsTablet: true,
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
        package: IS_DEV ? "com.dev.app.dysperse.com" : "com.app.dysperse.com",
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

