import { ArcSystemBar } from "@/components/layout/arcAnimations";
import { useSession } from "@/context/AuthProvider";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import * as Contacts from "expo-contacts";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import useSWR from "swr";
import { MenuButton } from "./home";

function FriendsList() {
  const { session } = useSession();
  const [contacts, setContacts] = useState([]);
  console.log(session);
  const { data, error } = useSWR("user/friends", {
    fetcher: () =>
      fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/friends/suggestions`, {
        method: "POST",
        body: JSON.stringify({
          contactEmails: contacts.filter(
            (contact) => contact.emails && contact.emails.length > 0
          ),
        }),
        headers: {
          Authorization: `Bearer ${session}`,
        },
      }).then((res) => res.json()),
  });

  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.getPermissionsAsync();
      setHasContactsPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    if (!hasContactsPermission) return;
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.Emails,
            Contacts.Fields.Image,
            Contacts.Fields.Name,
            Contacts.Fields.PhoneNumbers,
          ],
        });

        setContacts(data);
      }
    })();
  }, [hasContactsPermission]);

  return data ? (
    <View style={{ flex: 1 }}>
      <FlatList
        data={[
          ...data.friends,
          ...data.contactsUsingDysperse.map((t) => ({
            ...t,
            suggestion: true,
          })),
        ]}
        renderItem={({ item }) => (
          <ListItemButton>
            <Avatar
              image={item.user?.profile?.picture || item.profile?.contactImage}
              name={item.user?.profile?.name}
              size={50}
            />
            <ListItemText
              primary={item.user?.profile?.name || item.profile?.name}
              secondary={
                item.suggestion ? "In your contacts" : item.user?.profile?.email
              }
            />
          </ListItemButton>
        )}
      />
    </View>
  ) : (
    <View style={{ padding: 20 }}>{error ? <ErrorAlert /> : <Spinner />}</View>
  );
}

function ContactBanner() {
  const theme = useColorTheme();
  const [hasContactsPermission, setHasContactsPermission] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.getPermissionsAsync();
      setHasContactsPermission(status === "granted");
    })();
  }, []);

  return (
    !hasContactsPermission && (
      <View
        style={{
          marginTop: 10,
          backgroundColor: theme[3],
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
          padding: 20,
          paddingHorizontal: 25,
        }}
      >
        <Icon bold size={30}>
          person_add
        </Icon>
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme[11] }} weight={800}>
            Find friends quicker by syncing your contacts.
          </Text>
        </View>
        <Button
          text="Allow"
          variant="filled"
          backgroundColors={{
            default: theme[4],
            hovered: theme[5],
            pressed: theme[6],
          }}
          onPress={async () => {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status === "granted") {
              setHasContactsPermission(true);
            }
          }}
          containerStyle={{ marginLeft: -15, marginRight: -5 }}
        />
      </View>
    )
  );
}

export default function Page() {
  const theme = useColorTheme();

  return (
    <>
      <MenuButton gradient back />
      <ArcSystemBar />
      <View
        style={{
          marginTop: 80,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontFamily: "serifText700",
            fontSize: 30,
          }}
        >
          Friends
        </Text>

        <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
          <Button
            containerStyle={{ flex: 1 }}
            icon="ios_share"
            text="Invite"
            bold
            large
            variant="filled"
          />
          <Button
            containerStyle={{ flex: 1 }}
            icon="search"
            text="Search"
            bold
            large
            variant="filled"
          />
        </View>

        <View
          style={{
            marginTop: 10,
            backgroundColor: theme[3],
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            padding: 20,
            paddingHorizontal: 25,
          }}
        >
          <Icon bold size={30}>
            waving_hand
          </Icon>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme[11] }} weight={800}>
              Invite a friend—get 25 storage credits each!
            </Text>
          </View>
          <IconButton
            icon="close"
            style={{ marginRight: -5 }}
            onPress={() => {}}
            backgroundColors={{
              default: theme[4],
              hovered: theme[5],
              pressed: theme[6],
            }}
          />
        </View>
        <ContactBanner />
      </View>

      <FriendsList />
    </>
  );
}

