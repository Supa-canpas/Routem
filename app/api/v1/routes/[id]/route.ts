import { NextRequest } from "next/server";
import { handleRequest } from "@/lib/server/handleRequest";
import { createClient } from "@/lib/auth/supabase/server";
import { validateParams } from "@/lib/server/validateParams";
import { DeleteRouteSchema, DeleteRouteType } from "@/features/routes/schema";
import { routesService } from "@/features/routes/service";
import { NextResponse } from "next/server";


export async function DELETE(req:NextRequest, { params }: { params: Promise<{ id: string }> }){
  return await handleRequest(async ()=> { 
  const supabase = await createClient(req);
    const {data:{user}, error} = await supabase.auth.getUser();
    if(!user || error){
        throw new Error("unauthorized")
    }
  const parsed_params = await validateParams(DeleteRouteSchema, await params);
  const result = await routesService.deleteRoute(parsed_params, user.id);
  return NextResponse.json(null, { status: 204 });
  });
}
