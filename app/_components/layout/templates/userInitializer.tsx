"use client"

import { useEffect } from "react"
import {userStore} from "@/lib/client/stores/userStore";
import {getDataFromServerWithJson} from "@/lib/client/helpers";
import {User} from "@/lib/client/types";

export default function UserInitializer() {

    const login = userStore(state => state.login)

    useEffect(() => {
        login()
    }, [login])

    return null
}
