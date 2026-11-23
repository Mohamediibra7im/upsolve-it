import { redirect } from "next/navigation";

// This redirect is also configured in next.config.js for client-side navigation.
// The server component redirect here is a fallback for direct server-side rendering.
export default function AdminPage() {
  redirect("/admin/dashboard");
}
