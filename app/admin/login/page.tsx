import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

async function loginAction(formData: FormData) {
  "use server";
  const supabase = await createSupabaseServerClient();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (!error) redirect("/admin");
  redirect("/admin/login?error=1");
}

export default function AdminLoginPage() {
  return (
    <section className="mx-auto max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Admin login</h1>
      <form action={loginAction} className="space-y-3">
        <input className="w-full rounded border p-2" name="email" type="email" placeholder="E-mail" required />
        <input className="w-full rounded border p-2" name="password" type="password" placeholder="Wachtwoord" required />
        <button className="w-full rounded bg-slate-900 px-4 py-2 text-white">Inloggen</button>
      </form>
    </section>
  );
}
