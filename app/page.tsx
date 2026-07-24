"use client";

import { FormEvent, useEffect, useState } from "react";
import Image from "next/image";

type Guest = {
  firstName: string;
  fullName: string;
  addressForm: "ты" | "вы";
  responded: boolean;
};

const wedding = {
  couple: "Андрей & Лилия",
  firstName: "Андрей",
  secondName: "Лилия",
  date: "16 сентября 2026",
  city: "Санкт-Петербург",
};

const schedule = [
  { time: "10:20", label: "ЗАГС", title: "Регистрация", text: "Отдел ЗАГС Петроградского района · Большая Монетная ул., 17." },
  { time: "13:00", label: "Банкет", title: "Ресторан Vinity", text: "Фурштатская ул., 52 · семейный ужин, тосты и танцы." },
];

const venues = [
  {
    label: "Церемония",
    name: "Отдел ЗАГС Петроградского района",
    address: "Большая Монетная ул., 17, Санкт-Петербург",
    mapUrl: "https://yandex.com/maps/-/CTVlr845",
  },
  {
    label: "Банкет",
    name: "Ресторан Vinity",
    address: "Фурштатская ул., 52, Санкт-Петербург",
    mapUrl: "https://yandex.com/maps/-/CTVlvALU",
  },
];

const dressCodeColors = [
  { value: "#1e5945", name: "Глубокий зелёный" },
  { value: "#4f7942", name: "Лесной оливковый" },
  { value: "#556B2F", name: "Тёмный оливковый" },
  { value: "#755c48", name: "Тёплый коричневый" },
  { value: "#79553d", name: "Терракотовый" },
  { value: "#321414", name: "Тёмный шоколад" },
  { value: "#641c34", name: "Винный" },
  { value: "#ac7580", name: "Пыльная роза" },
];

export default function Home() {
  const [sent, setSent] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "loading" | "ready" | "invalid">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [attendanceChoice, setAttendanceChoice] = useState<"yes" | "no" | "">("");
  const [wineSelected, setWineSelected] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("invite")?.trim() ?? "";

    if (!token) {
      setInviteState("invalid");
      return;
    }

    setInviteToken(token);
    setInviteState("loading");

    fetch(`/api/invite?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Invitation not found");
        return response.json() as Promise<{ guest: Guest }>;
      })
      .then((data) => {
        setGuest(data.guest);
        setInviteState("ready");
      })
      .catch(() => setInviteState("invalid"));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!inviteToken || !guest) {
      setFormError("Откройте персональную ссылку из приглашения.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const attendance = String(formData.get("attendance") ?? "");
    const wineSweetness = formData.getAll("wineSweetness").map(String);
    const wineColors = formData.getAll("wineColors").map(String);
    const drinks = [...formData.getAll("drinks").map(String), ...wineSweetness, ...wineColors];
    const otherDrink = String(formData.get("otherDrink") ?? "").trim();

    if (attendance === "yes" && wineSelected && wineSweetness.length === 0) {
      setFormError("Пожалуйста, укажите предпочитаемую степень сладости вина.");
      return;
    }

    if (attendance === "yes" && wineSelected && wineColors.length === 0) {
      setFormError("Пожалуйста, выберите предпочитаемый цвет вина.");
      return;
    }

    if (attendance === "yes" && drinks.length === 0 && !otherDrink) {
      setFormError("Пожалуйста, выберите хотя бы один вариант напитков.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          attendance,
          drinks,
          otherDrink,
          meal: formData.get("meal"),
          note: formData.get("note"),
          website: formData.get("website"),
        }),
      });

      if (!response.ok) throw new Error("Could not save response");
      setSent(true);
    } catch {
      setFormError("Не получилось сохранить ответ. Попробуйте ещё раз через минуту.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main>
      <header className="topbar">
        <a className="monogram" href="#top" aria-label="В начало">A<span>&</span>L</a>
        <nav aria-label="Навигация по приглашению">
          <a href="#story">О нас</a>
          <a href="#program">Программа</a>
          <a href="#details">Детали</a>
        </nav>
        <a className="mini-rsvp" href="#rsvp">Анкета <span aria-hidden="true">↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <div className="guest-greeting">
            <p className="guest-hero-name">{guest?.firstName ?? "Дорогие гости"}</p>
            <p className="eyebrow">Мы женимся</p>
          </div>
          <h1><span>{wedding.firstName}</span><i>&</i><span>{wedding.secondName}</span></h1>
          <div className="hero-meta">
            <p>{wedding.date}</p>
            <p>{wedding.city}</p>
          </div>
          <a className="primary-link" href="#rsvp">
            <span className="primary-link-copy"><strong>Заполнить анкету</strong><small>Займёт около 2 минут</small></span>
            <span className="primary-link-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="flower flower-one"><span /><span /><span /><span /></div>
          <div className="portrait-frame">
            <Image className="hero-photo" src="/andrey-lilya-rooftop.jpg" alt="Андрей и Лилия вместе" fill priority sizes="(max-width: 850px) 87vw, 42vw" />
            <div className="portrait-caption">love · laughter · forever</div>
          </div>
          <div className="date-stamp"><strong>16</strong><span>09 / 26</span></div>
          <div className="flower flower-two"><span /><span /><span /><span /></div>
        </div>
        <p className="scroll-note">Листайте вниз <span>↓</span></p>
      </section>

      <section className="intro" id="story">
        <p className="section-number">01 / наша история</p>
        <div className="intro-main">
          <p className="script-note">С любовью приглашаем вас</p>
          <h2>В жизни есть моменты, которые определяют <em>всё.</em></h2>
        </div>
        <div className="intro-aside">
          <p>И мы поняли, что этот момент — быть вместе, всегда.</p>
          <p>С любовью приглашаем вас на нашу свадьбу, наш первый семейный праздник. Мы будем очень счастливы, если вы будете с нами в этот день!</p>
          <figure className="story-photo">
            <Image src="/andrey-lilya-travel.jpg" alt="Андрей и Лилия в путешествии" width={1600} height={1200} sizes="(max-width: 850px) 86vw, 24vw" />
            <figcaption>наша история продолжается</figcaption>
          </figure>
        </div>
      </section>

      <section className="save-date" aria-label="Дата свадьбы">
        <span>save</span><span className="outline">the date</span><span>16·09·26</span>
      </section>

      <section className="program" id="program">
        <div className="section-heading">
          <p className="section-number">02 / программа дня</p>
          <h2>Два важных адреса<br /><i>одного дня</i></h2>
        </div>
        <div className="timeline">
          {schedule.map((item, index) => (
            <article className="timeline-item" key={item.time}>
              <div className="time"><span>{item.label} · 0{index + 1}</span>{item.time}</div>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
              <span className="timeline-dot" aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className="location" id="details">
        <div className="location-card">
          <p className="section-number">03 / место</p>
          <p className="script-note">Встретимся здесь</p>
          <h2>Санкт-Петербург</h2>
          <div className="venue-list">
            {venues.map((venue) => (
              <article className="venue-item" key={venue.name}>
                <p className="venue-label">{venue.label}</p>
                <h3>{venue.name}</h3>
                <p className="address">{venue.address}</p>
                <a className="venue-link" href={venue.mapUrl} target="_blank" rel="noreferrer">Открыть карту <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </div>
        <a
          className="map-art"
          href={venues[0].mapUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Открыть Отдел ЗАГС Петроградского района в Яндекс Картах"
        >
          <div className="route-map" aria-hidden="true">
            <div className="route-river"><span>набережная реки Карповки</span></div>
            <div className="route-block route-block-one" />
            <div className="route-block route-block-two" />
            <div className="route-block route-block-three" />
            <div className="route-road route-kamennoostrovsky"><span>Каменноостровский пр.</span></div>
            <div className="route-road route-monetnaya"><span>Большая Монетная ул.</span></div>
            <div className="route-road route-mira"><span>ул. Мира</span></div>
            <span className="walk-segment walk-segment-one" />
            <span className="walk-segment walk-segment-two" />
            <span className="route-turn" />
            <div className="route-start">
              <span className="metro-symbol">М</span>
              <p><small>старт</small><strong>Петроградская</strong></p>
            </div>
            <div className="route-finish">
              <span className="route-pin"><i>17</i></span>
              <p><small>финиш</small><strong>Отдел ЗАГС<br />Петроградского района</strong></p>
            </div>
            <p className="route-duration"><strong>≈ 10 минут</strong><span>пешком · 750 м</span></p>
            <span className="route-north">С</span>
          </div>
          <span className="map-link-label">Открыть маршрут в Яндекс Картах <b aria-hidden="true">↗</b></span>
        </a>
      </section>

      <section className="dress-code">
        <div>
          <p className="section-number">04 / dress code</p>
          <h2>Наряды, в которых<br />хочется <i>танцевать</i></h2>
        </div>
        <div className="dress-copy">
          <p>Будем рады, если вы поддержите тёплую палитру осени: глубокий оливковый, благородный терракотовый, уютный коричневый и мягкая пыльная роза. Выбирайте оттенок, в котором вам будет комфортно праздновать и танцевать вместе с нами.</p>
          <div className="palette" aria-label="Палитра дресс-кода">
            {dressCodeColors.map((color) => (
              <button className="palette-color" type="button" key={color.value} aria-label={color.name} title={color.name}>
                <span className="color-swatch" style={{ backgroundColor: color.value }} />
                <span className="color-name">{color.name}</span>
              </button>
            ))}
          </div>
          <aside className="flower-request">
            <span aria-hidden="true">✦</span>
            <p><strong>Корм вместо цветов</strong>Дорогой гость! Мы отказываемся от цветов в пользу помощи тем, кому она жизненно необходима, — животным в приюте. Вместо букета будем рады пакетику корма для собак или кошек.</p>
          </aside>
        </div>
      </section>

      <section className="rsvp" id="rsvp">
        <div className="rsvp-copy">
          <p className="section-number">05 / ваше решение</p>
          <p className="script-note">{guest ? `${guest.firstName}, очень ждём ${guest.addressForm === "ты" ? "тебя" : "вас"}` : "Очень ждём вас"}</p>
          <h2>Получится<br />быть с нами?</h2>
          <p>Пожалуйста, дайте ответ, как только определитесь.</p>
        </div>

        {inviteState === "loading" ? (
          <div className="invite-note" role="status">
            <span className="invite-loader" aria-hidden="true" />
            <p>Готовим ваше персональное приглашение…</p>
          </div>
        ) : inviteState === "invalid" ? (
          <div className="invite-note" role="status">
            <span>✦</span>
            <h3>Нужна персональная ссылка</h3>
            <p>Пожалуйста, откройте ссылку, которую мы отправили вам лично. Так ответ попадёт в правильную строку списка гостей.</p>
          </div>
        ) : sent ? (
          <div className="success" role="status">
            <span>✓</span>
            <h3>Ответ принят</h3>
            <p>Спасибо, {guest?.firstName}! {guest?.addressForm === "ты" ? "Твой ответ сохранён" : "Ваш ответ сохранён"} в нашем списке гостей.</p>
            <button type="button" onClick={() => setSent(false)}>Изменить ответ</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>{guest?.addressForm === "ты" ? "Твоё имя" : "Ваше приглашение"}<input name="name" value={guest?.fullName ?? ""} readOnly aria-readonly="true" /></label>
            <fieldset>
              <legend>{guest?.addressForm === "ты" ? "Ты сможешь прийти?" : "Вы сможете прийти?"}</legend>
              <label className="radio"><input type="radio" name="attendance" value="yes" required onChange={() => setAttendanceChoice("yes")} /><span>Да, с удовольствием</span></label>
              <label className="radio"><input type="radio" name="attendance" value="no" onChange={() => setAttendanceChoice("no")} /><span>{guest?.addressForm === "ты" ? "К сожалению, не смогу" : "К сожалению, не сможем"}</span></label>
            </fieldset>
            {attendanceChoice === "yes" && (
              <div className="survey-details">
                <fieldset className="survey-fieldset">
                  <legend>Какие напитки предпочитаете?</legend>
                  <p className="field-hint">Можно выбрать несколько вариантов</p>
                  <div className="choice-grid">
                    <label className="check"><input type="checkbox" name="drinks" value="Игристое" /><span>Игристое</span></label>
                    <label className="check"><input type="checkbox" checked={wineSelected} onChange={(event) => setWineSelected(event.target.checked)} /><span>Вино</span></label>
                    <label className="check"><input type="checkbox" name="drinks" value="Крепкий алкоголь" /><span>Крепкий алкоголь</span></label>
                    <label className="check"><input type="checkbox" name="drinks" value="Безалкогольные" /><span>Безалкогольные</span></label>
                  </div>
                  {wineSelected && (
                    <div className="wine-options">
                      <div className="wine-step">
                        <p><span>1</span>По степени сладости</p>
                        <div className="choice-grid wine-sweetness-grid">
                          <label className="check"><input type="checkbox" name="wineSweetness" value="Сухое вино" /><span>Сухое</span></label>
                          <label className="check"><input type="checkbox" name="wineSweetness" value="Полусухое вино" /><span>Полусухое</span></label>
                          <label className="check"><input type="checkbox" name="wineSweetness" value="Полусладкое вино" /><span>Полусладкое</span></label>
                          <label className="check"><input type="checkbox" name="wineSweetness" value="Сладкое вино" /><span>Сладкое</span></label>
                        </div>
                      </div>
                      <div className="wine-step">
                        <p><span>2</span>Цвет вина</p>
                        <div className="choice-grid wine-grid">
                          <label className="check"><input type="checkbox" name="wineColors" value="Белое вино" /><span>Белое</span></label>
                          <label className="check"><input type="checkbox" name="wineColors" value="Красное вино" /><span>Красное</span></label>
                          <label className="check"><input type="checkbox" name="wineColors" value="Розовое вино" /><span>Розовое</span></label>
                        </div>
                      </div>
                    </div>
                  )}
                  <label className="other-drink">Другой вариант<input name="otherDrink" maxLength={120} placeholder="Напишите свой вариант напитка" /></label>
                </fieldset>
                <fieldset className="survey-fieldset">
                  <legend>Что предпочитаете на горячее?</legend>
                  <div className="choice-grid meal-grid">
                    <label className="radio"><input type="radio" name="meal" value="Курица" required /><span>Курица</span></label>
                    <label className="radio"><input type="radio" name="meal" value="Рыба" /><span>Рыба</span></label>
                    <label className="radio"><input type="radio" name="meal" value="Без разницы" /><span>Без разницы</span></label>
                  </div>
                </fieldset>
              </div>
            )}
            <label>Пожелания<textarea name="note" maxLength={1000} rows={3} placeholder="Аллергии, любимая песня или пара теплых слов" /></label>
            <label className="honeypot" aria-hidden="true">Ваш сайт<input name="website" tabIndex={-1} autoComplete="off" /></label>
            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="submit-button" type="submit" disabled={submitting}>
              {submitting ? "Сохраняем…" : "Отправить ответ"} <span aria-hidden="true">→</span>
            </button>
          </form>
        )}
      </section>

      <footer>
        <p>До встречи на свадьбе</p>
        <h2>{wedding.couple}</h2>
        <div><span>{wedding.date}</span><span>С любовью из Санкт-Петербурга</span></div>
      </footer>
    </main>
  );
}
