import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import Toast from "react-native-toast-message";
import { Button, ButtonText } from "../Button";
import { Menu } from "../Menu";
import Text from "../Text";

export interface ConfirmationModalProps {
  children: JSX.Element;
  height: number;
  title: string;
  secondary: string;
  onSuccess: () => void;
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 0,
    flex: 1,
    gap: 10,
  },
  title: {
    fontSize: 40,
    lineHeight: 47,
    textAlign: "center",
  },
  secondary: {
    fontSize: 20,
    paddingHorizontal: 20,
    textAlign: "center",
  },
  button: {
    height: 70,
  },
  buttonText: {
    fontSize: 20,
  },
});

function ConfirmationModalButton({ onSuccess, handleClose }) {
  const [loading, setLoading] = useState(false);
  const handleSuccess = async () => {
    try {
      setLoading(true);
      await onSuccess?.();
      handleClose();
    } catch (e) {
      Toast.show({
        type: "error",
        text1: "Something went wrong. Please try again later",
      });
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      isLoading={loading}
      style={[styles.button, { marginTop: "auto" }]}
      variant="filled"
      onPress={handleSuccess}
    >
      <ButtonText weight={900} style={styles.buttonText}>
        Continue
      </ButtonText>
    </Button>
  );
}

export default function ConfirmationModal(props: ConfirmationModalProps) {
  const ref = useRef<BottomSheetModal>(null);

  const handleClose = useCallback(() => ref.current.close(), []);

  return (
    <Menu height={[props.height]} trigger={props.children} menuRef={ref}>
      <View style={styles.container}>
        <Text style={styles.title} weight={500}>
          {props.title}
        </Text>
        <Text weight={300} style={styles.secondary}>
          {props.secondary}
        </Text>
        <ConfirmationModalButton
          onSuccess={props.onSuccess}
          handleClose={handleClose}
        />
        <Button style={styles.button} variant="outlined" onPress={handleClose}>
          <ButtonText weight={900} style={styles.buttonText}>
            Cancel
          </ButtonText>
        </Button>
      </View>
    </Menu>
  );
}
