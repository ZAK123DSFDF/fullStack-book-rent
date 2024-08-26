"use server";
import { cookies } from "next/headers";
interface deactivateBook {
  id: string;
}
export const getDeactivateBook = async ({ id }: deactivateBook) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/deactivateBook/${id}`,
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
  const deactivateBook = await response.json();
  return deactivateBook;
};
