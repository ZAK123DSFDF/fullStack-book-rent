"use server";
import { cookies } from "next/headers";
export const getAllUsers = async (
  globalSearch: string,
  id: string,
  name: string,
  location: string,
  email: string,
  phoneNumber: string,
  uploadNumber: string,
  userStatus: string,
  updateStatus: string,
  sortBy: string,
  sortOrder: string
) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/auth/all?globalSearch=${
      globalSearch ? globalSearch : ""
    }&userId=${id ? +id : ""}&userName=${name ? name : ""}&userLocation=${
      location ? location : ""
    }&userEmail=${email ? email : ""}&userPhoneNumber=${
      phoneNumber ? phoneNumber : ""
    }&uploadNumber=${uploadNumber ? +uploadNumber : ""}&userStatus=${
      userStatus ? userStatus : ""
    }&updateStatus=${updateStatus ? updateStatus : ""}&sortBy=${
      sortBy ? sortBy : ""
    }&sortOrder=${sortOrder ? sortOrder : ""}`,
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
  const usersData = await response.json();
  return usersData;
};
