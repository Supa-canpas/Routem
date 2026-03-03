import { Prisma } from "@prisma/client";

export type Route = Prisma.RouteGetPayload<{
    include: {
        author: { include: { icon: true } },
        thumbnail: true,
        likes: true,
        views: true,
        routeNodes: { include: { spot: true, transitSteps: true } },
        category: true,
    }
}>

export type User = Prisma.UserGetPayload<{
    include: {
        icon: true,
        background: true,
        uploadedImages: true,
        routes: true,
        likes: true,
    }
}>

export type Waypoint = {
    id?: string;
    type: 'waypoint';
    name: string;
    images?: string[]; // 経由地の画像URL（最大3枚）
    memo: string;  // 経由地に関するメモ (RouteNode.details)
    order: number; // 並び順
    lat?: number;
    lng?: number;
    source: 'MAPBOX' | 'USER'
    sourceId?: string;
};

export type Transportation = {
    id?: string;
    type: 'transportation';
    method: 'WALK' | 'TRAIN' | 'BUS' | 'CAR' | 'OTHER'; // 移動手段
    memo: string; // 移動に関するメモ（乗り換え情報など）
    order: number;
    duration?: number; // 移動時間（分）
    distance?: number; // 移動距離（km）
};

export type Comment = Prisma.CommentGetPayload<{
    include: {
        user: { select: { id: true, name: true, icon: true } },
        likes: true,
    }
}>

export interface ErrorScheme {
    message: string;
    code: string;
}

/**
 * ルートを構成する各要素（経由地または交通手段）の共通型
 */
export type RouteItem = Waypoint | Transportation;
