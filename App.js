import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, SafeAreaView, View, Pressable } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { blue } from "./themes";
const Stack = createStackNavigator();

export const AuthContext = React.createContext({
  token: null,
  setToken: () => {},
});

function IntroScreen() {
  return (
    <>
      <Text>Welcome to Dysperse!</Text>
      {/* Add 2 buttons */}
      <Pressable
        onPress={() => {}}
        style={{
          backgroundColor: blue["blue9"],
          padding: 10,
          borderRadius: 5,
        }}
      >
        <Text>Sign in</Text>
      </Pressable>
      <Pressable onPress={() => {}}>
        <Text>Sign Up</Text>
      </Pressable>
    </>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <StatusBar style="auto" />
        <Stack.Navigator>
          <Stack.Screen
            name="Authentication"
            options={{
              header: () => null,
            }}
            component={IntroScreen}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
