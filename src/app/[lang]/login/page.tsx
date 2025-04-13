import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/dictionaries";

import Header from "@/components/Header";
import LoginForm from "@/components/LoginForm";

export default async function Login(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);
  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <LoginForm dictionary={dictionary["login"]} />
    </>
  );
}
