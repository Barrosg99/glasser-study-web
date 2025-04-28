import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/dictionaries";

import Header from "@/components/Header";
import ProfileForm from "@/components/ProfileForm";

export default async function Profile(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <ProfileForm dictionary={dictionary["profile"]} />
    </>
  );
}