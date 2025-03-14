import { useResponsiveBreakpoints } from "@/helpers/useResponsiveBreakpoints";
import { Button, ButtonText } from "@/ui/Button";
import Icon from "@/ui/Icon";
import IconButton from "@/ui/IconButton";
import { useColorTheme } from "@/ui/color/theme-provider";
import { router, useLocalSearchParams, usePathname } from "expo-router";
import { memo, useCallback } from "react";
import { useCollectionContext } from "../context";
import { styles } from "./styles";

export const CollectionShareMenu = memo(() => {
  const { id } = useLocalSearchParams();
  const breakpoints = useResponsiveBreakpoints();
  const theme = useColorTheme();
  const pathname = usePathname();
  const { data } = useCollectionContext();

  const handleOpen = useCallback(
    () => router.push(pathname + "/share"),
    [pathname]
  );

  return (
    <>
      {id !== "all" && (
        <>
          {breakpoints.md ? (
            <Button
              onPress={handleOpen}
              backgroundColors={{
                default: theme[5],
                hovered: theme[6],
                pressed: theme[7],
              }}
              height={43}
              containerStyle={{ borderRadius: 20 }}
              style={[
                styles.navbarIconButton,
                {
                  gap: 10,
                  marginLeft: breakpoints.md ? 5 : 0,
                  width: breakpoints.md ? 103 : 50,
                  paddingLeft: 0,
                },
              ]}
            >
              <Icon>{data?.public ? "group" : "ios_share"}</Icon>
              {breakpoints.md && <ButtonText weight={400}>Share</ButtonText>}
            </Button>
          ) : (
            <IconButton
              onPress={handleOpen}
              variant="text"
              size={40}
              icon="ios_share"
            />
          )}
        </>
      )}
    </>
  );
});
