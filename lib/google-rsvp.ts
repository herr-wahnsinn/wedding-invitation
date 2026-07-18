type GoogleAction = "lookup" | "rsvp";

export async function callGoogleScript(action: GoogleAction, payload: Record<string, unknown>) {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  const secret = process.env.RSVP_SHARED_SECRET;

  if (!url || !secret) {
    throw new Error("RSVP integration is not configured");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, secret, ...payload }),
    redirect: "follow",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Google Apps Script request failed");
  }

  const data = (await response.json()) as { ok?: boolean; error?: string; [key: string]: unknown };

  if (!data.ok) {
    throw new Error(data.error || "Google Apps Script rejected request");
  }

  return data;
}
