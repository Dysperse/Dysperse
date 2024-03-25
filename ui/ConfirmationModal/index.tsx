import { BottomSheetModal, useBottomSheet } from "@gorhom/bottom-sheet";
import { cloneElement, useCallback, useRef, useState } from "react";
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
  disabled?: boolean;
  skipLoading?: boolean;
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

function ConfirmationModalButton({ skipLoading, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const { forceClose } = useBottomSheet();

  const handleSuccess = async () => {
    try {
      setLoading(true);
      if (skipLoading) {
        onSuccess?.();
        return setTimeout(
          () => forceClose({ overshootClamping: true, damping: 1 }),
          100
        );
      }
      await onSuccess?.();
      setTimeout(() => forceClose({ overshootClamping: true, damping: 1 }), 0);
    } catch (e) {
      Toast.show({ type: "error" });
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
  const handleClose = useCallback(
    () => ref.current?.forceClose({ overshootClamping: false }),
    []
  );

  if (props.disabled) {
    const d = cloneElement(props.children, {
      onPress: () => {
        props.onSuccess?.();
        props.children.props?.onPress?.();
      },
    });
    return d;
  }

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
          skipLoading={props.skipLoading}
          onSuccess={props.onSuccess}
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
