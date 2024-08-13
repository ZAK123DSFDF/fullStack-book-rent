"use server";
import { cookies } from "next/headers";
export const getSingleBook = async (id: any) => {
  console.log("server");
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/getSingleBook/${id}`,
    {
      method: "GET",
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
  const bookData = await response.json();
  return bookData;
};
