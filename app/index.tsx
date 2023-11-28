import { View } from "tamagui";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Link } from "expo-router";
import { H1, H2, H3, H4, H5, H6, Input } from "tamagui";

export default function Page() {
  return (
    <View>
      <StatusBar style="auto" animated />
      <Link href="/auth">Login</Link>
      <H1>Heading 1</H1>
      <H2>Heading 2</H2>
      <H3>Heading 3</H3>
      <H4>Heading 4</H4>
      <H5>Heading 5</H5>
      <H6>Heading 6</H6>
      <Input size="$4" borderWidth={2} placeholder="Email or username" />
      <Input size="$4" borderWidth={2} placeholder="Password" secureTextEntry />
    </View>
  );
}
