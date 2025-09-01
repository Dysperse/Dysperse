import { useStorageContext } from "@/context/storageContext";
import { useUser } from "@/context/useUser";
import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button } from "@/ui/Button";
import Spinner from "@/ui/Spinner";
import { memo, useEffect } from "react";
import { toast } from "sonner-native";

const LoadingErrors = memo(() => {
  const { error } = useUser();
  const breakpoints = useResponsiveBreakpoints();
  const { error: storageError } = useStorageContext();

  useEffect(() => {
    if (!breakpoints.md && (error || storageError)) {
      toast.info("You're offline", {
        description: "Please check your connection",
      });
    } else {
      toast.dismiss();
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

