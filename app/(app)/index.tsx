import Content from "@/components/layout/content";
import Spinner from "@/ui/Spinner";
import { LastStateRestore } from "./_layout";

export default function Page() {
  return (
    <Content
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Spinner />
      <LastStateRestore />
    </Content>
  );
}
