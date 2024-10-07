import LabelPicker from "@/components/labels/picker";
import { useLabelColors } from "@/components/labels/useLabelColors";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { Avatar } from "@/ui/Avatar";
import { Button } from "@/ui/Button";
import ConfirmationModal from "@/ui/ConfirmationModal";
import Emoji from "@/ui/Emoji";
import ErrorAlert from "@/ui/Error";
import Spinner from "@/ui/Spinner";
import Text from "@/ui/Text";
import { useColorTheme } from "@/ui/color/theme-provider";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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

  const CalendarButton = ({
    value,
    onChange,
    item,
  }: {
    value: any;
    onChange: any;
    item: any;
  }) => {
    const labelColors = useLabelColors();

    return (
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          paddingHorizontal: 20,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <Avatar
          size={10}
          style={{
            backgroundColor: item.backgroundColor,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text weight={500}>{item.summary}</Text>
          <Text style={{ opacity: 0.6, fontSize: 12 }}>{item.description}</Text>
        </View>
        <LabelPicker
          setLabel={(newLabel: any) => {
            onChange({
              ...value,
              [item.id]: newLabel,
            });
          }}
        >
          <Button
            backgroundColors={
              !value[item.id]
                ? undefined
                : {
                    default: labelColors[value[item.id].color][3],
                    hovered: labelColors[value[item.id].color][4],
                    pressed: labelColors[value[item.id].color][5],
                  }
            }
            textStyle={{
              color: !value[item.id]
                ? theme[11]
                : labelColors[value[item.id].color][11],
            }}
            iconStyle={{
              color: !value[item.id]
                ? theme[11]
                : labelColors[value[item.id].color][11],
            }}
            text={value[item.id] ? value[item.id].name : "Connect"}
            icon={value[item.id] ? "check" : "add"}
            variant="filled"
          />
        </LabelPicker>
      </View>
    );
  };

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
          marginTop: 10,
          borderWidth: 1,
          borderRadius: 20,
          borderColor: theme[5],
        }}
      >
        {Array.isArray(data?.items) && (
          <Controller
            control={control}
            name="labels"
            render={({ field: { value, onChange } }) => (
              <>
                {data.items.length === 0 && (
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
                {data.items.map((item) => (
                  <CalendarButton
                    key={item.id}
                    value={value}
                    onChange={onChange}
                    item={item}
                  />
                ))}
              </>
            )}
          />
        )}
      </View>
    </>
  );
};

const CourseLabelPicker = ({ calendarUrl }) => {
  const theme = useColorTheme();
  const { data } = useSWR([
    "space/integrations/canvas-lms-labels",
    { calendarUrl },
  ]);

  const { control } = useFormContext();

  const CourseButton = ({
    value,
    onChange,
    item,
  }: {
    value: any;
    onChange: any;
    item: any;
  }) => {
    const labelColors = useLabelColors();

    const t = value[item.integrationParams.id];

    return (
      <View
        style={{
          flexDirection: "row",
          gap: 20,
          paddingHorizontal: 20,
          paddingVertical: 10,
          alignItems: "center",
        }}
      >
        <Emoji emoji={item.emoji} />
        <View style={{ flex: 1 }}>
          <Text weight={500}>{item.name}</Text>
        </View>
        <LabelPicker
          setLabel={(newLabel: any) => {
            onChange({
              ...value,
              [item.integrationParams.id]: newLabel,
            });
          }}
        >
          <Button
            backgroundColors={
              !t
                ? undefined
                : {
                    default: labelColors[t.color][3],
                    hovered: labelColors[t.color][4],
                    pressed: labelColors[t.color][5],
                  }
            }
            textStyle={{
              color: !t ? theme[11] : labelColors[t.color][11],
            }}
            iconStyle={{
              color: !t ? theme[11] : labelColors[t.color][11],
            }}
            text={t ? t.name : "Connect"}
            icon={t ? "check" : "add"}
            variant="filled"
          />
        </LabelPicker>
      </View>
    );
  };

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
        Select courses
      </Text>
      <View
        style={{
          marginTop: 10,
          borderWidth: 1,
          borderRadius: 20,
          borderColor: theme[5],
        }}
      >
        {Array.isArray(data) && (
          <Controller
            control={control}
            name="labels"
            render={({ field: { value, onChange } }) => (
              <>
                {data.length === 0 && (
                  <View
                    style={{
                      height: 297,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text>No courses found in your Canvas Calendar</Text>
                  </View>
                )}
                {data.map((item) => (
                  <CourseButton
                    key={item.id}
                    value={value}
                    onChange={onChange}
                    item={item}
                  />
                ))}
              </>
            )}
          />
        )}
      </View>
    </>
  );
};

export default function Page() {
  const { session, sessionToken } = useUser();
  const { id, name } = useLocalSearchParams();
  const { data: metadata } = useSWR(
    `${
      process.env.NODE_ENV === "development"
        ? "/integrations.json"
        : "https://app.dysperse.com/integrations.json"
    }`,
    (t) => fetch(t).then((t) => t.json())
  );
  const { data, error } = useSWR(["space/integrations", { id }]);

  const integration = data?.[0]?.integration;
  const integrationMetadata = metadata?.find((i) => i.slug === name);
  const isLoading = !data || !metadata;

  const methods = useForm({
    defaultValues: {
      labels: integration?.labels
        ? integration.labels
            .map((i) => i)
            .reduce((acc, curr) => {
              acc[
                curr.integrationParams?.calendarId || curr.integrationParams?.id
              ] = curr;
              return acc;
            }, {})
        : {},
    },
  });

  const handleDelete = async () => {
    try {
      await sendApiRequest(sessionToken, "DELETE", "space/integrations", {
        id,
      });
      router.replace("/settings/account/integrations/" + name);
      Toast.show({ type: "success", text1: "Deleted!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const collection = await sendApiRequest(
        sessionToken,
        "PUT",
        "space/integrations",
        {},
        {
          body: JSON.stringify({
            id,
            ...data,
            labels: Object.keys(data.labels).reduce((acc, curr) => {
              acc[curr] = data.labels[curr].id;
              return acc;
            }, {}),
          }),
        }
      );
      console.log(collection);
      Toast.show({ type: "success", text1: "Connected!" });
    } catch (e) {
      Toast.show({ type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return !data ? (
    <View>{isLoading ? <Spinner /> : <ErrorAlert />}</View>
  ) : (
    <ScrollView style={{ padding: 40 }}>
      <FormProvider {...methods}>
        <View style={{ marginTop: 10 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 30,
              marginBottom: 20,
            }}
          >
            <Image
              source={{ uri: integrationMetadata?.icon }}
              style={{
                width: 50,
                height: 50,
              }}
            />
            <View>
              <Text style={{ fontSize: 20 }} weight={700}>
                Settings
              </Text>
              <Text style={{ opacity: 0.5 }}>
                {`${integration.params?.account?.email || ""}${
                  integration.params?.account?.email ? " | " : ""
                }`}
                {integrationMetadata.name}
              </Text>
            </View>
          </View>
          {integrationMetadata.id === "GOOGLE_CALENDAR" && <CalendarPicker />}
          {integrationMetadata.id === "CANVAS_LMS" && (
            <CourseLabelPicker calendarUrl={integration.params?.calendarUrl} />
          )}
          <View
            style={{
              flexDirection: "row",
              marginVertical: 20,
              justifyContent: "space-between",
            }}
          >
            <ConfirmationModal
              onSuccess={handleDelete}
              title="Delete integration?"
              secondary="Tasks connected to this integration will be permanently deleted from Dysperse!"
            >
              <Button text="Delete" icon="delete" variant="outlined" large />
            </ConfirmationModal>
            <Button
              isLoading={loading}
              onPress={methods.handleSubmit(onSubmit)}
              text="Save changes"
              iconPosition="end"
              icon="check"
              variant="filled"
              large
            />
          </View>
        </View>
      </FormProvider>
    </ScrollView>
  );
}
