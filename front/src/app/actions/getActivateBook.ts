"use server";
import { cookies } from "next/headers";
interface activateBook {
  id: string;
}
export const getActivateBook = async ({ id }: activateBook) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/activateBook/${id}`,
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
  const activateBook = await response.json();
  return activateBook;
};
