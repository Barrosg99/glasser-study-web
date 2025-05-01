import { getDictionary } from "@/dictionaries";
import Header from "@/components/Header";
import PostsList from "@/components/PostsList";
import { Locale } from "../../../../i18n-config";

export default async function Posts(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <Header dictionary={dictionary.header} />
      <PostsList dictionary={dictionary.posts} />
    </>
  );
}
