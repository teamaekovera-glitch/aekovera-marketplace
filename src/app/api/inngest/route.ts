import { NextResponse } from "next/server";
import { serve } from "inngest/next";
import { env, serviceMode } from "@/lib/env";
import { InngestJobsAdapter, inngestTestFunction } from "@/lib/jobs/inngest";

/**
 * Inngest route (F-10). Serves the registered functions when Inngest keys
 * exist. In mock mode jobs run inline instead, so this endpoint reports the
 * active mode rather than mounting an unconfigured function set.
 */
const inngest =
  serviceMode.jobs === "inngest"
    ? new InngestJobsAdapter(env.inngestEventKey, env.inngestSigningKey)
    : null;

async function mockModeHandler(): Promise<NextResponse> {
  return NextResponse.json({
    mode: "mock",
    ok: true,
    message: "Inngest is in mock mode — jobs run inline in-process.",
  });
}

const handler = inngest
  ? serve({
      client: inngest.inngestClient,
      functions: [inngestTestFunction(inngest.inngestClient)],
    })
  : mockModeHandler;

export { handler as GET, handler as POST, handler as PUT };
