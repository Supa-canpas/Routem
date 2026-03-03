"use client";

import { Comment } from "@/lib/client/types";

type CommentItemProps = {
  comment: Comment;
};

export default function CommentItem({ comment }: CommentItemProps) {
  const formattedDate = new Date(comment.createdAt).toLocaleDateString();

  return (
    <div className="p-6 bg-background-1 rounded-3xl w-full border border-foreground-0/10">
      <p className="text-lg text-foreground-0 leading-relaxed mb-4">"{comment.text}"</p>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent-0">@{comment.user?.name || "Anonymous"}</span>
        <span className="text-[10px] font-medium text-foreground-1/40 uppercase tracking-tighter">{formattedDate}</span>
      </div>
    </div>
  );
}
