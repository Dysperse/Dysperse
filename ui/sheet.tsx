import Text from "@/ui/Text";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { Button, StyleSheet, View } from "react-native";

const App = () => {
  // ref
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // variables
  const snapPoints = useMemo(() => ["25%", "90%"], []);

  // callbacks
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  // renders
  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Button
          onPress={handlePresentModalPress}
          title="Present Modal"
          color="black"
        />
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        >
          <View style={styles.contentContainer}>
            <Text>Awesome 🎉</Text>
          </View>
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "red",
  },
});

export default App;
