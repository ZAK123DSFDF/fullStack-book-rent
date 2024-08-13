"use server";
import { cookies } from "next/headers";
export async function getAuthData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/check`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookies().toString(),
    },
  });
  if (!res.ok) {
    await res.json();
    return { isAuthenticated: false };
  }
  const data = await res.json();
  console.log(data);
  return data;
}
