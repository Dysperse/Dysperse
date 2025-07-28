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
import RefreshControl from "@/ui/RefreshControl";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlashList } from "@shopify/flash-list";
import dayjs from "dayjs";
import * as Contacts from "expo-contacts";
import { impactAsync, ImpactFeedbackStyle } from "expo-haptics";
import { useEffect, useState } from "react";
import { View } from "react-native";
import useSWR from "swr";
import { MenuButton } from "./home";

function FriendsList() {
  const { session } = useSession();
  const [contacts, setContacts] = useState([]);
  const [hasContactsPermission, setHasContactsPermission] = useState(false);

  const { data, error, mutate } = useSWR("user/friends", {
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

  useEffect(() => {
    if (hasContactsPermission || contacts.length > 0) {
      mutate();
    }
  }, [hasContactsPermission, contacts]);

  const acceptedFriends = data?.friends.filter((t) => t.accepted) || [];
  const pendingFriends = data?.friends.filter((t) => !t.accepted) || [];

  const inContacts = data
    ? contacts
        .filter(
          (t) =>
            t.name &&
            ((t.emails && t.emails.length > 0) ||
              (t.phoneNumbers && t.phoneNumbers.length > 0))
        )
        .map((contact) => ({
          contactImage: contact.imageAvailable ? contact.image.uri : undefined,
          suggestion: true,
          profile: {
            name: contact.name,
            secondaryText:
              contact.phoneNumbers?.[0]?.number || contact.emails?.[0]?.email,
            email: contact.emails?.[0]?.email,
          },
        }))
    : [];

  return data ? (
    <View style={{ flex: 1 }}>
      <FlashList
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} />
        }
        estimatedItemSize={70}
        data={[
          pendingFriends.length > 0 && "Pending",
          ...pendingFriends,
          acceptedFriends.length > 0 && "Your friends",
          ...acceptedFriends,
          data.contactsUsingDysperse.length > 0 && "Contacts on Dysperse",
          ...data.contactsUsingDysperse.map((t) => ({
            ...t,
            suggestion: true,
          })),
          inContacts.length > 0 && "In your contacts",
          ...inContacts,
        ].filter(Boolean)}
        contentContainerStyle={{
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 70,
        }}
        renderItem={({ item }) =>
          typeof item === "string" ? (
            <Text
              variant="eyebrow"
              style={{ paddingHorizontal: 15, paddingTop: 20 }}
            >
              {item}
            </Text>
          ) : (
            <ListItemButton>
              <Avatar
                disabled
                image={item.user?.profile?.picture || item?.contactImage}
                name={item.user?.profile?.name || item.profile?.name}
                size={50}
              />
              <ListItemText
                primary={item.user?.profile?.name || item.profile?.name}
                secondary={
                  item.profile?.lastActive || item.user?.profile?.lastActive
                    ? `Active ${
                        dayjs(
                          item.profile?.lastActive ||
                            item.user?.profile?.lastActive
                        )
                          .fromNow()
                          .includes("seconds")
                          ? "now"
                          : dayjs(
                              item.profile?.lastActive ||
                                item.user?.profile?.lastActive
                            ).fromNow()
                      }`
                    : item.user?.profile?.email || item.profile?.secondaryText
                }
              />
              {item.suggestion ? (
                <Button
                  text={item.profile?.lastActive ? "Add" : "Invite"}
                  variant={item.profile?.lastActive ? "filled" : "outlined"}
                />
              ) : item.accepted ? null : (
                <>
                  <IconButton
                    icon="close"
                    variant="outlined"
                    style={{ marginLeft: 10 }}
                  />
                </>
              )}
            </ListItemButton>
          )
        }
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

function AddFriendsPromo() {
  const theme = useColorTheme();
  const [show, setShow] = useState(true);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem("addFriendsPromo");
      if (value === "false") {
        setShow(false);
      }
    })();
  }, []);

  return (
    show && (
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
          onPress={() => {
            setShow(false);
            impactAsync(ImpactFeedbackStyle.Light);
            AsyncStorage.setItem("addFriendsPromo", "false");
          }}
          icon="close"
          style={{ marginRight: -5 }}
          backgroundColors={{
            default: theme[4],
            hovered: theme[5],
            pressed: theme[6],
          }}
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

        <AddFriendsPromo />
        <ContactBanner />
      </View>

      <FriendsList />
    </>
  );
}

