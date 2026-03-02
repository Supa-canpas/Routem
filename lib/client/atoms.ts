import {atom} from "jotai";

//ヘッダーが折りたたまれているかどうかのatom、表示状態はtrue、非表示状態はfalse
//今現在はスクロール方向のみでの制御なのでいったんコメントアウトしている。
// export const isHeaderVisibleAtom = atom<boolean>(true)

export const scrollDirectionAtom = atom<'up' | 'down' | 'left' | 'right'>('up')

export const headerHeightAtom = atom<number>(60)

export const isMobileAtom = atom<boolean>(false)
