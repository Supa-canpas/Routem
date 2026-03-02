import { ZodError } from "zod";

// instance of --error的なのに応じてレスポンスを角
export async function handleError(error: unknown): Promise<Response> {
    if (error instanceof ZodError) {
        return Response.json(
            {message: error.message, code: "ZOD_ERROR"},
            {status: 400}
        )
    }
    return Response.json(
        {message: "Internal Server Error", code: "INTERNAL_SERVER_ERROR"},
        {status: 500}
    )
    
}