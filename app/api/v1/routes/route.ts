import { NextRequest, NextResponse } from "next/server";
import { Prisma, TransitMode, ImageType, ImageStatus, RouteVisibility } from "@prisma/client";
import { handleRequest } from "@/lib/server/handleRequest";
import { routesService } from "@/features/routes/service";
import { validateParams } from "@/lib/server/validateParams";
import { GetRoutesSchema } from "@/features/routes/schema";
import { createClient } from "@/lib/auth/supabase/server";
import { PostRouteSchema } from "@/features/routes/schema";
import { PatchRouteSchema } from "@/features/routes/schema";

// GET /api/v1/routems
// 最近作成されたルートを一覧返却します
export async function GET(req: NextRequest) {
  return await handleRequest(async () => {
    const supabase = await createClient(req);
    const { data: { user }, error } = await supabase.auth.getUser();
    const safe_user = error ? null : user;
    const search_params = Object.fromEntries(new URL(req.url).searchParams);
    const parsed_params = await validateParams(GetRoutesSchema, search_params);
    const data = await routesService.getRoutes(safe_user, parsed_params);
    return NextResponse.json(data, {status: 200});
  });
}


// POST /api/v1/routems
// ルート作成用のAPI。

export async function POST(req: NextRequest) {
  return await handleRequest(async () => {
    const supabase = await createClient(req);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      throw new Error("Unauthorized");
    }
    const body = await req.json();
    if (!body || !Array.isArray(body.items)) {
      throw new Error("Invalid body: items[] is required");
    }
    const parsed_body = await validateParams(PostRouteSchema, body);
    const result = await routesService.postRoute(parsed_body, user);
    return NextResponse.json(result, { status: 201 });
  });
}



export async function PATCH(req: NextRequest) {
  return await handleRequest(async () => {
    const supabase = await createClient(req);
    const {data:{user}, error} = await supabase.auth.getUser();
    if(!user || error){
        throw new Error("unauthorized")
    }
    const body = await req.json();
    if (!body || !Array.isArray(body.items)) {
      throw new Error("Invalid body: items[] is required");
    }
    const parsed_body = await validateParams(PatchRouteSchema, body);
    const result = await routesService.patchRoute(parsed_body);
    return NextResponse.json(result, { status: 200 });
  });
}



//stringからTransitModeへのキャスト関数
function mapMethodToTransitMode(method: string): TransitMode {
  switch (method.toUpperCase()) {
    case "WALK":
      return TransitMode.WALK;
    case "TRAIN":
      return TransitMode.TRAIN;
    case "BUS":
      return TransitMode.BUS;
    case "CAR":
      return TransitMode.CAR;
    case "BIKE":
      return TransitMode.BIKE;
    case "FLIGHT":
      return TransitMode.FLIGHT;
    case "SHIP":
      return TransitMode.SHIP;
    case "OTHER":
      return TransitMode.OTHER;
    default:
      return TransitMode.WALK;
  }
}
