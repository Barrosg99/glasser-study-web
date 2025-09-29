import { getDictionary } from "@/dictionaries";
import Header from "@/components/Header";
import GoalsPage from "./components/GoalsPage";
import { Locale } from "../../../../i18n-config";

export default async function Goals(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <Header dictionary={dictionary.header} />
      <GoalsPage dictionary={dictionary.goals} />
    </>
  );
}
