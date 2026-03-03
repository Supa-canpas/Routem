"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Loader2 } from "lucide-react";
import CommentInput from "../ingredients/commentInput";
import CommentItem from "../ingredients/commentItem";
import { getDataFromServerWithJson, postDataToServerWithJson } from "@/lib/client/helpers";
import { Comment } from "@/lib/client/types";

type CommentSectionProps = {
  isMobile: boolean;
  routeId: string;
};

export default function CommentSection({ isMobile, routeId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getDataFromServerWithJson<Comment[]>(`/api/v1/comments?routeId=${routeId}`);
      if (data) {
        setComments(data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [routeId]);

  const handlePostComment = async (text: string) => {
    try {
      await postDataToServerWithJson("/api/v1/comments", {
        routeId,
        text,
      });
      // 再取得して一覧を更新
      await fetchComments();
    } catch (err: any) {
      alert(err.message || "Failed to post comment");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 w-full"
    >
      {/* コメントセクションのタイトル - モバイルではタブがあるため非表示 */}
      {!isMobile && (
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-4 h-4 text-accent-0" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground-1">
              Comments
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground-0">Discussion</h2>
        </div>
      )}

      {/* コメント投稿フォーム */}
      <CommentInput onPost={handlePostComment} />

      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-accent-0" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-sm text-center py-10">{error}</div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-foreground-1 text-sm text-center py-10 italic">No comments yet.</div>
        )}
      </div>

      {comments.length > 10 && (
        <button className="text-[10px] font-bold text-accent-0 uppercase tracking-[0.3em] hover:opacity-70 transition-opacity w-fit px-2 py-1">
          View all {comments.length} comments →
        </button>
      )}
    </motion.div>
  );
}
