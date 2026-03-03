
import {getPrisma} from "@/lib/config/server";
import {UpdateUserType} from "@/features/users/schema";
          


export const usersRepository = {
  findById: async (id: string) => {
    const user = await getPrisma().user.findUnique({
      where: { id: id },
      include: {
        icon: true,
        background: true,
      }
    });

    return user;
  },

  updateUser: async (id: string, data: UpdateUserType) => {
    return getPrisma().$transaction(async (tx) => {
      // 現在のユーザー情報を取得して、古い画像を確認する
      const currentUser = await tx.user.findUnique({
        where: { id },
        include: { icon: true, background: true }
      });

      if (!currentUser) throw new Error("User not found");

      // アイコンの更新がある場合
      if (data.icon) {
        // data.icon は imageId として扱う
        const newIcon = await tx.image.findUnique({ where: { id: data.icon } });
        if (!newIcon) throw new Error("New icon image not found");

        // 古いアイコンがある場合、UNUSEDにする
        if (currentUser.icon && currentUser.icon.id !== data.icon) {
          await tx.image.update({
            where: { id: currentUser.icon.id },
            data: {
              status: 'UNUSED',
              userIconId: null
            }
          });
        }

        // 新しいアイコンを ADOPTED にし、ユーザーに関連付ける
        await tx.image.update({
          where: { id: data.icon },
          data: {
            status: 'ADOPTED',
            userIconId: id
          }
        });
      }

      // 背景の更新がある場合
      if (data.background) {
        const newBg = await tx.image.findUnique({ where: { id: data.background } });
        if (!newBg) throw new Error("New background image not found");

        if (currentUser.background && currentUser.background.id !== data.background) {
          await tx.image.update({
            where: { id: currentUser.background.id },
            data: {
              status: 'UNUSED',
              userBackgroundId: null
            }
          });
        }

        await tx.image.update({
          where: { id: data.background },
          data: {
            status: 'ADOPTED',
            userBackgroundId: id
          }
        });
      }

      // ユーザー基本情報の更新
      const user = await tx.user.update({
        where: { id: id },
        data: {
          name: data.name,
          bio: data.bio,
        },
        include: {
          icon: true,
          background: true,
        }
      });

      return user;
    });
  }
};