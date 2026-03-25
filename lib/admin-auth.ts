import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const requireAdmin = async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim());

  if (!user || !admins.includes(user.email ?? "")) {
    redirect("/admin/login");
  }
};
