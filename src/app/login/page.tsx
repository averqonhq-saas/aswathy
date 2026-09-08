import { redirect } from "next/navigation";

export default async function LegacyLoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { redirect: redirectTo } = await searchParams;
  const destination =
    typeof redirectTo === "string" && redirectTo.startsWith("/admin")
      ? redirectTo
      : "/admin/dashboard";

  redirect(`/admin/login?redirect=${encodeURIComponent(destination)}`);
}
