"use client";

import { Pencil, MessageCircle, ThumbsUp } from "lucide-react";
import { useState } from "react";
import PostModal from "./PostModal";

interface Post {
  id: string;
  subject: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
}

interface PostsListProps {
  posts: Post[];
}

export default function PostsList({ posts }: PostsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (data: {
    subject: string;
    title: string;
    description: string;
    tags: string[];
  }) => {
    // Here you would typically handle the new post creation
    console.log(data);
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
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
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />

        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-gray-600 text-sm">{post.subject}</h2>
                  <h3 className="text-xl font-semibold mt-1">{post.title}</h3>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Pencil size={20} />
                </button>
              </div>

              <p className="text-gray-600 mb-4">{post.content}</p>

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
                <span className="text-sm">{post.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
