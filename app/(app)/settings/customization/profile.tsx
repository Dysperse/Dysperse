import { SettingsLayout } from "@/components/settings/layout";
import { settingStyles } from "@/components/settings/settingsStyles";
import { useUser } from "@/context/useUser";
import { sendApiRequest } from "@/helpers/api";
import { ProfilePicture } from "@/ui/Avatar";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import Text from "@/ui/Text";
import TextField from "@/ui/TextArea";
import { useColorTheme } from "@/ui/color/theme-provider";
import dayjs from "dayjs";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
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
      const file = new File([blob], result.assets[0].fileName, {
        type: blob.type,
      });
      const form = new FormData();
      form.append("image", file);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=9fb5ded732b6b50da7aca563dbe66dec",
        {
          method: "POST",
          body: form,
        }
      ).then((res) => res.json());
      onChange(res.data.display_url);
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
            style={{ minWidth: 120 }}
          >
            <Icon>upload</Icon>
            <ButtonText weight={700}>Upload</ButtonText>
          </Button>
        </View>
      )}
    />
  );
};

function ProfileBanner({ data }) {
  const theme = useColorTheme();

  return (
    <LinearGradient
      colors={[theme[9], theme[5]]}
      style={{
        padding: 30,
        height: 140,
        marginBottom: 20,
      }}
    >
      <ProfilePicture
        style={{ top: 80, position: "absolute" }}
        name={data.profile?.name || "--"}
        image={data.profile?.picture}
        size={90}
      />
    </LinearGradient>
  );
}

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
      mutate((oldData) => ({
        ...oldData,
        user: {
          ...oldData.user,
          profile: {
            ...oldData.user.profile,
            ...data,
          },
        },
      }));
      Toast.show({ type: "success", text1: "Saved!" });
    } catch (e) {
      Toast.show({ type: "error" });
    }
  };

  return (
    <SettingsLayout>
      <Text style={settingStyles.title}>Profile</Text>
      <View
        style={{
          borderRadius: 20,
          backgroundColor: theme[3],
          overflow: "hidden",
        }}
      >
        <ProfileBanner data={session.user} />
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
        <Controller
          control={control}
          name="bio"
          render={({ field: { onChange, value } }) => (
            <TextField
              multiline
              onChangeText={onChange}
              variant="filled+outlined"
              value={value}
              style={{ marginBottom: 10 }}
              placeholder="Tell the world about yourself <3"
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
        <Text style={settingStyles.heading}>Birthday</Text>
        <TextField
          editable={false}
          variant="filled+outlined"
          value={dayjs(session.user.profile.birthday).format("MMMM D, YYYY")}
          placeholder="Tell the world about yourself <3"
        />

        <Button
          onPress={handleSubmit(onSubmit)}
          variant="filled"
          style={{
            height: 80,
            marginTop: 30,
          }}
        >
          <ButtonText style={{ fontSize: 20 }} weight={700}>
            Save
          </ButtonText>
          <Icon>check</Icon>
        </Button>
      </View>
    </SettingsLayout>
  );
}
