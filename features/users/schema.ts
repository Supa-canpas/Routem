import { z } from "zod";

// 
/**
 * APIで使うUserの共通スキーマ
 */
export type User = z.infer<typeof UserSchema>;

/**
 * GET、POSTのresponse
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  bio: z.string().optional(),
  icon: z.string().optional(),
  background: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

/**
 * GETのバリデーション
 */
export const UserIdSchema = UserSchema.pick({ id: true });

/**
 * POSTのバリデーション
 */
export const CreateUserSchema = UserSchema.omit({ id: true });

/**
 * PATCHのバリデーション
 */
export const UpdateUserSchema = UserSchema.pick({
  name: true,
  bio: true,
})
  .extend({
    icon: z.string().optional(), // imageId を受け取る
    background: z.string().optional(), // imageId を受け取る
  })
  .partial()
  .strict();

export type UpdateUserType = z.infer<typeof UpdateUserSchema>;

