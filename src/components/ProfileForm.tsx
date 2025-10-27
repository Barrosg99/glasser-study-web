"use client";

import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { getDictionary } from "@/dictionaries";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

const GET_USER = gql`
  query GetUser {
    me {
      id
      name
      email
      goal
      profileImageUrl
    }
  }
`;

const GET_PRESIGNED_URL = gql`
  query GetPresignedUrl($type: String!) {
    getPresignedUrl(type: $type) {
      uploadUrl
      publicUrl
    }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateMe($userData: UpdateUserDto!) {
    updateMe(userData: $userData) {
      id
      name
      email
      goal
      profileImageUrl
    }
  }
`;

export default function ProfileForm({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["profile"];
}) {
  const { body } = dictionary;
  const router = useRouter();
  const [token] = useLocalStorage<string>("token");

  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>();
  const goalsValues = ["LEARN", "TEACH", "GROUP_STUDY"];

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  });

  const { data, loading: loadingUser } = useQuery(GET_USER, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onError: () => {
      toast.error(body.toast.error);
    },
  });

  const [getPresignedUrl] = useLazyQuery(GET_PRESIGNED_URL, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onError: () => {
      toast.error(body.toast.error);
    },
  });

  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(body.toast.success);
      setPassword("");
      setConfirmPassword("");
    },
    update: (cache, { data: mutationData }) => {
      const existingData = cache.readQuery({ query: GET_USER });
      if (existingData) {
        cache.writeQuery({
          query: GET_USER,
          data: {
            me: {
              ...mutationData.updateMe,
            },
          },
        });
      }
    },
    onError: () => {
      toast.error(body.toast.error);
    },
  });

  useEffect(() => {
    if (data?.me) {
      setName(data.me.name);
      setGoal(data.me.goal);

      if (data.me.profileImageUrl) {
        const bustableUrl = `${
          data.me.profileImageUrl
        }?v=${new Date().getTime()}`;
        setCurrentImageUrl(bustableUrl);
      }
    }
  }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast.error(body.toast.diffPassword);
      return;
    }

    if (password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/;
      if (!passwordRegex.test(password)) {
        toast.error(body.toast.passwordError);
        return;
      }
    }

    let publicUrl = null;

    if (selectedImage) {
      const {
        data: {
          getPresignedUrl: { uploadUrl, publicUrl: publicUrlResponse },
        },
      } = await getPresignedUrl({
        variables: {
          type: selectedImage.type,
        },
      });

      publicUrl = publicUrlResponse;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": selectedImage.type,
        },
        body: selectedImage,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        toast.error(errorText);
      }

      setCurrentImageUrl(publicUrl);
    }

    updateUser({
      variables: {
        userData: {
          name,
          goal,
          ...(password && { password }),
          ...(selectedImage && { profileImageUrl: publicUrl }),
        },
      },
    });
  };

  if (loadingUser) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <div className="w-full bg-[#FFFFFF] p-15 pt-10 pb-2 md:w-1/2">
          <h1 className="text-black text-center text-4xl mb-6 md:text-left">
            {body.title}
          </h1>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 pt-[74px]">
      <div className="w-full bg-[#FFFFFF] p-15 pt-10 pb-2">
        <h1 className="text-black text-center text-4xl mb-6 md:text-left">
          {body.title}
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 space-between md:flex-nowrap flex-wrap">
            <div className="w-1/2">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-black"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-100 border border-gray-300 text-gray-500 text-sm rounded-lg block w-full p-2.5 mb-5 md:w-2/3"
                value={data?.me?.email || ""}
                disabled
              />

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
                onChange={(e) => {
                  const value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
                  setName(value);
                }}
                required
              />

              <label
                htmlFor="goal"
                className="block mb-2 text-sm font-medium text-black"
              >
                {body.goal.label}
              </label>
              <select
                id="goal"
                className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-5 md:w-2/3"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                required
              >
                <option value="">{body.goal.placeholder}</option>
                {body.goal.options.map((option, index) => {
                  return (
                    <option key={index} value={goalsValues[index]}>
                      {option}
                    </option>
                  );
                })}
              </select>

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
              />
            </div>
            <div className="w-1/2 flex flex-col items-center">
              <input
                type="file"
                id="profileImage"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    setSelectedImage(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
              />

              <div
                className="relative group cursor-pointer w-100 h-100 rounded-full border-2 border-gray-300"
                onClick={() => document.getElementById("profileImage")?.click()}
              >
                {imagePreview ? (
                  <Image
                    sizes="100%"
                    src={imagePreview}
                    fill
                    alt="Profile Preview"
                    className="w-100 h-100 object-cover rounded-full border-2 border-gray-300"
                  />
                ) : currentImageUrl ? (
                  <Image
                    sizes="100%"
                    src={currentImageUrl}
                    fill
                    alt="Current Profile"
                    className="w-100 h-100 object-cover rounded-full border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-100 h-100 flex items-center justify-center bg-gray-200 rounded-full">
                    <span className="text-gray-400 text-sm">
                      {body.profileImage.placeholder ?? "No image"}
                    </span>
                  </div>
                )}

                {/* Overlay que aparece ao passar o mouse */}
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-70 transition-opacity duration-200">
                  <span className="text-white text-sm font-medium">
                    {body.profileImage.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 md:w-2/5"
          >
            {updating ? body.submit.loading : body.submit.text}
          </button>
        </form>
      </div>
    </div>
  );
}
