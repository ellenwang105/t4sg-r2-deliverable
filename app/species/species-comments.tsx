"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Comment = Database["public"]["Tables"]["species_comments"]["Row"] & {
  author_profile: {
    id: string;
    display_name: string;
    email: string;
  } | null;
};

interface SpeciesCommentsProps {
  speciesId: number;
  userId: string;
}

export default function SpeciesComments({ speciesId, userId }: SpeciesCommentsProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createBrowserSupabaseClient();

  // Fetch comments when component mounts or speciesId changes
  useEffect(() => {
    void fetchComments();
  }, [speciesId]);

  const fetchComments = async () => {
    setIsLoading(true);
    // First, fetch comments
    const { data: commentsData, error: commentsError } = await supabase
      .from("species_comments")
      .select("*")
      .eq("species_id", speciesId)
      .order("created_at", { ascending: false }); // Newest first

    if (commentsError) {
      toast({
        title: "Error loading comments",
        description: commentsError.message,
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Then, fetch profile information for each comment author
    if (commentsData && commentsData.length > 0) {
      const authorIds = [...new Set(commentsData.map((c) => c.author))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", authorIds);

      if (profilesError) {
        toast({
          title: "Error loading user profiles",
          description: profilesError.message,
          variant: "destructive",
        });
      }

      // Combine comments with profile data
      const commentsWithProfiles = commentsData.map((comment) => ({
        ...comment,
        author_profile: profilesData?.find((p) => p.id === comment.author) || null,
      }));

      setComments(commentsWithProfiles);
    } else {
      setComments([]);
    }
    setIsLoading(false);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase.from("species_comments").insert({
      species_id: speciesId,
      author: userId,
      content: newComment.trim(),
    });

    if (error) {
      toast({
        title: "Error adding comment",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewComment("");
      // Refresh comments
      await fetchComments();
      // Refresh server components to update any cached data
      router.refresh();
      toast({
        title: "Comment added!",
      });
    }
    setIsSubmitting(false);
  };

  const handleDeleteComment = async (commentId: number) => {
    const { error } = await supabase.from("species_comments").delete().eq("id", commentId);

    if (error) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    } else {
      await fetchComments();
      router.refresh();
      toast({
        title: "Comment deleted",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Separator />
      <div>
        <h3 className="text-lg font-semibold">Comments</h3>
        <p className="text-sm text-muted-foreground">Share your thoughts about this species</p>
      </div>

      {/* Add comment form */}
      <div className="space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={3}
          className="resize-none"
        />
        <div className="flex justify-end">
          <Button onClick={() => void handleSubmitComment()} disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </div>
      </div>

      {/* Comments list */}
      <div className="space-y-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = comment.author === userId;
            return (
              <div key={comment.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{comment.author_profile?.display_name || "Unknown User"}</p>
                      <span className="text-xs text-muted-foreground">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void handleDeleteComment(comment.id)}
                      className="ml-2 text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
