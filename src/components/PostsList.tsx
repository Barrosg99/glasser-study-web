"use client";

import { Pencil, MessageCircle, ThumbsUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import PostModal from "./PostModal";
import { gql, useQuery } from "@apollo/client";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
  query GetPosts {
    posts {
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
      createdAt
      updatedAt
    }
  }
`;

export default function PostsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [token] = useLocalStorage<string>("token");

  const { data: postsData } = useQuery<{
    posts: Post[];
  }>(GET_POSTS, {
    // pollInterval: 1000,
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  return (
    <main className="min-h-screen bg-gray-50 pt-20 text-black">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-black text-2xl font-bold">Fórum Colaborativo</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#990000] text-white px-4 py-2 rounded-md hover:bg-[#B22222] transition duration-300"
          >
            Nova Publicação
          </button>
        </div>

        <PostModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPost(null);
          }}
          post={selectedPost}
        />

        <div className="space-y-6">
          {postsData?.posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-gray-600 text-sm">{post.subject}</h2>
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
