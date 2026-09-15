import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/ui/AuthForm";
import { AuthShell } from "@/features/auth/ui/AuthShell";

export const metadata: Metadata = { title: "회원가입 | travel with me" };

export default function SignupPage() {
  return (
    <AuthShell mode="signup">
        <div className="mt-6"><AuthForm mode="signup" /></div>
    </AuthShell>
  );
}
