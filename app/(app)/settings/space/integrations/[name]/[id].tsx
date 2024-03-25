import { createTab } from "@/components/layout/openTab";
import { SettingsLayout } from "@/components/settings/layout";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import Alert from "@/ui/Alert";
import { Avatar } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import { EmojiPicker } from "@/ui/EmojiPicker";
import ErrorAlert from "@/ui/Error";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";

const CalendarPicker = () => {
  const theme = useColorTheme();
  const { id } = useLocalSearchParams();
  const { data } = useSWR([
    "space/integrations/settings/google-calendar",
    { id },
  ]);

  const { control } = useFormContext();

  const CalendarButton = ({ value, onChange, item }) => (
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
        if (value.find((i) => i.id === item.id)) {
          onChange(value.filter((i) => i.id !== item.id));
        } else {
          onChange([
            ...value,
            {
              id: item.id,
              name: item.summary,
              // TODO: Add more functionality
              integrationParams: {
                calendarId: item.id,
              },
            },
          ]);
        }
        console.log(value);
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
      <Icon
        size={30}
        style={{ marginLeft: "auto" }}
        filled={value.find((i) => i.id === item.id)}
      >
        {value.find((i) => i.id === item.id) ? "check_circle" : "circle"}
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
        <Controller
          control={control}
          name="labels"
          render={({ field: { value, onChange } }) => (
            <FlashList
              key={JSON.stringify(value)}
              data={data.items}
              ListEmptyComponent={() => (
                <View
                  style={{
                    height: 297,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text>No calendars found in your Google account</Text>
                </View>
              )}
              renderItem={({ item }) => (
                <CalendarButton value={value} onChange={onChange} item={item} />
              )}
              keyExtractor={(item: any) => item.id}
              estimatedItemSize={70}
            />
          )}
        />
      </View>
      <Alert
        title="Calendars create labels, which you can customize later."
        emoji="1f3f7"
        style={{ marginTop: 20 }}
        dense
        italicize
      />
    </>
  );
};

const CollectionsPicker = () => {
  const theme = useColorTheme();
  const { data } = useSWR(["space/collections"]);

  const { control } = useFormContext();

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
        Create collection
      </Text>
      <View
        style={{
          backgroundColor: theme[3],
          height: 100,
          borderRadius: 20,
          borderColor: theme[4],
          borderWidth: 2,
          marginTop: 10,
          overflow: "hidden",
          flexDirection: "row",
          alignItems: "center",
          gap: 20,
          paddingHorizontal: 20,
        }}
      >
        <Controller
          control={control}
          name="collection.emoji"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <EmojiPicker emoji={value} setEmoji={onChange}>
              <IconButton style={{ borderStyle: "dashed" }} size={50}>
                <Emoji emoji={value} size={40} />
              </IconButton>
            </EmojiPicker>
          )}
        />
        <Controller
          control={control}
          name="collection.name"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <TextField
              placeholder="Name"
              value={value}
              onChangeText={onChange}
              weight={700}
              style={{ fontSize: 30, height: 100, flex: 1, shadowRadius: 0 }}
            />
          )}
        />
      </View>
    </>
  );
};

export default function Page() {
  const { session, sessionToken } = useUser();
  const { id } = useLocalSearchParams();
  const handleBack = () => router.replace("/settings/space/integrations");
  const { data, error } = useSWR(["space/integrations/about", { id }]);
  const integration = data?.[0];

  const methods = useForm({
    defaultValues: {
      collection: {
        name: `${session?.user?.profile?.name?.split(" ")?.[0]}'s collection`,
        emoji: "1f600",
      },
      labels: [],
    },
  });

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const collection = await sendApiRequest(
        sessionToken,
        "POST",
        "space/integrations/connect",
        {},
        {
          body: JSON.stringify({ id, ...data }),
        }
      );
      Toast.show({ type: "success", text1: "Connected!" });
      await createTab(sessionToken, {
        label: collection.name,
        icon: "view_kanban",
        slug: `/[tab]/collections/[id]/[type]`,
        params: { id: collection.id, type: "kanban" },
      });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
    alert(JSON.stringify(data));
  };
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();

  return (
    <SettingsLayout>
      <View
        style={[
          { flex: 1 },
          breakpoints.md && {
            borderWidth: 1,
            borderColor: theme[6],
            borderRadius: 20,
          },
        ]}
      >
        <View style={{ flexDirection: "row" }}>
          <ConfirmationModal
            height={380}
            title="Exit setup?"
            secondary="This will discard any changes you've made."
            onSuccess={handleBack}
          >
            <Button variant="outlined">
              <Icon>arrow_back_ios_new</Icon>
              <ButtonText>
                {integration ? integration?.about?.name : "Back"}
              </ButtonText>
            </Button>
          </ConfirmationModal>
        </View>
        {data ? (
          <FormProvider {...methods}>
            <View style={{ marginVertical: 20, paddingTop: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 30,
                  marginBottom: 20,
                }}
              >
                <Image
                  source={{ uri: integration?.about?.icon }}
                  style={{
                    width: 50,
                    height: 50,
                  }}
                />
                <View>
                  <Text style={{ fontSize: 20 }} weight={700}>
                    Continue setup
                  </Text>
                  <Text style={{ opacity: 0.7 }}>
                    {integration?.about?.name}
                  </Text>
                </View>
              </View>
              <CollectionsPicker />
              <CalendarPicker />
              <View
                style={{
                  flexDirection: "row",
                  marginVertical: 20,
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  isLoading={loading}
                  onPress={methods.handleSubmit(onSubmit)}
                  text="Done"
                  icon="check"
                  variant="filled"
                  large
                />
              </View>
            </View>
          </FormProvider>
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
      </View>
    </SettingsLayout>
  );
}
