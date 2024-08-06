import { Button, ButtonText } from "@/ui/Button";
import { useColorTheme } from "@/ui/color/theme-provider";
import Emoji from "@/ui/Emoji";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import Text from "@/ui/Text";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ImagePickerItem } from "./ImagePickerItem";

export function TaskImagePicker({ task, updateTask }) {
  const theme = useColorTheme();
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [assets, setAssets] = useState([]);
  const [selectAlbums, setSelectAlbums] = useState(false);

  const getAlbumsAsync = async () => {
    const perm = await MediaLibrary.requestPermissionsAsync();
    if (!perm.granted) {
      Toast.show({
        type: "error",
        text1: "Please enable media library permissions in your settings.",
      });
    }

    const albums = await MediaLibrary.getAlbumsAsync();
    setAlbums(albums);

    // find album with highest number of assets
    setSelectedAlbum(
      albums.reduce((a, b) => (a.assetCount > b.assetCount ? a : b), albums[0])
    );
  };

  useEffect(() => {
    getAlbumsAsync();
  }, []);

  useEffect(() => {
    if (selectedAlbum) {
      MediaLibrary.getAssetsAsync({
        first: 20,
        mediaType: "photo",
        sortBy: "modificationTime",
        album: selectedAlbum.id,
      }).then((e) => setAssets(e.assets));
    }
  }, [selectedAlbum]);

  const loadMoreAlbums = () => {
    if (!selectedAlbum || assets.length === 0) {
      return;
    }
    MediaLibrary.getAssetsAsync({
      first: 20,
      mediaType: "photo",
      sortBy: "modificationTime",
      album: selectedAlbum.id,
      after:
        Platform.OS === "android"
          ? (assets.length + 1).toString()
          : assets[assets.length - 1].id,
    })
      .then((e) => setAssets([...assets, ...e.assets]))
      .catch(() => alert("Error"));
  };

  const header = (
    <Button
      variant="filled"
      containerStyle={{ marginVertical: 10 }}
      onPress={() => setSelectAlbums(true)}
    >
      <ButtonText>{selectedAlbum?.title}</ButtonText>
      <Icon>{selectAlbums ? "expand_less" : "expand_more"}</Icon>
    </Button>
  );

  return selectAlbums ? (
    <FlatList
      data={albums}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <ListItemButton
          onPress={() => {
            setSelectedAlbum(item);
            setSelectAlbums(false);
          }}
        >
          <ListItemText
            primary={item.title}
            secondary={item.assetCount + " items"}
          />
          {selectedAlbum?.id === item.id && <Icon>check</Icon>}
        </ListItemButton>
      )}
      keyExtractor={(item) => item.id}
    />
  ) : (
    <>
      <BottomSheetFlatList
        data={assets}
        key={selectedAlbum?.id}
        numColumns={3}
        style={{ flex: 1 }}
        keyExtractor={(item) => item.uri}
        centerContent={assets.length === 0}
        ListEmptyComponent={() => (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              minHeight: 330,
              gap: 10,
              backgroundColor: theme[3],
              borderRadius: 20,
            }}
          >
            <Emoji emoji="1F614" size={50} />
            <Text weight={900}>No images found here</Text>
          </View>
        )}
        onEndReached={loadMoreAlbums}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          this.onEndReachedCalledDuringMomentum = false;
        }}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <ImagePickerItem task={task} item={item} updateTask={updateTask} />
        )}
      />
    </>
  );
}
