import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GluestackUIProvider, useToken } from "@gluestack-ui/themed";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as NavigationBar from "expo-navigation-bar";
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { SWRConfig } from "swr";
import { config } from "../../config/gluestack-ui.config"; // Optional if you want to use default theme
import { AuthProvider, useAuth } from "../../context/AuthProvider";
import * as themes from "../../themes";
import AccountNavbar from "../../ui/account-navbar";
import { addHslAlpha } from "../../ui/color";
import { Box } from "@gluestack-ui/themed";

function Pill({ color, children }) {
  return (
    <Box
      backgroundColor={color}
      width={64}
      height={40}
      alignItems="center"
      justifyContent="center"
      borderRadius="$full"
    >
      {children}
    </Box>
  );
}

function RenderTabs() {
  const { session } = useAuth();
  const backgroundColor = useToken("colors", "primary1");
  const primary3 = useToken("colors", "primary3");
  const primary5 = useToken("colors", "primary5");
  const primary11 = useToken("colors", "primary11");

  const [colorState, setColorState] = useState("gray");

  useEffect(() => {
    setColorState(session?.user?.color);
    NavigationBar.setBackgroundColorAsync(primary3);
    NavigationBar.setBorderColorAsync(primary3);
    NavigationBar.setButtonStyleAsync("dark");
  }, [session?.user?.color, primary3]);

  return (
    <GluestackUIProvider
      config={{
        ...config,
        tokens: {
          ...config.tokens,
          colors: {
            ...config.tokens.colors,
            ...(session?.user?.color
              ? Object.fromEntries(
                  Object.entries(themes[session.user.color]).map(
                    ([key, value]) => {
                      const match = key.match(/([a-zA-Z]+)(\d+)/);
                      return match
                        ? [`primary${match[2]}`, value]
                        : [key, value];
                    }
                  )
                )
              : {}),
          },
        },
      }}
    >
      <SWRConfig
        value={{
          fetcher: (resource, init) =>
            fetch(resource, {
              headers: {
                Authorization: `Bearer ${session?.current?.token}`,
              },
              ...init,
            }).then((res) => res.json()),
        }}
      >
        <Tabs
          initialRouteName="home"
          screenOptions={{
            header: (props) => (session ? <AccountNavbar {...props} /> : null),
            tabBarStyle: {
              backgroundColor: addHslAlpha(primary3, 0.8),
              borderWidth: 0,
              paddingTop: 8,
              height: 64,
              paddingBottom: 12,
            },
            tabBarActiveTintColor: primary5,
            tabBarInactiveTintColor: "transparent",
          }}
          sceneContainerStyle={{
            backgroundColor: backgroundColor,
          }}
          tabBar={(props) => (
            <BlurView
              style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
              intensity={20}
            >
              <BottomTabBar {...props} />
            </BlurView>
          )}
        >
          <Tabs.Screen
            name="tasks"
            options={{
              href: "/tasks",
              title: "",
              tabBarIcon: ({ color }) => (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Pill color={color}>
                    <MaterialCommunityIcons
                      name="check-circle-outline"
                      size={28}
                      color={color == "transparent" && primary11}
                    />
                  </Pill>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              href: "/",
              title: "",
              tabBarIcon: ({ color }) => (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Pill color={color}>
                    <MaterialCommunityIcons
                      name="home-variant-outline"
                      size={28}
                      color={color == "transparent" && primary11}
                    />
                  </Pill>
                </View>
              ),
            }}
          />
          <Tabs.Screen
            name="account"
            options={{
              title: "",
              href: {
                pathname: "/account",
              },
              tabBarIcon: ({ color }) => (
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "transparent",
                  }}
                >
                  <Pill color={color}>
                    <MaterialCommunityIcons
                      name="package-variant-closed"
                      size={28}
                      color={color == "transparent" && primary11}
                    />
                  </Pill>
                </View>
              ),
            }}
          />

          <Tabs.Screen
            name="spaces"
            options={{
              href: null,
              header: () => null,
            }}
          />
        </Tabs>
      </SWRConfig>
    </GluestackUIProvider>
  );
}

export default function TabsLayout() {
  return (
    <AuthProvider>
      <RenderTabs />
    </AuthProvider>
  );
}
