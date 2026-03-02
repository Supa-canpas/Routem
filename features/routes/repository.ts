import { getPrisma } from "@/lib/config/server";
import { RouteVisibility } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const routesRepository = {
    findRoutes: async (args: Prisma.RouteFindManyArgs) => {
        const returned = await getPrisma().route.findMany(args);
        console.log(returned)
        return returned
    },
    createRoute: async (data: any) => {
        const prisma = getPrisma();
        const { title, description, category, visibility, userId, nodes, thumbnail } = data;

        return prisma.$transaction(async (tx) => {
            // 1) Route を作成
            const route = await tx.route.create({
                data: {
                    title,
                    description,
                    category: {
                        connectOrCreate: {
                            where: { name: category },
                            create: { name: category },
                        },
                    },
                    visibility: visibility as RouteVisibility,
                    author: {
                        connect: { id: userId },
                    },
                },
            });

            // サムネイル画像があれば作成
            if (thumbnail) {
                await tx.image.create({
                    data: {
                        url: thumbnail.url,
                        type: 'ROUTE_THUMBNAIL',
                        status: 'ADOPTED',
                        uploader: {
                            connect: { id: userId },
                        },
                        routeThumb: {
                            connect: { id: route.id },
                        },
                    },
                });
            }

            // 2) RouteNode とその TransitSteps, Spot, Images を作成
            for (const n of nodes) {
                // spotを更新、ない場合は作成
                await tx.spot.upsert({
                    where: {source_sourceId: { sourceId: n.spot.sourceId as string, source: 'MAPBOX'}},
                    update: {
                        name: n.spot.name,
                        latitude: n.spot.latitude,
                        longitude: n.spot.longitude,
                    },
                    create: {
                        ...n.spot,
                    },
                });

                // RouteNodeを作成
                const node = await tx.routeNode.create({
                    data: {
                        order: n.order,
                        route: {
                            connect: { id: route.id },
                        },
                        spot: {
                            connect: { id: n.spot.id },
                        },
                        details: n.details,
                        transitSteps: {
                            create: n.transitSteps,
                        },
                    },
                });

                // RouteNodeの画像があれば作成
                if (n.images && n.images.length > 0) {
                    for (const img of n.images) {
                        await tx.image.create({
                            data: {
                                url: img.url,
                                type: 'NODE_IMAGE',
                                status: 'ADOPTED',
                                uploader: {
                                    connect: { id: userId },
                                },
                                routeNode: {
                                    connect: { id: node.id },
                                },
                            },
                        });
                    }
                }
            }

            return { routeId: route.id };
        });
    },
    updateRoute: async (data: Prisma.RouteUpdateArgs) => {
        const prisma = getPrisma();
        return prisma.$transaction(async (tx) => {
            tx.route.update(data);
        })
    },
    deleteRoute: async (data:Prisma.RouteDeleteManyArgs)=>{
        const prisma = getPrisma();
        return prisma.route.deleteMany(data);
    }
}

export type FindRoutes = Awaited<ReturnType<typeof routesRepository.findRoutes>>;