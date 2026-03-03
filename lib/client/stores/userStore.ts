import {create} from 'zustand'
import {ErrorScheme, User} from "@/lib/client/types"
import {getDataFromServerWithJson, patchDataToServerWithJson, toErrorScheme} from "@/lib/client/helpers";

const initialUser: User = {
    id: '',
    name: '',
    bio: '',
    age: 20,
    gender: 'NON_BINARY' as any,
    icon: {
        id: 'initial_user',
        url: '/images/next.svg',
        key: null,
        status: 'ADOPTED',
        type: 'USER_ICON',
        createdAt: new Date(),
        updatedAt: new Date(),
        uploaderId: '',
        userIconId: '',
        userBackgroundId: null,
        routeNodeId: null,
        routeThumbId: null,
    },
    background: {
        id: 'initial_user',
        url: '/images/next.svg',
        key: null,
        status: 'ADOPTED',
        type: 'USER_ICON',
        createdAt: new Date(),
        updatedAt: new Date(),
        uploaderId: '',
        userIconId: null,
        userBackgroundId: '',
        routeNodeId: null,
        routeThumbId: null,
    },
    uploadedImages: [],
    routes: [],
    likes: []
}

type StoreConfig = {
    user: User
    //ユーザー情報の取得、及びその値のセットはzustandに一任し、副作用として引数に指定した関数を発火する。
    //zustand内部の情報の操作を担当する関数では、一貫して三つの関数onStart、onSuccess、onFailureを用意する。
    //onStartにはfetch等での戻り値を、onFailureにはerrorをErrorSchemeにキャストしたものを引数としてoptionalで渡す。
    login: (onStart?: () => void, onSuccess?: (user?: User) => void, onFailure?: (error?: ErrorScheme) => void) => void,
    edit: (profile: {name?: string, bio?:string, background?: string, icon?: string}, onStart?: () => void, onSuccess?: (user?: User) => void, onFailure?: (error?: ErrorScheme) => void) => void
}

export const userStore = create<StoreConfig>((set) => (
    {
        user: initialUser,
        login: async (onStart, onSuccess, onFailure) => {
            onStart && onStart()

            try {
                const user = await getDataFromServerWithJson<User>('/api/v1/users/me')

                if(user && 'id' in user) {
                    set({user})
                    onSuccess && onSuccess(user)
                }
            }catch(e) {
                //エラーハンドリング処理を書く
                onFailure && onFailure(toErrorScheme(e))
            }
        },
        edit: async (profile, onStart, onSuccess, onFailure) => {
            onStart && onStart()

            try {
                const user = await patchDataToServerWithJson<User>('/api/v1/users/me', profile)

                if(user && 'id' in user) {
                    set({user})
                    onSuccess && onSuccess(user)
                }
            }catch(e) {
                //エラーハンドリング処理を書く
                onFailure && onFailure(toErrorScheme(e))
            }
        },
    }
))
