"use server";
import { cookies } from "next/headers";
interface activateUser {
  id: string;
}
export const getActivateUser = async ({ id }: activateUser) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/activateUser/${id}`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "failed to create chat");
  }
  const activateUser = await response.json();
  return activateUser;
};
