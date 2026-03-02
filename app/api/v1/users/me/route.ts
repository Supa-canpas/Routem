import {createServerClient} from "@supabase/ssr";
import {NextRequest, NextResponse} from "next/server";
import {getPrisma} from "@/lib/config/server";
import {createClient} from "@/lib/auth/supabase/server";
import {handleRequest} from "@/lib/server/handleRequest";
import {usersService} from "@/features/users/service";
import {validateParams} from "@/lib/server/validateParams";
import {UpdateUserSchema, UpdateUserType} from "@/features/users/schema";

export async function GET(req: NextRequest) {
    return handleRequest(async () => {
        //クライアント生成の過程でユーザー認証も行ってくれる
        const supabase = await createClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {

            throw new Error("Unauthorized");
        }
        //bodyを含ませる予定はないためとりあえずvalidateなし。いいねしたルートや作成したルート等は別APIからとってくるよてい
        //prismaからユーザー問い合わせ
        const prismaUser = await usersService.getUserById(user.id);

        return NextResponse.json({...prismaUser}, {status: 200})
    })
}



export async function PATCH(req: NextRequest) {
    return handleRequest(async () => {
        const supabase = await createClient(req);
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
            throw new Error("Unauthorized");
        }
        const body = await req.json();
        const parsed_body = await validateParams(UpdateUserSchema, body)

        const updatedUser = await usersService.updateUser(user.id, parsed_body)

        return NextResponse.json({...updatedUser}, {status: 200})

    })
}
