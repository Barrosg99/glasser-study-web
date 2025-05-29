import { getDictionary } from "@/dictionaries";
import { Locale } from "../../../i18n-config";

import Header from "../../components/Header";

export default async function Home(props: {
  params: Promise<{ lang: Locale }>;
}) {
  const { lang } = await props.params;

  const dictionary = await getDictionary(lang);
  const {
    home: { body },
  } = dictionary;

  return (
    <div className="min-h-screen bg-gray-100 pt-[74px]">
      <Header dictionary={dictionary["header"]} />
      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl text-black mb-4 ">{body.title}</h2>
          <p className="text-gray-600 mb-8">{body.description}</p>
          {/* <button className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-blue-600">
            {body.findGroup}
          </button> */}
        </div>
      </main>
    </div>
  );
}
