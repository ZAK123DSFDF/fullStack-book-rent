"use server";
import { cookies } from "next/headers";
export const getAdminBook = async (
  name: string,
  minPrice: number,
  maxPrice: number,
  status: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/AllBooks?search=${
      name ? name : ""
    }&minPrice=${minPrice ? +minPrice : ""}&maxPrice=${
      maxPrice ? +maxPrice : ""
    }&status=${status ? status : ""}`,
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
