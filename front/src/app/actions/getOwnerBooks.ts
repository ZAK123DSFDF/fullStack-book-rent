"use server";
import { cookies } from "next/headers";

export const getOwnerBooks = async (
  name: string,
  minPrice: number,
  maxPrice: number,
  status: string
) => {
  // Define valid statuses
  // Default to empty if status is not valid

  // Construct the URL with proper interpolation
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/book/getUserBooks?search=${
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
    throw new Error(errorData.message || "Failed to fetch books");
  }
  return response.json();
};
