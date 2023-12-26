import { Sidebar } from "@/components/layout/sidebar";
import NavigationBar from "@/ui/NavigationBar";
import { useColorTheme } from "@/ui/color/theme-provider";

export default function Page() {
  const theme = useColorTheme();

  return (
    <>
      <NavigationBar color={theme[2]} />
      <Sidebar />
    </>
  );
}
