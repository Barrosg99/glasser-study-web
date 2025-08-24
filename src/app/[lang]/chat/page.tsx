import { getDictionary } from "@/dictionaries";
import type { Locale } from "../../../../i18n-config";
import ChatsPage from "./components/ChatsPage";
import Header from "@/components/Header";

export default async function Page(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);
  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <ChatsPage dictionary={dictionary["chat"]} />
    </>
  );
}
