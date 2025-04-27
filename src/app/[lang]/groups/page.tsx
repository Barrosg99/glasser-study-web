import { getDictionary } from "@/dictionaries";
import type { Locale } from "../../../../i18n-config";
import GroupsPage from "@/components/GroupsPage";
import Header from "@/components/Header";

export default async function Page(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);
  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <GroupsPage dictionary={dictionary["groups"]} />
    </>
  );
}
