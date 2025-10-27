import { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Send, Trash2, X } from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import toast from "react-hot-toast";

const GET_COMMENTS = gql`
  query GetComments($postId: String!) {
    getComments(postId: $postId) {
      id
      content
      author {
        id
        name
      }
      isAuthor
      createdAt
    }
  }
`;

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentDto!) {
    createComment(input: $input) {
      id
      content
      author {
        id
        name
      }
      createdAt
    }
  }
`;

const DELETE_COMMENT = gql`
  mutation DeleteComment($commentId: String!) {
    deleteComment(commentId: $commentId)
  }
`;

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  isAuthor: boolean;
  createdAt: Date;
}

interface PostCommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  dictionary: {
    title: string;
    placeholder: string;
    post: string;
    delete: string;
    noComments: string;
    errors: {
      post: string;
      fetch: string;
      delete: string;
    };
    loading: string;
  };
}

export default function PostCommentsModal({
  isOpen,
  onClose,
  postId,
  dictionary,
}: PostCommentsModalProps) {
  const [comment, setComment] = useState("");
  const [token] = useLocalStorage<string>("token");
  const {
    data: commentsData,
    loading,
    error,
    refetch,
  } = useQuery(GET_COMMENTS, {
    pollInterval: 1000,
    context: {
      headers: {
        Authorization: token,
      },
    },
    variables: { postId },
    skip: !isOpen,
  });

  const [createComment, { loading: creatingComment }] = useMutation(
    CREATE_COMMENT,
    {
      context: {
        headers: {
          Authorization: token,
        },
      },
      onCompleted: () => {
        setComment("");
        refetch();
      },
      onError: () => {
        toast.error(dictionary.errors.post);
      },
    }
  );

  const [deleteComment] = useMutation(DELETE_COMMENT, {
    context: {
      headers: {
        Authorization: token,
      },
    },
    onCompleted: () => {
      refetch();
    },
    onError: () => {
      toast.error(dictionary.errors.delete);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await createComment({
      variables: {
        input: {
          postId,
          content: comment.trim(),
        },
      },
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment({
      variables: {
        commentId,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{dictionary.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto mb-4">
          {loading ? (
            <div className="text-center text-gray-500">
              {dictionary.loading}
            </div>
          ) : error ? (
            <div className="text-center text-red-500">
              {dictionary.errors.fetch}
            </div>
          ) : commentsData?.getComments.length === 0 ? (
            <div className="text-center text-gray-500">
              {dictionary.noComments}
            </div>
          ) : (
            <div className="space-y-4">
              {commentsData?.getComments.map((comment: Comment) => (
                <div key={comment.id} className="bg-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium">{comment.author.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                      {comment.isAuthor && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title={dictionary.delete}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={dictionary.placeholder}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#990000]"
          />
          <button
            type="submit"
            disabled={!comment.trim() || creatingComment}
            className="bg-[#990000] text-white px-4 py-2 rounded-lg hover:bg-[#7a0000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            {dictionary.post}
          </button>
        </form>
      </div>
    </div>
  );
}
