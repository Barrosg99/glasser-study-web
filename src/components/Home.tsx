"use client";
import { getDictionary } from "@/dictionaries";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import { CheckCircle, Users, Heart, Search, FileText } from "lucide-react";
import Image from "next/image";

export default function Home({
  dictionary: { body, testimonials, features },
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["home"];
}) {
  const user = useCurrentUser();
  const router = useRouter();

  const handleClick = () => {
    if (!user) {
      router.push("/posts");
    } else {
      router.push("/login");
    }
  };

  const featureIcons = [
    <CheckCircle key="goal" className="w-12 h-12 text-[#990000]" />,
    <Users key="groups" className="w-12 h-12 text-[#990000]" />,
    <Users key="sessions" className="w-12 h-12 text-[#990000]" />,
    <Heart key="forum" className="w-12 h-12 text-[#990000]" />,
    <Search key="search" className="w-12 h-12 text-[#990000]" />,
    <FileText key="recommend" className="w-12 h-12 text-[#990000]" />,
  ];

  const featuresData = [
    features.feature1,
    features.feature2,
    features.feature3,
    features.feature4,
    // features.feature5,
    // features.feature6,
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <div className="max-w-2xl mb-16">
        <h2 className="text-3xl text-black mb-4 ">{body.title}</h2>
        <p className="text-gray-600 mb-8">{body.description}</p>
        {!user ? (
          <button
            onClick={handleClick}
            className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-red-600 transition-all duration-300"
          >
            {body.loggedButton}
          </button>
        ) : (
          <button
            onClick={handleClick}
            className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-red-600 transition-all duration-300"
          >
            {body.notLoggedButton}
          </button>
        )}
      </div>

      {/* Testimonials Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-black mb-8">
          {testimonials.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 mb-4">
              {testimonials.testimonial1.text}
            </p>
            <div className="flex items-center gap-3">
              <Image
                width={32}
                height={32}
                src="https://glasser-study-s3-bucket.s3.sa-east-1.amazonaws.com/68abcdba2b089d424e793724/avatar.png"
                alt="Avatar"
                className="rounded-full object-cover bg-gray-300"
              />
              <div>
                <p className="font-semibold text-black">
                  {testimonials.testimonial1.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {testimonials.testimonial1.description}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <p className="text-gray-600 mb-4">
              {testimonials.testimonial2.text}
            </p>
            <div className="flex items-center gap-3">
              <Image
                width={32}
                height={32}
                src="https://glasser-study-s3-bucket.s3.sa-east-1.amazonaws.com/68abcd822b089d424e793720/avatar.png"
                alt="Avatar"
                className="rounded-full object-cover bg-gray-300"
              />
              <div>
                <p className="font-semibold text-black">
                  {testimonials.testimonial2.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {testimonials.testimonial2.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-black mb-2">{features.title}</h2>
        <p className="text-gray-600 mb-8">{features.subtitle}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="mb-4">{featureIcons[index]}</div>
              <h3 className="text-xl font-bold text-black mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
