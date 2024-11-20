import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function AuthForm({
  action,
  children,
  defaultEmail = "",
  showConfirmPassword = false,
  passwordError = "",
}: {
  action: any;
  children: React.ReactNode;
  defaultEmail?: string;
  showConfirmPassword?: boolean;
  passwordError?: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="email"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          電子郵件
        </Label>

        <Input
          id="email"
          name="email"
          className="bg-muted text-md md:text-sm border-none"
          type="email"
          placeholder="user@acme.com"
          autoComplete="email"
          required
          defaultValue={defaultEmail}
        />

        <Label
          htmlFor="password"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          密碼
        </Label>

        <Input
          id="password"
          name="password"
          className="bg-muted text-md md:text-sm border-none"
          type="password"
          required
        />

        {showConfirmPassword && (
          <>
            <Label
              htmlFor="confirmPassword"
              className="text-zinc-600 font-normal dark:text-zinc-400"
            >
              確認密碼
            </Label>

            <Input
              id="confirmPassword"
              name="confirmPassword"
              className="bg-muted text-md md:text-sm border-none"
              type="password"
              required
            />

            {passwordError && (
              <span className="text-sm text-red-500 mt-1">
                {passwordError}
              </span>
            )}
          </>
        )}
      </div>

      {children}
    </form>
  );
}