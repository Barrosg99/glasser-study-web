import { getDictionary } from "@/dictionaries";
import { Locale } from "../../../i18n-config";

import Header from "../../components/Header";
import Home from "../../components/Home";

export default async function HomePage(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <div className="min-h-screen bg-gray-100 pt-[74px]">
      <Header dictionary={dictionary["header"]} />
      <Home dictionary={dictionary["home"]} />
    </div>
  );
}
