import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Chip from "@/ui/Chip";
import Icon from "@/ui/Icon";
import SettingsScrollView from "@/ui/SettingsScrollView";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { ReactElement, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export const pickImageAsync = async (setLoading, onChange) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      presentationStyle: ImagePicker.UIImagePickerPresentationStyle.POPOVER,
    });

    if (!result.canceled) {
      setLoading(true);

      // convert to File
      const blob = await fetch(result.assets[0].uri).then((r) => r.blob());
      const form = new FormData();

      form.append(
        "source",
        new File([blob], "filename", {
          type: "image/png",
          lastModified: new Date().getTime(),
        })
      );

      const res = await fetch("https://api.dysperse.com/upload", {
        method: "POST",
        body: form,
      }).then((res) => res.json());

      onChange(res.image.display_url);
    } else {
      alert("You did not select any image.");
    }
  } catch (e) {
    Toast.show({ type: "error" });
  } finally {
    setLoading(false);
  }
};

export const ProfilePictureUploadButton = ({
  children,
  control,
}: {
  children?: ReactElement;
  control: any;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <Controller
      control={control}
      name="picture"
      render={({ field: { onChange, value } }) => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 20 }}>
          <ProfilePicture name="Profile Picture" image={value} size={60} />
          <Button
            onPress={() => pickImageAsync(setLoading, onChange)}
            variant="filled"
            isLoading={loading}
            containerStyle={{ minWidth: 120 }}
          >
            <Icon>upload</Icon>
            <ButtonText weight={700}>Upload</ButtonText>
          </Button>
        </View>
      )}
    />
  );
};

export default function Page() {
  const theme = useColorTheme();
  const { session, mutate, sessionToken } = useUser();

  const { control, handleSubmit } = useForm({
    defaultValues: {
      name: session?.user?.profile?.name,
      bio: session?.user?.profile?.bio,
      picture: session?.user?.profile?.picture,
      birthday: dayjs(session?.user?.profile?.birthday),
    },
  });

  const onSubmit = async (data) => {
    try {
      sendApiRequest(
        sessionToken,
        "PUT",
        "user/profile",
        {},
        {
          body: JSON.stringify(data),
        }
      );
      mutate(
        (oldData) => ({
          ...oldData,
          user: {
            ...oldData.user,
            profile: {
              ...oldData.user.profile,
              ...data,
            },
          },
        }),
        {
          revalidate: false,
        }
      );
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <SettingsScrollView>
      <Text style={settingStyles.title}>Profile</Text>
      <View style={{ flexDirection: "row" }}>
        <Chip label="Visible to others" icon="visibility" />
      </View>
      <View
        style={{
          borderRadius: 20,
          backgroundColor: theme[3],
          overflow: "hidden",
          marginTop: 20,
        }}
      >
        <ProfileBanner />
        <View style={{ paddingHorizontal: 40 }}>
          <Text weight={800} style={{ fontSize: 30, marginTop: 20 }}>
            {session.user.profile.name}
          </Text>
          <Text style={{ fontSize: 20, opacity: 0.6, marginBottom: 35 }}>
            {session.user.username
              ? `@${session.user.username}`
              : session.user.email}
          </Text>
        </View>
      </View>
      <View style={{ paddingHorizontal: 10 }}>
        <Text style={settingStyles.heading}>About me</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextField
              onChangeText={onChange}
              variant="filled+outlined"
              value={value}
              placeholder="Your name"
              style={{ marginBottom: 10 }}
            />
          )}
        />
        <Text style={settingStyles.heading}>Picture</Text>
        <ProfilePictureUploadButton control={control} />

        <Text style={settingStyles.heading}>Username</Text>
        <TextField
          variant="filled+outlined"
          value={session.user.username}
          style={{ marginBottom: 10 }}
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          variant="filled"
          height={80}
          containerStyle={{ marginTop: 30 }}
        >
          <ButtonText style={{ fontSize: 20 }} weight={700}>
            Save
          </ButtonText>
          <Icon>check</Icon>
        </Button>
      </View>
    </SettingsScrollView>
  );
}

