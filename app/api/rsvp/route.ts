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
    const drinks = Array.isArray(body.drinks)
      ? body.drinks.map((value) => cleanText(value, 40)).filter(Boolean)
      : [];
    const meal = cleanText(body.meal, 30);
    const note = cleanText(body.note, 1000);
    const website = cleanText(body.website, 200);

    if (website) return Response.json({ ok: true });

    const allowedDrinks = ["Игристое", "Вино", "Крепкий алкоголь", "Безалкогольные"];
    const allowedMeals = ["Мясо", "Рыба", "Без разницы"];

    if (
      !TOKEN_PATTERN.test(token) ||
      !["yes", "no"].includes(attendance) ||
      (attendance === "yes" && drinks.length === 0) ||
      drinks.some((drink) => !allowedDrinks.includes(drink)) ||
      (attendance === "yes" && !allowedMeals.includes(meal)) ||
      (attendance === "no" && Boolean(meal) && !allowedMeals.includes(meal))
    ) {
      return Response.json({ error: "Проверьте обязательные поля" }, { status: 400 });
    }

    const responseNote = [
      attendance === "yes" ? `Напитки: ${drinks.join(", ")}` : "",
      attendance === "yes" ? `Горячее: ${meal}` : "",
      note ? `Пожелания: ${note}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await callGoogleScript("rsvp", {
      token,
      attendance,
      drinks,
      meal,
      note: responseNote,
    });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Не удалось сохранить ответ" }, { status: 502 });
  }
}
