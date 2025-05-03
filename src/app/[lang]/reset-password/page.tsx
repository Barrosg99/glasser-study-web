import { Locale } from "../../../../i18n-config";
import { getDictionary } from "@/dictionaries";

import Header from "@/components/Header";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export default async function ResetPassword(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);
  return (
    <>
      <Header dictionary={dictionary["header"]} showButtons={false} />
      <ResetPasswordForm dictionary={dictionary["resetPassword"]} />
    </>
  );
}
