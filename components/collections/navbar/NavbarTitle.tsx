import { useColorTheme } from "@/ui/color/theme-provider";
import Text from "@/ui/Text";

export const NavbarTitle = ({ name }) => {
  const theme = useColorTheme();
  return (
    <Text numberOfLines={1} style={{ color: theme[11] }} weight={900}>
      {name}
    </Text>
  );
};
