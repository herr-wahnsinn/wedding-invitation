import { callGoogleScript } from "@/lib/google-rsvp";

const TOKEN_PATTERN = /^[a-f0-9]{32}$/;

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const token = cleanText(body.token, 32);
    const attendance = cleanText(body.attendance, 3);
    const plusOne = cleanText(body.plusOne, 120);
    const note = cleanText(body.note, 1000);
    const website = cleanText(body.website, 200);

    if (website) return Response.json({ ok: true });

    if (!TOKEN_PATTERN.test(token) || !["yes", "no"].includes(attendance)) {
      return Response.json({ error: "Проверьте обязательные поля" }, { status: 400 });
    }

    await callGoogleScript("rsvp", { token, attendance, plusOne, note });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Не удалось сохранить ответ" }, { status: 502 });
  }
}
