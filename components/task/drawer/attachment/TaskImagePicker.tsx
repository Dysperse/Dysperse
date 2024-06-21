import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import { ListItemButton } from "@/ui/ListItemButton";
import ListItemText from "@/ui/ListItemText";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as MediaLibrary from "expo-media-library";
import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { ImagePickerItem } from "./ImagePickerItem";

export function TaskImagePicker({ task, updateTask }) {
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
      .catch((e) => alert("Error"));
  };

  return selectAlbums ? (
    <FlatList
      data={albums}
      renderItem={({ item }) => (
        <ListItemButton
          onPress={() => {
            setSelectedAlbum(item);
            setSelectAlbums(false);
          }}
        >
          <ListItemText
            primary={item.title}
            secondary={item.assetCount + " photos"}
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
        onEndReached={loadMoreAlbums}
        onEndReachedThreshold={0.5}
        onMomentumScrollBegin={() => {
          this.onEndReachedCalledDuringMomentum = false;
        }}
        ListHeaderComponent={
          <View style={{ padding: 5 }}>
            <Button
              variant="filled"
              style={{ marginTop: 10 }}
              onPress={() => setSelectAlbums(true)}
            >
              <ButtonText>{selectedAlbum?.title}</ButtonText>
              <Icon>expand_more</Icon>
            </Button>
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 20 }}
        renderItem={({ item }) => (
          <ImagePickerItem task={task} item={item} updateTask={updateTask} />
        )}
      />
    </>
  );
}
