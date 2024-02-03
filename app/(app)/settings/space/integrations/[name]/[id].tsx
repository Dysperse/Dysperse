import { SettingsLayout } from "@/components/settings/layout";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import capitalizeFirstLetter from "@/utils/capitalizeFirstLetter";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import useSWR from "swr";

const CalendarPicker = () => {
  const theme = useColorTheme();
  const { id } = useLocalSearchParams();
  const { data } = useSWR([
    "space/integrations/settings/google-calendar",
    { id },
  ]);
  const [selected, setSelected] = useState<string[]>([]);

  const CalendarButton = ({ item }) => (
    <Pressable
      style={({ pressed, hovered }) => ({
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        flexDirection: "row",
        height: 70,
        gap: 20,
        paddingHorizontal: 20,
        paddingRight: 30,
        paddingVertical: 20,
        alignItems: "center",
      })}
      onPress={() => {
        if (selected.includes(item.id)) {
          setSelected((prev) => prev.filter((i) => i !== item.id));
        } else {
          setSelected((prev) => [...prev, item.id]);
        }
      }}
    >
      <Avatar
        style={{
          backgroundColor: item.backgroundColor,
        }}
      />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} weight={900}>
          {item.summary}
        </Text>
        <Text numberOfLines={1} style={{ opacity: 0.6 }}>
          {item.description}
        </Text>
      </View>
      <Icon style={{ marginLeft: "auto" }} filled={selected.includes(item.id)}>
        {selected.includes(item.id) ? "check_box" : "check_box_outline_blank"}
      </Icon>
    </Pressable>
  );

  return !data ? (
    <Spinner />
  ) : (
    <>
      <Text
        style={{
          opacity: 0.6,
          fontSize: 20,
          marginTop: 20,
        }}
      >
        Select calendars
      </Text>
      <View
        style={{
          backgroundColor: theme[3],
          height: 300,
          borderRadius: 20,
          borderColor: theme[4],
          borderWidth: 2,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <FlashList
          key={JSON.stringify(selected)}
          data={data.items}
          ListEmptyComponent={<></>}
          renderItem={({ item }) => <CalendarButton item={item} />}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={70}
        />
      </View>
    </>
  );
};

const CollectionsPicker = () => {
  const theme = useColorTheme();
  const { data } = useSWR(["space/collections"]);
  const [selected, setSelected] = useState<string | null>(null);

  const CollectionButton = ({ item }) => (
    <Pressable
      style={({ pressed, hovered }) => ({
        backgroundColor: theme[pressed ? 5 : hovered ? 4 : 3],
        flexDirection: "row",
        height: 70,
        gap: 20,
        paddingHorizontal: 20,
        paddingRight: 30,
        paddingVertical: 20,
        alignItems: "center",
      })}
      onPress={() => setSelected(item.id)}
    >
      <Emoji size={30} emoji={item.emoji || "1f4e6"} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} weight={900}>
          {item.name}
        </Text>
        <Text numberOfLines={1} style={{ opacity: 0.6 }}>
          {item._count.entities} items
        </Text>
      </View>
      <Icon style={{ marginLeft: "auto" }}>
        radio_button_{selected === item.id ? "checked" : "unchecked"}
      </Icon>
    </Pressable>
  );

  return !data ? (
    <Spinner />
  ) : (
    <>
      <Text
        style={{
          opacity: 0.6,
          fontSize: 20,
          marginTop: 20,
        }}
      >
        Select a collection
      </Text>
      <View
        style={{
          backgroundColor: theme[3],
          height: 300,
          borderRadius: 20,
          borderColor: theme[4],
          borderWidth: 2,
          marginTop: 10,
          overflow: "hidden",
        }}
      >
        <FlashList
          key={selected}
          data={data}
          ListEmptyComponent={<></>}
          renderItem={({ item }) => <CollectionButton item={item} />}
          keyExtractor={(item: any) => item.id}
          estimatedItemSize={70}
          ListFooterComponent={
            <ListItemButton style={{ borderRadius: 0, height: 70 }}>
              <Avatar icon="add" size={40} />
              <ListItemText primary="Create new collection" />
            </ListItemButton>
          }
        />
      </View>
    </>
  );
};

export default function Page() {
  const { id } = useLocalSearchParams();
  const handleBack = () => router.replace("/settings/space/integrations");
  const { data, error } = useSWR(["space/integrations/integration", { id }]);
  const integration = data?.[0];

  return (
    <SettingsLayout>
      <View style={{ flexDirection: "row" }}>
        <Button variant="outlined" onPress={handleBack}>
          <Icon>arrow_back_ios_new</Icon>
          <ButtonText>Integrations</ButtonText>
        </Button>
      </View>
      {data ? (
        <View style={{ marginVertical: 20, paddingTop: 20 }}>
          <Image
            source={{ uri: data.integration.icon }}
            style={{
              width: 80,
              height: 80,
            }}
          />
          <Text style={{ fontSize: 20 }} weight={700}>
            Continue setting up{" "}
            {capitalizeFirstLetter(integration.data.name.replaceAll("-", " "))}
          </Text>
          <CollectionsPicker />
          <CalendarPicker />
          <Text>{JSON.stringify(data)}</Text>
        </View>
      ) : error ? (
        <ErrorAlert />
      ) : (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Spinner />
        </View>
      )}
    </SettingsLayout>
  );
}
