import { getDictionary } from "@/dictionaries";
import Header from "@/components/Header";
import PostsList from "@/components/PostsList";
import { Locale } from "../../../../i18n-config";

interface Post {
  id: string;
  subject: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

// This is temporary mock data - should be replaced with real API calls
const mockPosts: Post[] = [
  {
    id: "1",
    subject: "Nome da Disciplina",
    title: "Título da Dúvida",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    date: "14 Feb 2024",
    tags: ["Discussão", "Pergunta", "Dúvida"],
  },
  // Add more mock posts as needed
];

export default async function Posts(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);

  return (
    <>
      <Header dictionary={dictionary.header} />
      <PostsList posts={mockPosts} />
    </>
  );
}
