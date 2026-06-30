import type { Metadata } from "next";
import { Receipt } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Masuk — Studio Invoice",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Receipt className="size-6" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Studio Invoice</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Masuk untuk mengelola invoice studio kamu.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
