"use server";
import { cookies } from "next/headers";
export const getUpdateBook = async ({ updateData, bookId }: any) => {
  console.log("Update request data:", updateData);
  console.log("Book ID:", bookId);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/updateBook/${bookId}`,
    {
      method: "PATCH",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify(updateData),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "failed to create chat");
  }
  const bookData = await response.json();
  return bookData;
};
