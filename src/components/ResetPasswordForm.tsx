"use client";

import { getDictionary } from "@/dictionaries";
import { gql, useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import LocaleLink from "./LocaleLink";
import Image from "next/image";
import { toast } from "react-hot-toast";

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email)
  }
`;

export default function ResetPasswordForm({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["resetPassword"];
}) {
  const { body, footer } = dictionary;
  const router = useRouter();

  const [email, setEmail] = useState("");

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD_MUTATION, {
    onCompleted: () => {
      router.push("/login");
      toast.success(body.toast.success);
    },
    onError: () => {
      toast.error(body.toast.error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    resetPassword({
      variables: {
        email,
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full px-15 pt-5 md:w-1/2 bg-[#FFFFFF]">
        <h1 className="text-black text-center text-4xl mb-10  md:text-left">
          {body.title}
        </h1>
        <form onSubmit={handleSubmit}>
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
          src="/images/reset-password.svg"
          alt="Logo"
          fill
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
