"use client";
import { Users, Plus, X } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { useState } from "react";

export default function GroupsPage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["groups"];
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Modal de criação de grupo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nome do Grupo<span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2 text-black bg-gray-50"
                  placeholder="Ex.: Matemática, Biologia"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Descrição<span className="text-red-600">*</span>
                </label>
                <textarea
                  className="w-full border rounded px-3 py-2 text-black bg-gray-50"
                  placeholder="Descreva o que é o material de forma clara e objetiva."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Membros
                </label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2 text-black bg-gray-50"
                  placeholder="E-mail dos membros a convidar"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition"
                >
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <aside className="w-80 border-r">
        <div className="mb-4 flex items-center gap-2 px-4 pt-4">
          <input
            type="text"
            placeholder={dictionary.search.placeholder}
            className="w-full bg-white px-4 py-2 rounded-full border border-gray-100 text-black focus:outline-none placeholder:text-gray-400"
          />
          <button
            className="bg-[#990000] text-white px-4 py-2 rounded-full hover:bg-[#B22222] transition"
            type="button"
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="">
          {[1, 2, 3, 4].length === 0 ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              Você não tem grupos ainda, tente criar um...
            </li>
          ) : (
            [1, 2, 3, 4].map((i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-white border border-gray-200 p-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200"
              >
                <Users size={32} className="text-gray-500 mt-1" />
                <div>
                  <div className="font-medium text-gray-400">Nome do grupo</div>
                  <div className="text-sm text-gray-700">
                    Breve descrição do grupo
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </aside>
      {/* Main content */}
      <main className="flex-1 bg-gray-300 m-4 rounded"></main>
    </div>
  );
}
