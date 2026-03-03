import { z } from "zod";
import { WaypointSchema, TransportationSchema } from "../database_schema";
import { create } from "domain";

export const GetRoutesSchema = z.object({
    authorId: z.string().uuid().optional(),
    categoryId: z.number().optional(),
    createdAfter: z.string().datetime().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
});
export type GetRoutesType = z.infer<typeof GetRoutesSchema>;

export const PostRouteSchema = z.object({
    category: z.string().min(1, "Category is required"),
    description: z.string(),
    items: z.array(z.union([WaypointSchema, TransportationSchema])).min(1, "At least one route item is required"),
    thumbnailImageSrc: z.string().startsWith(process.env.MINIO_ENDPOINT || "", "Thumbnail image must be a valid URL"),
    title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]),
});
export type postRouteType = z.infer<typeof PostRouteSchema>;

export const PatchRouteSchema = z.object({
    id: z.string().uuid("Invalid route ID"),
    categoryId: z.number().optional(),
    description: z.string().optional(),
    items: z.array(z.union([WaypointSchema, TransportationSchema])).optional(),
    thumbnailImageSrc: z.string().startsWith(process.env.MINIO_ENDPOINT || "", "Thumbnail image must be a valid URL").optional(),
    title: z.string().min(1, "Title is required").max(100, "Title must be at most 100 characters").optional(),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).optional(),
})
export type PatchRouteType = z.infer<typeof PatchRouteSchema>;

export const DeleteRouteSchema = z.object({
    id:z.string().uuid("Invalid route ID"),
})

export type DeleteRouteType = z.infer<typeof DeleteRouteSchema>;