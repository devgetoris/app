import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  // If user is authenticated, redirect to dashboard
  if (userId) {
    redirect("/dashboard");
  }

  // If not authenticated, redirect to sign-in
  redirect("/auth/sign-in");
}
