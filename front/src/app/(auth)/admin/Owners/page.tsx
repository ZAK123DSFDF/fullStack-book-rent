import { getAuthData } from "@/app/actions/getAuth";
import Owners from "@/app/components/auth/admin/Owners";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function page() {
  const data = await getAuthData();
  if (!data.isAuthenticated) {
    redirect("/login");
  } else if (data.role === "OWNER") {
    redirect("/owner/dashboard");
  }
  return <Owners />;
}
