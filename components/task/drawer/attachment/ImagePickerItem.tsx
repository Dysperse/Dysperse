import { addHslAlpha } from "@/ui/color";
import { useColorTheme } from "@/ui/color/theme-provider";
import Spinner from "@/ui/Spinner";
import { TouchableOpacity } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import mime from "mime-types";
import React, { useCallback, useState } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

export function ImagePickerItem({
  task,
  updateTask,
  item,
}: {
  task;
  updateTask;
  item: MediaLibrary.Asset;
}) {
  const [loading, setLoading] = useState(false);
  const theme = useColorTheme();
  const handlePress = useCallback(async () => {
    try {
      setLoading(true);
      const form: any = new FormData();
      form.append("image", {
        uri: item.uri,
        name: item.filename,
        type: mime.lookup(item.filename),
      });

      form.append("name", item.filename);

      const res = await fetch(
        "https://api.imgbb.com/1/upload?key=9fb5ded732b6b50da7aca563dbe66dec",
        {
          method: "POST",
          body: form,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      ).then((res) => res.json());

      updateTask("attachments", [
        ...task.attachments,
        { type: "IMAGE", data: res.data.display_url },
      ]);
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later.",
      });
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [item, updateTask, task]);

  return (
    <View
      style={{
        width: "33.3333%",
        padding: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TouchableOpacity onPress={handlePress}>
        <Image
          transition={100}
          source={{
            uri: item.uri,
            height: 200,
            width: 200,
          }}
          style={{
            width: "100%",
            aspectRatio: 1,
            borderRadius: 10,
            backgroundColor: theme[3],
          }}
        />
        {loading && (
          <View
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              backgroundColor: addHslAlpha(theme[3], 0.9),
              zIndex: 1,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 10,
            }}
          >
            <Spinner />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
