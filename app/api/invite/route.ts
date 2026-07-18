import { callGoogleScript } from "@/lib/google-rsvp";

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";

  if (!TOKEN_PATTERN.test(token)) {
    return Response.json({ error: "Некорректная ссылка" }, { status: 400 });
  }

  try {
    const data = await callGoogleScript("lookup", { token });
    return Response.json({ guest: data.guest });
  } catch {
    return Response.json({ error: "Приглашение не найдено" }, { status: 404 });
  }
}
