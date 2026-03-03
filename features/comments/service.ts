import {commentsRepository} from "@/features/comments/repository";

export const commentsService = {
    getComments: async (userId?: string, take?: number, onlyMine?: boolean, without?: string[]) => {
        // ... (省略)
    },

    getCommentsByRouteId: async (routeId: string) => {
        return commentsRepository.getCommentsByRouteId(routeId);
    },

    createComment: async (userId: string, routeId: string, text: string) => {
        return commentsRepository.createComment(userId, routeId, text);
    },

    deleteComment: async (userId: string, commentId: string) => {
        const comment = await commentsRepository.findById(commentId);
        if (!comment) {
            throw new Error("Comment not found");
        }

        if (comment.userId !== userId) {
            throw new Error("Unauthorized");
        }

        return commentsRepository.deleteComment(commentId);
    },
};
