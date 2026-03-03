import {getPrisma} from "@/lib/config/server";

export const commentsRepository = {
    getMyComments: async (userId: string, take?: number, without?: string[]) => {
        const prisma = getPrisma();
        const orderBy = [
            {likes: {_count: "desc"}} as const,
            {createdAt: "desc"} as const,
        ];

        return prisma.comment.findMany({
            take,
            where: {
                userId,
                id: without ? {notIn: without} : undefined,
            },
            orderBy,
        });
    },

    getComments: async (take?: number, without?: string[]) => {
        const prisma = getPrisma();
        const orderBy = [
            {likes: {_count: "desc"}} as const,
            {createdAt: "desc"} as const,
        ];

        return prisma.comment.findMany({
            take,
            where: {
                id: without ? {notIn: without} : undefined,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                }
            },
            orderBy,
        });
    },

    getCommentsByRouteId: async (routeId: string) => {
        const prisma = getPrisma();
        return prisma.comment.findMany({
            where: {
                routeId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                    }
                },
                likes: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    },

    createComment: async (userId: string, routeId: string, text: string) => {
        const prisma = getPrisma();
        return prisma.comment.create({
            data: {
                userId,
                routeId,
                text,
            },
        });
    },

    deleteComment: async (id: string) => {
        const prisma = getPrisma();
        return prisma.comment.delete({
            where: {id},
        });
    },

    findById: async (id: string) => {
        const prisma = getPrisma();
        return prisma.comment.findUnique({
            where: {id},
        });
    },
};
