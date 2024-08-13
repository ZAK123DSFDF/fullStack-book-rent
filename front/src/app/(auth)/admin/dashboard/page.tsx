import { getAuthData } from "@/app/actions/getAuth";
import AdminDashboard from "@/app/components/auth/admin/Dashboard";
import { redirect } from "next/navigation";

export default async function page() {
  const data = await getAuthData();
  if (!data.isAuthenticated) {
    redirect("/login");
  } else if (data.role === "OWNER") {
    redirect("/owner/dashboard");
  }
  return <AdminDashboard />;
}
