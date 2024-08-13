import { getAuthData } from "@/app/actions/getAuth";
import Login from "@/app/components/unauth/Login";
import { redirect } from "next/navigation";

export default async function page() {
  const data = await getAuthData();
  if (data.isAuthenticated) {
    redirect("/owner/dashboard");
  }
  return <Login />;
}
