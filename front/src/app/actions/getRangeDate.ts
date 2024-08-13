"use server";
import { cookies } from "next/headers";
export const getRangeDate = async (startDate: any, endDate: any) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/wallet/balanceByRange?startDate=${startDate}&&${endDate}`,
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
