import { getAuthData } from "@/app/actions/getAuth";
import OwnerDashboard from "@/app/components/auth/owner/Dashboard";
import { redirect } from "next/navigation";

export default async function page() {
  const data = await getAuthData();
  if (!data.isAuthenticated) {
    redirect("/login");
  } else if (data.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  return <OwnerDashboard />;
}
