"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface CommentInputProps {
  onPost: (text: string) => Promise<void>;
}

export default function CommentInput({ onPost }: CommentInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePost = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onPost(text);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className={`p-[1px] rounded-3xl transition-all duration-300 ${
        isFocused ? "bg-linear-to-r from-accent-1 to-accent-0 shadow-sm" : "bg-foreground-0/10"
      }`}
    >
      <div className="flex flex-col gap-4 p-6 rounded-[23px] w-full bg-background-1">
        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-foreground-0 placeholder:text-foreground-1/40 resize-none min-h-[120px] text-lg leading-relaxed"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={submitting}
        />
        <div className="flex justify-end">
          <button 
            onClick={handlePost}
            disabled={submitting || !text.trim()}
            className="px-6 py-2 bg-accent-1 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:opacity-90 transition-all shadow-lg shadow-accent-1/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-3 h-3 animate-spin" />}
            {submitting ? "Posting..." : "Post Comment"}
          </button>
        </div>
      </div>
    </div>
  );
}
