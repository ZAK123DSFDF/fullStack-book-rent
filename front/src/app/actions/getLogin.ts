"use server";

import { cookies } from "next/headers";

export const getLogin = async ({ email, password }: any) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({ email, password }),
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
