export const USER_ROLES = ["USER", "ADMIN"] as const
export type UserRole = (typeof USER_ROLES)[number]

export type User = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  username: string | null;
  role: "USER" | "ADMIN";
  accounts: { provider: string }[];
};