import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import { SWRConfig } from "swr";
import { AuthProvider, IntroScreen, useAuth } from "../../context/AuthProvider";
import AccountNavbar from "../../ui/account-navbar";

function Pill({ color, children }) {
  return <View>{children}</View>;
}

function RenderTabs() {
  const { session } = useAuth();
  // useEffect(() => {
  //   if (Platform.OS === "android") {
  //     NavigationBar.setBackgroundColorAsync(primary3);
  //     NavigationBar.setBorderColorAsync(primary3);
  //     NavigationBar.setButtonStyleAsync("dark");
  //   }
  // }, [session?.user?.color, primary3, Platform.OS]);

  return session ? (
    <>
      <SWRConfig
        value={{
          fetcher: ([
            resource,
            params,
            host = "https://api.dysperse.com",
            init = {},
          ]) => {
            const url = `${host}/${resource}?${new URLSearchParams(
              params
            ).toString()}`;
            return fetch(url, {
              headers: {
                Authorization: `Bearer ${session?.current?.token}`,
              },
              ...init,
            }).then((res) => res.json());
          },
        }}
      >
        <Tabs
          initialRouteName="home"
          screenOptions={{
            header: (props) => (session ? <AccountNavbar {...props} /> : null),
            tabBarStyle: {
              // backgroundColor: addHslAlpha(
              //   primary3,
              //   Platform.OS === "android" ? 1 : 0.8
              // ),
              borderTopWidth: 0,
              borderColor: "transparent",
              paddingTop: Platform.OS === "web" ? 4 : 20,
              height: 64,
              paddingBottom: 8,
            },
            // tabBarActiveTintColor: primary5,
            tabBarInactiveTintColor: "transparent",
          }}
          sceneContainerStyle={
            {
              // backgroundColor,
            }
          }
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
                      // color={color == "transparent" && primary11}
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
                      // color={color == "transparent" && primary11}
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
                      // color={color == "transparent" && primary11}
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
              tabBarStyle: { display: "none" },
            }}
          />
        </Tabs>
      </SWRConfig>
    </>
  ) : (
    <IntroScreen />
  );
}

export default function TabsLayout() {
  return (
    <AuthProvider>
      <RenderTabs />
    </AuthProvider>
  );
}
