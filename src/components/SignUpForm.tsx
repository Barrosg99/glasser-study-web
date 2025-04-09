"use client";

import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LocaleLink from "./LocaleLink";
import { getDictionary } from "@/dictionaries";
import Image from "next/image";

const SIGNUP_MUTATION = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $name: String!
    $goal: String!
  ) {
    signUp(email: $email, password: $password, name: $name, goal: $goal) {
      token
      user {
        id
        name
      }
    }
  }
`;

export default function SignUp({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["signUp"];
}) {
  const { body, footer } = dictionary;

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");

  const [signUp, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: () => {
      router.push("/login");
    },
    onError: (err) => {
      console.error(err);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    signUp({ variables: { email, password, name, goal } });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full bg-[#FFFFFF] p-15 pt-10 pb-2  md:w-1/2">
        <h1 className="text-black text-center text-4xl mb-6 md:text-left">
          {body.title}
        </h1>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="name"
            className="block mb-2 text-sm font-medium text-black"
          >
            {body.name.label}
          </label>
          <input
            type="text"
            id="name"
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5 md:w-2/3"
            placeholder={body.name.placeholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-black"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5 md:w-2/3"
            placeholder={body.email.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label
            htmlFor="goal"
            className="block mb-2 text-sm font-medium text-black"
          >
            {body.goal.label}
          </label>
          <input
            type="text"
            id="goal"
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5 md:w-2/3"
            placeholder={body.goal.placeholder}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />

          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-black"
          >
            {body.password.label}
          </label>
          <input
            type="password"
            id="password"
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5 md:w-2/3"
            placeholder={body.password.placeholder}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label
            htmlFor="confirmPassword"
            className="block mb-2 text-sm font-medium text-black"
          >
            {body.confirmPassword.label}
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-10 md:w-2/3"
            placeholder={body.confirmPassword.placeholder}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 md:w-2/5"
          >
            {loading ? body.submit.loading : body.submit.text}
          </button>
        </form>
        <div className="md:w-2/5">
          <h2 className="text-center mt-5 text-black ">{footer.title}</h2>
          <LocaleLink
            className="text-center text-black underline text-blue-500 block hover:text-blue-700"
            href="/login"
          >
            {footer.link}
          </LocaleLink>
        </div>
      </div>
      <div className="relative w-1/2 items-center justify-center hidden md:flex">
              <Image
                src="/images/sign-up.svg"
                alt="Logo"
                fill
                style={{ objectFit: "contain" }}
              />
            </div>
    </div>
  );
}
