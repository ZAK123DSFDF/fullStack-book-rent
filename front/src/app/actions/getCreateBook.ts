"use server";
import { cookies } from "next/headers";
interface createBook {
  name: string;
  author: string;
  price: string;
  count: string;
  category: string;
}
export const getCreateBook = async ({
  name,
  author,
  price,
  count,
  category,
}: createBook) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/create`,
    {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookies().toString(),
      },
      body: JSON.stringify({ name, author, price, count, category }),
    }
  );
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "failed to create chat");
  }
  const bookData = await response.json();
  return bookData;
};
