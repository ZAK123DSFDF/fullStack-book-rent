import { getAuthData } from "@/app/actions/getAuth";
import Signup from "@/app/components/unauth/Signup";
import { redirect } from "next/navigation";

export default async function page() {
  const data = await getAuthData();
  if (data.isAuthenticated) {
    redirect("/owner/dashboard");
  }
  return <Signup />;
}
