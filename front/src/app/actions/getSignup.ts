"use server";

import { cookies } from "next/headers";

export const getSignup = async ({
  name,
  email,
  password,
  location,
  phoneNumber,
}: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/signup`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ name, email, password, location, phoneNumber }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }
  const data = await res.json();
  if (data) {
    cookies().set({
      name: "token",
      value: data.token,
      httpOnly: true,
    });
  }
  return data;
};
