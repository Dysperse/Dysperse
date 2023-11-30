import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";
import AccountNavbar from "../../ui/account-navbar";
import { AuthProvider } from "../../context/AuthProvider";

export default function TabsLayout() {
  return (
    <AuthProvider>
      <Tabs
        initialRouteName="home"
        screenOptions={{
          header: (props) => <AccountNavbar {...props} />,
          tabBarStyle: Platform.OS === "ios" && {
            backgroundColor: "transparent",
          },
        }}
        tabBar={(props) =>
          Platform.OS === "ios" ? (
            <BlurView
              style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
              intensity={95}
            >
              <BottomTabBar {...props} />
            </BlurView>
          ) : (
            <BottomTabBar {...props} />
          )
        }
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
                <MaterialCommunityIcons
                  name="check-circle-outline"
                  size={30}
                  color={color}
                />
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
                <MaterialCommunityIcons
                  name="home-variant-outline"
                  size={30}
                  color={color}
                />
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
                <MaterialCommunityIcons
                  name="package-variant-closed"
                  size={30}
                  color={color}
                />
              </View>
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
