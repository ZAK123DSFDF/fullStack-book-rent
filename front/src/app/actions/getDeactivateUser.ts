"use server";
import { cookies } from "next/headers";
interface deactivateUser {
  id: string;
}
export const getDeactivateUser = async ({ id }: deactivateUser) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/deactivateUser/${id}`,
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
  const deactivateUser = await response.json();
  return deactivateUser;
};
