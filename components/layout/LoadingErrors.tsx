import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Spinner from "@/ui/Spinner";
import { memo, React, useEffect } from "react";
import Toast from "react-native-toast-message";

const LoadingErrors = memo(() => {
  const { error } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const { error: storageError } = useStorageContext();

  useEffect(() => {
    if (!breakpoints.md && (error || storageError)) {
      Toast.show({
        type: "error",
        text1: "You're offline",
        text2: "Please check your connection",
      });
    } else {
      Toast.hide();
    }
  }, [error, storageError, breakpoints]);

  return (
    <>
      {(error || storageError) && (
        <Button
          variant="outlined"
          containerStyle={{ marginRight: -10, borderRadius: 10 }}
          icon={<Spinner size={18} />}
          height={45}
          text="You're offline"
          textProps={{ weight: 500 }}
        />
      )}
    </>
  );
});

export default LoadingErrors;
