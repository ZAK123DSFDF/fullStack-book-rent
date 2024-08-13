import { getAuthData } from "@/app/actions/getAuth";
import Signup from "@/app/components/unauth/Signup";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function page() {
  const data = await getAuthData();
  if (data.isAuthenticated) {
    redirect("/owner/dashboard");
  }
  return <Signup />;
}
