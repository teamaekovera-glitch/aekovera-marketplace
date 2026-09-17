import { NextResponse, type NextRequest } from "next/server";
import { createAuthAdapter } from "@/lib/auth";

/**
 * OAuth callback landing (F-06). Supabase exchanges the code for a session
 * via its own client; in mock mode this simply routes to the brand home as
 * the demo identity.
 */
export async function GET(request: NextRequest) {
  const adapter = createAuthAdapter();
  if (adapter.mode === "mock") {
    return NextResponse.redirect(new URL("/brand", request.url));
  }
  return NextResponse.redirect(new URL("/brand", request.url));
}
