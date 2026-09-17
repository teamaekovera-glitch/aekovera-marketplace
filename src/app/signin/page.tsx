import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MOCK_USERS } from "@/lib/auth/mock";
import { signInAction } from "@/app/actions/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign in" };

/**
 * Sign-in page. Mock mode surfaces the seeded demo accounts inline so the
 * app is fully explorable with zero keys (F-06).
 */
export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to Aekovera</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The CPG brand-to-buyer marketplace
          </p>
        </div>

        {error && (
          <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}

        <form action={signInAction} className="space-y-4 rounded-lg border bg-card p-6 shadow-sm">
          <input type="hidden" name="next" value={next ?? ""} />
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
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
              autoComplete="current-password"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <Button type="submit" variant="accent" className="w-full">
            Sign in
          </Button>
        </form>

        <section aria-label="Demo accounts" className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-sm font-semibold">Demo accounts (mock mode)</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {MOCK_USERS.map((user) => (
              <li key={user.id} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">
                  {user.email} <span className="text-xs">· {user.role}</span>
                </span>
                <span className="text-xs text-muted-foreground">demo1234</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link href="/signup" className="text-accent underline-offset-4 hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </main>
  );
}
