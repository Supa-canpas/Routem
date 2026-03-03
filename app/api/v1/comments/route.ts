import {NextRequest, NextResponse} from "next/server";
import {handleRequest} from "@/lib/server/handleRequest";
import {createClient} from "@/lib/auth/supabase/server";
import {validateParams} from "@/lib/server/validateParams";
import {CreateCommentSchema, DeleteCommentSchema, GetCommentsSchema} from "@/features/comments/schema";
import {commentsService} from "@/features/comments/service";

export async function GET(req: NextRequest) {
    return handleRequest(async () => {
        const supabase = await createClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();

        const searchParams = req.nextUrl.searchParams;
        const routeId = searchParams.get('routeId');

        if (!routeId) {
            throw new Error("routeId is required");
        }

        const comments = await commentsService.getCommentsByRouteId(routeId);

        return NextResponse.json(comments, {status: 200})
    })
}

export function POST(req: NextRequest) {
    return handleRequest(async () => {
        const supabase = await createClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            throw new Error("Unauthorized");
        }

        const body = await req.json();
        const parsed_body = await validateParams(CreateCommentSchema, body);

        const comment = await commentsService.createComment(
            user.id,
            parsed_body.routeId,
            parsed_body.text
        );

        return NextResponse.json(comment, {status: 201});
    })
}

export function DELETE(req: NextRequest) {
    return handleRequest(async () => {
        const supabase = await createClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            throw new Error("Unauthorized");
        }

        const body = await req.json();
        const parsed_body = await validateParams(DeleteCommentSchema, body);

        const comment = await commentsService.deleteComment(user.id, parsed_body.id);

        return NextResponse.json(comment , {status: 200});
    })
}