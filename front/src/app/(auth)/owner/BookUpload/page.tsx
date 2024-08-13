import { getAuthData } from "@/app/actions/getAuth";
import BookUpload from "@/app/components/auth/owner/BookUpload/BookUpload";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function page() {
  const data = await getAuthData();
  if (!data.isAuthenticated) {
    redirect("/login");
  } else if (data.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  return <BookUpload />;
}
