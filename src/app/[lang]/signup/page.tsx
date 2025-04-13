import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/dictionaries";

import Header from "@/components/Header";
import SignUpForm from "@/components/SignUpForm";

export default async function SignUp(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <SignUpForm dictionary={dictionary["signUp"]} />
    </>
  );
}
