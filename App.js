import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, SafeAreaView, View, Pressable } from "react-native";
import { Text } from "react-native-paper";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { blue } from "./themes";
import { PaperProvider } from "react-native-paper";
import { Button } from "react-native-paper";

const Stack = createStackNavigator();

export const AuthContext = React.createContext({
  token: null,
  setToken: () => {},
});

function IntroScreen() {
  return (
    <View
      style={{
        padding: 20,
        height: "100%",
        justifyContent: "flex-end",
        gap: 10,
      }}
    >
      <Text variant="displayLarge">Welcome to Dysperse.</Text>
      <Text variant="headlineSmall">
        We're here to redefine the standard for productivity.
      </Text>
      <Button mode="contained" onPress={() => console.log("Pressed")}>
        Log in
      </Button>
      <Button mode="text" onPress={() => console.log("Pressed")}>
        New to Dysperse? Sign up
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <PaperProvider>
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
      </PaperProvider>
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
