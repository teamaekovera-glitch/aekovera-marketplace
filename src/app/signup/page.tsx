import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signUpAction } from "@/app/actions/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Get started" };

/** Sign-up page (brand or buyer). Phase 0 wires the flow; verification comes later. */
export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; role?: string }>;
}) {
  const { error, role } = await searchParams;
  const defaultRole = role === "buyer" ? "buyer" : "brand";
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join as a brand to get discovered, or as a buyer to source.
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <form action={signUpAction} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <fieldset className="space-y-1.5">
            <legend className="text-sm font-medium">I am a…</legend>
            <div className="flex gap-3">
              <label className="flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input type="radio" name="role" value="brand" defaultChecked={defaultRole === "brand"} />
                Brand
              </label>
              <label className="flex flex-1 items-center gap-2 rounded-md border px-3 py-2 text-sm has-[:checked]:border-accent has-[:checked]:bg-accent/5">
                <input type="radio" name="role" value="buyer" defaultChecked={defaultRole === "buyer"} />
                Buyer
              </label>
            </div>
          </fieldset>
          <div className="space-y-1.5">
            <label htmlFor="displayName" className="text-sm font-medium">Company name</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>
          </div>
          <Button type="submit" variant="accent" className="w-full">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/signin" className="text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
