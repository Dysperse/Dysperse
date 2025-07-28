import { ProfileModal } from "@/components/ProfileModal";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
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
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Share, View } from "react-native";
import useSWR from "swr";

function FriendsList() {
  const { session, sessionToken } = useUser();
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
          Authorization: `Bearer ${sessionToken}`,
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
  const pendingFriends =
    data?.friends.filter(
      (t) => !t.accepted && t.followingId !== session?.user?.id
    ) || [];

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
            phoneNumber: contact.phoneNumbers?.[0]?.number,
          },
        }))
    : [];

  const friendRequests = data.friends.filter(
    (t) => !t.accepted && t.followingId === session?.user?.id
  );

  const handleFriendRequestAccept = async (item: any, accepted: boolean) => {
    {
      impactAsync(ImpactFeedbackStyle.Heavy);
      mutate(
        (o) => ({
          ...o,
          friends: o.friends.map((f) =>
            f.followerId === item.followerId &&
            f.followingId === item.followingId
              ? { ...f, accepted }
              : f
          ),
        }),
        { revalidate: false }
      );

      sendApiRequest(
        sessionToken,
        "PUT",
        "user/friends",
        {},
        {
          body: JSON.stringify({
            followerId: item.followerId,
            followingId: item.followingId,
            accepted,
          }),
        }
      );
    }
  };

  return data ? (
    <View style={{ flex: 1 }}>
      <FlashList
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => mutate()} />
        }
        estimatedItemSize={70}
        data={[
          friendRequests.length > 0 && "Requests",
          ...friendRequests,
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
            <ProfileModal email={item.profile?.email || item.user?.email}>
              <ListItemButton disabled={item.suggestion}>
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
                    onPress={async () => {
                      if (item.profile?.lastActive) {
                        await sendApiRequest(
                          sessionToken,
                          "POST",
                          "user/friends",
                          {},
                          {
                            body: JSON.stringify({
                              email: item.profile?.email || item.user?.email,
                            }),
                          }
                        );
                        mutate();
                        return;
                      }
                      Linking.openURL(
                        `sms:${
                          item.profile?.phoneNumber || item.profile?.email
                        }?body=Hi, ${
                          item.profile?.name?.split(" ")[0]
                        }! Check out Dysperse, a new productivity app which I use: https://go.dysperse.com/r/${
                          session?.user?.id
                        } \n\nUse the link above to sign up and we'll both get extra storage!`
                      );
                    }}
                  />
                ) : item.accepted ? null : (
                  <>
                    <IconButton
                      icon="close"
                      variant="outlined"
                      style={{ marginLeft: 10 }}
                      onPress={() => {
                        if (
                          item.followingId === session?.user?.id &&
                          item.followerId === session?.user?.id
                        ) {
                          handleFriendRequestAccept(item, false);
                          return;
                        }
                        mutate(
                          (o) => ({
                            ...o,
                            friends: o.friends.filter(
                              (f) =>
                                !(
                                  f.followerId === item.followerId &&
                                  f.followingId === item.followingId
                                )
                            ),
                          }),
                          { revalidate: false }
                        );
                        sendApiRequest(
                          sessionToken,
                          "DELETE",
                          "user/friends",
                          {},
                          {
                            body: JSON.stringify({
                              userId: item.followingId,
                            }),
                          }
                        );
                      }}
                    />
                    {item.followingId === session?.user?.id && (
                      <IconButton
                        icon="check"
                        variant="filled"
                        style={{ marginLeft: -5 }}
                        onPress={() => handleFriendRequestAccept(item.id, true)}
                      />
                    )}
                  </>
                )}
              </ListItemButton>
            </ProfileModal>
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
  const [show, setShow] = useState(false);

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
  const { session } = useUser();

  return (
    <>
      <View
        style={{
          marginTop: 90,
          paddingHorizontal: 25,
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
            onPress={() => {
              Share.share({
                title: "Invite friends to Dysperse",
                message: `Hey! Check out Dysperse, a new productivity app which I use: https://go.dysperse.com/r/${session?.user?.id} \n\nUse the link above to sign up and we'll both get extra storage!`,
              });
            }}
          />
          <Button
            containerStyle={{ flex: 1 }}
            icon="search"
            text="Search"
            bold
            large
            variant="filled"
            onPress={() => router.push("/friends/search")}
          />
        </View>

        <AddFriendsPromo />
        <ContactBanner />
      </View>

      <FriendsList />
    </>
  );
}

