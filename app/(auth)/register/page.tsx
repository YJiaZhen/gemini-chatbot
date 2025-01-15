"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthForm } from "@/components/custom/auth-form";
import { SubmitButton } from "@/components/custom/submit-button";

import { register, RegisterActionState } from "../actions";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [state, formAction] = useActionState<RegisterActionState, FormData>(
    register,
    {
      status: "idle",
    },
  );

  useEffect(() => {
    if (state.status === "user_exists") {
      toast.error("Account already exists");
    } else if (state.status === "failed") {
      toast.error("Failed to create account");
    } else if (state.status === "invalid_data") {
      toast.error("Failed validating your submission!");
    } else if (state.status === "success") {
      toast.success("Account created successfully");
      router.refresh();
    }
  }, [state, router]);

  const handleSubmit = (formData: FormData) => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setPasswordError("密碼不匹配");
      toast.error("密碼不匹配");
      return;
    }

    setPasswordError("");
    setEmail(formData.get("email") as string);
    formAction(formData);
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl gap-12 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">註冊</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            使用您的電子郵件和密碼創建帳戶
          </p>
        </div>
        <AuthForm 
          action={handleSubmit} 
          defaultEmail={email}
          showConfirmPassword={true}
          passwordError={passwordError}
        >
          <SubmitButton>註冊</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"已經有帳號了? "}
            <Link
              href="/login"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              登入
            </Link>
          </p>
        </AuthForm>
      </div>
    </div>
  );
}