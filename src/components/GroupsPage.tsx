"use client";
import { Users, Plus, X } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-hot-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Group {
  id: string;
  name: string;
  description: string;
  members: {
    id: string;
    name: string;
    email: string;
  }[];
  isModerator: boolean;
}

const GET_GROUPS = gql`
  query GetGroups {
    myGroups {
      id
      name
      description
      members {
        id
        name
        email
      }
      isModerator
    }
  }
`;

const SAVE_GROUP_MUTATION = gql`
  mutation SaveGroup($saveGroupData: CreateGroupDto!, $id: String) {
    saveGroup(saveGroupData: $saveGroupData, id: $id) {
      id
    }
  }
`;

const DELETE_GROUP_MUTATION = gql`
  mutation RemoveGroup($id: String!) {
    removeGroup(id: $id) {
      id
    }
  }
`;

export default function GroupsPage({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["groups"];
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [token] = useLocalStorage<string>("token");

  const { data: groupsData, loading: loadingGroups } = useQuery<{
    myGroups: Group[];
  }>(GET_GROUPS, {
    context: {
      headers: {
        Authorization: token,
      },
    },
  });

  const [saveGroup, { loading }] = useMutation(SAVE_GROUP_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(
        selectedGroup
          ? dictionary.toast.updateSuccess
          : dictionary.toast.createSuccess
      );
      setShowModal(false);
      resetForm();
    },
    onError: () => {
      toast.error(
        selectedGroup
          ? dictionary.toast.updateError
          : dictionary.toast.createError
      );
    },
    refetchQueries: [
      {
        query: GET_GROUPS,
        context: {
          headers: {
            Authorization: token,
          },
        },
      },
    ],
  });

  const [deleteGroup] = useMutation(DELETE_GROUP_MUTATION, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      toast.success(dictionary.toast.deleteSuccess);
      setShowModal(false);
    },
    onError: () => {
      toast.error(dictionary.toast.deleteError);
    },
    refetchQueries: [
      {
        query: GET_GROUPS,
        context: {
          headers: {
            Authorization: token,
          },
        },
      },
    ],
  });

  const handleDeleteGroup = async (groupId: string) => {
    if (isDeleting) return;

    setIsDeleting(true);
    setTimeout(() => setIsDeleting(false), 2000);
    toast(
      (t) => (
        <span className="flex gap-4">
          <span>{dictionary.toast.deleteConfirm}</span>
          <button
            onClick={() => {
              deleteGroup({
                variables: {
                  id: groupId,
                },
              });
              toast.dismiss(t.id);
              setShowModal(false);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            {dictionary.toast.deleteConfirmYes}
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="text-red-500 hover:text-red-700"
          >
            {dictionary.toast.deleteConfirmNo}
          </button>
        </span>
      ),
      {
        position: "bottom-center",
        duration: 2000,
      }
    );
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setMembers("");
    setSelectedGroup(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    saveGroup({
      variables: {
        saveGroupData: {
          name,
          description,
          memberEmails: members
            .split(",")
            .map((email) => email.trim())
            .filter(Boolean),
        },
        id: selectedGroup?.id,
      },
    });
  };

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setSelectedGroup(group);
      setName(group.name);
      setDescription(group.description);
      setMembers(group.members.map((member) => member.email).join(","));
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Modal de criação/edição de grupo */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              aria-label="Fechar"
            >
              <X size={24} />
            </button>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.name.label}
                  <span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.name.placeholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.description.label}
                  <span className="text-red-600"> *</span>
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.description.placeholder}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {dictionary.create.members.label}
                </label>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={dictionary.create.members.placeholder}
                  value={members}
                  onChange={(e) => setMembers(e.target.value)}
                  disabled={selectedGroup?.isModerator === false}
                />
              </div>
              <div className="flex justify-end gap-4">
                {selectedGroup?.isModerator && (
                  <button
                    type="button"
                    onClick={() => handleDeleteGroup(selectedGroup.id)}
                    className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
                  >
                    {dictionary.create.delete}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading || selectedGroup?.isModerator === false}
                  className="bg-[#990000] text-white px-6 py-2 rounded hover:bg-[#B22222] transition disabled:bg-gray-400"
                >
                  {loading
                    ? selectedGroup
                      ? dictionary.create.submit.updating
                      : dictionary.create.submit.creating
                    : selectedGroup
                    ? dictionary.create.submit.update
                    : dictionary.create.submit.create}
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
            onClick={() => handleOpenModal()}
          >
            <Plus size={20} />
          </button>
        </div>
        <ul className="">
          {loadingGroups ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.loading}
            </li>
          ) : groupsData?.myGroups?.length === 0 ? (
            <li className="flex items-center justify-center p-4 text-gray-500">
              {dictionary.list.empty}
            </li>
          ) : (
            groupsData?.myGroups?.map((group) => (
              <li
                key={group.id}
                className="flex items-start gap-3 bg-white border border-gray-200 p-2 hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                onClick={() => handleOpenModal(group)}
              >
                <Users size={32} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="font-medium text-gray-400">{group.name}</div>
                  <div className="text-sm text-gray-700">
                    {group.description}
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
