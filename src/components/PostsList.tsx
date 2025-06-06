"use client";

import {
  Pencil,
  MessageCircle,
  ThumbsUp,
  ExternalLink,
  Search,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PostModal from "./PostModal";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getDictionary } from "@/dictionaries";

export interface Post {
  id: string;
  title: string;
  subject: string;
  description: string;
  tags: string[];
  materials:
    | {
        name: string;
        link: string;
        type: string;
        _typename: string;
      }[]
    | null;
  author: {
    id: string;
  };
  isAuthor: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const GET_POSTS = gql`
  query GetPosts($searchTerm: String, $searchFilter: String, $subject: String) {
    posts(
      searchTerm: $searchTerm
      searchFilter: $searchFilter
      subject: $subject
    ) {
      id
      title
      subject
      description
      tags
      materials {
        name
        link
        type
      }
      author {
        id
      }
      isAuthor
      likesCount
      createdAt
      updatedAt
    }
  }
`;

const TOGGLE_LIKE = gql`
  mutation ToggleLike($input: CreateLikeDto!) {
    toggleLike(input: $input) {
      id
    }
  }
`;

export default function PostsList({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["posts"];
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [token] = useLocalStorage<string>("token");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const subjectDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSubjectDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: postsData } = useQuery<{
    posts: Post[];
  }>(GET_POSTS, {
    pollInterval: 1000,
    variables: {
      searchTerm: searchTerm || undefined,
      searchFilter: searchFilter === "tudo" ? undefined : searchFilter,
      subject: selectedSubject || undefined,
    },
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const [toggleLike] = useMutation(TOGGLE_LIKE, {
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 pt-20 text-black pt-[74px]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6">
          <div className="flex w-1/2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={dictionary.list.search.placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="h-full px-4 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <div className="flex items-center gap-2">
                  <span className="capitalize">
                    {
                      dictionary.list.search.filter[
                        searchFilter as keyof typeof dictionary.list.search.filter
                      ]
                    }
                  </span>
                  <ChevronDown size={16} />
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                  <div className="py-1">
                    {["all", "title", "description", "tags"].map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setSearchFilter(option);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          searchFilter === option ? "bg-gray-50" : ""
                        }`}
                      >
                        {
                          dictionary.list.search.filter[
                            option as keyof typeof dictionary.list.search.filter
                          ]
                        }
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="relative" ref={subjectDropdownRef}>
            <button
              onClick={() => setIsSubjectDropdownOpen(!isSubjectDropdownOpen)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-2"
            >
              <span>
                {selectedSubject
                  ? dictionary.modal.subject.options[
                      selectedSubject as keyof typeof dictionary.modal.subject.options
                    ]
                  : dictionary.list.search.subjects}
              </span>
              <ChevronDown size={16} />
            </button>
            {isSubjectDropdownOpen && (
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedSubject(null);
                      setIsSubjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-200 ${
                      !selectedSubject ? "bg-gray-200" : ""
                    }`}
                  >
                    {dictionary.list.search.allSubjects}
                  </button>
                  {Object.entries(dictionary.modal.subject.options).map(
                    ([key, value]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setSelectedSubject(key);
                          setIsSubjectDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-200 ${
                          selectedSubject === key ? "bg-gray-200" : ""
                        }`}
                      >
                        {value}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-black text-2xl font-bold">
            {dictionary.list.title}
          </h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#990000] text-white px-4 py-2 rounded-md hover:bg-[#B22222] transition duration-300"
          >
            {dictionary.list.newPost}
          </button>
        </div>

        <PostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
          dictionary={dictionary.modal}
        />

        <div className="space-y-6">
          {postsData?.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-gray-600 text-sm">
                    {
                      dictionary.modal.subject.options[
                        post.subject as keyof typeof dictionary.modal.subject.options
                      ]
                    }
                  </h2>
                  <div className="flex text-xl items-center gap-3">
                    <h3 className="font-semibold mt-1 mr-5">{post.title}</h3>
                    {post.materials?.map((material) => (
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href={material.link}
                        key={material.link}
                        className="font-semibold underline flex items-center gap-1 hover:text-gray-600"
                      >
                        {material.name}
                        <span>
                          <ExternalLink size={16} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
                {post.isAuthor && (
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => {
                      setSelectedPost(post);
                      setIsModalOpen(true);
                    }}
                  >
                    <Pencil size={20} />
                  </button>
                )}
              </div>

              <p className="text-gray-600 mb-4">{post.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* aki */}
              <div className="flex items-center gap-4 text-gray-500">
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <ThumbsUp size={18} />
                  <span>0</span>
                </button>
                <button className="flex items-center gap-1 hover:text-gray-700">
                  <MessageCircle size={18} />
                  <span>0</span>
                </button>
                <span className="text-sm">
                  {new Date(post.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
