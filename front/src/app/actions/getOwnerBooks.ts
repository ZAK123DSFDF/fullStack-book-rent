"use server";
import { cookies } from "next/headers";

export const getOwnerBooks = async (
  globalSearch: string,
  bookId: string,
  bookName: string,
  bookAuthor: string,
  count: string,
  price: string,
  bookStatus: string,
  status: string,
  sortBy: string,
  sortOrder: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/getUserBooks?globalSearch=${
      globalSearch ? globalSearch : ""
    }&bookId=${bookId ? +bookId : ""}&bookName=${
      bookName ? bookName : ""
    }&bookAuthor=${bookAuthor ? bookAuthor : ""}&count=${
      count ? +count : ""
    }&price=${price ? +price : ""}&bookStatus=${
      bookStatus ? bookStatus : ""
    }&status=${status ? status : ""}&sortBy=${sortBy ? sortBy : ""}&sortOrder=${
      sortOrder ? sortOrder : ""
    }`,
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
    throw new Error(errorData.message || "Failed to fetch books");
  }
  return response.json();
};
