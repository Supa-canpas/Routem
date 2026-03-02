import { getPrisma } from "@/lib/config/server";
import { RouteVisibility } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const routesRepository = {
    findRoutes: async (args: Prisma.RouteFindManyArgs) => {
        const returned = await getPrisma().route.findMany(args);
        console.log(returned)
        return returned
    },
    createRoute: async (data:Prisma.RouteCreateArgs) => {
        const prisma = getPrisma();
        return prisma.$transaction(async (tx) => {
            return tx.route.create(data);
        });
    },
    updateRoute: async (data: Prisma.RouteUpdateArgs) => {
        const prisma = getPrisma();
        return prisma.$transaction(async (tx) => {
           return tx.route.update(data);
        })
    },
    deleteRoute: async (data:Prisma.RouteDeleteManyArgs)=>{
        const prisma = getPrisma();
        return prisma.route.deleteMany(data);
    }
}

export type FindRoutes = Awaited<ReturnType<typeof routesRepository.findRoutes>>;