export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    status: "ok",
    timestamp: Date.now(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
