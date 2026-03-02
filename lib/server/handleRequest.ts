// まず、リクエストハンドラーが関数をtryしてcatchでエラーをキャッチする
import { handleError } from "./handleError";

export async function handleRequest(fn: () => Promise<Response>){
    try {
        return await fn();
    }catch (error) {
        console.error(error);
        return handleError(error);
    }
}