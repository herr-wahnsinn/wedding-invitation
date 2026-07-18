"use client";

import { FormEvent, useEffect, useState } from "react";

type Guest = {
  firstName: string;
  fullName: string;
  responded: boolean;
};

const wedding = {
  couple: "Алексей & София",
  firstName: "Алексей",
  secondName: "София",
  date: "18 августа 2026",
  venue: "Вилла Ротонда",
  address: "Москва, Нескучный сад",
  mapUrl: "https://maps.google.com/?q=Нескучный+сад+Москва",
};

const schedule = [
  { time: "15:30", title: "Welcome", text: "Встречаемся, обнимаемся и настраиваемся на красивый вечер." },
  { time: "16:30", title: "Церемония", text: "Самый важный момент — скажем друг другу «да» в кругу близких." },
  { time: "17:30", title: "Ужин", text: "Тосты, истории, музыка и всё, за что мы так любим большие праздники." },
  { time: "21:00", title: "Afterparty", text: "Торт, танцы и никакого строгого тайминга — оставайтесь до последней песни." },
];

export default function Home() {
  const [sent, setSent] = useState(false);
  const [guest, setGuest] = useState<Guest | null>(null);
  const [inviteToken, setInviteToken] = useState("");
  const [inviteState, setInviteState] = useState<"idle" | "loading" | "ready" | "invalid">("idle");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

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
    setSubmitting(true);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: inviteToken,
          attendance: formData.get("attendance"),
          plusOne: formData.get("plusOne"),
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
        <a className="monogram" href="#top" aria-label="В начало">A<span>&</span>S</a>
        <nav aria-label="Навигация по приглашению">
          <a href="#story">О нас</a>
          <a href="#program">Программа</a>
          <a href="#details">Детали</a>
        </nav>
        <a className="mini-rsvp" href="#rsvp">RSVP <span aria-hidden="true">↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <p className="eyebrow">{guest ? `${guest.firstName}, мы женимся` : "Мы женимся"}</p>
          <h1><span>{wedding.firstName}</span><i>&</i><span>{wedding.secondName}</span></h1>
          <div className="hero-meta">
            <p>{wedding.date}</p>
            <p>Москва</p>
          </div>
          <a className="primary-link" href="#rsvp">Будем вместе? <span aria-hidden="true">→</span></a>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="flower flower-one"><span /><span /><span /><span /></div>
          <div className="portrait-frame">
            <div className="sun" />
            <div className="figure figure-one"><i /></div>
            <div className="figure figure-two"><i /></div>
            <div className="portrait-caption">love · laughter · forever</div>
          </div>
          <div className="date-stamp"><strong>18</strong><span>08 / 26</span></div>
          <div className="flower flower-two"><span /><span /><span /><span /></div>
        </div>
        <p className="scroll-note">Листайте вниз <span>↓</span></p>
      </section>

      <section className="intro" id="story">
        <p className="section-number">01 / наша история</p>
        <div className="intro-main">
          <p className="script-note">Однажды мы встретились…</p>
          <h2>И поняли, что хотим смеяться, путешествовать и взрослеть <em>вместе.</em></h2>
        </div>
        <div className="intro-aside">
          <p>Теперь мы хотим разделить начало новой главы с теми, кто сделал нашу историю такой теплой.</p>
          <p>Без вас этот день не будет полным.</p>
        </div>
      </section>

      <section className="save-date" aria-label="Дата свадьбы">
        <span>save</span><span className="outline">the date</span><span>18·08·26</span>
      </section>

      <section className="program" id="program">
        <div className="section-heading">
          <p className="section-number">02 / программа дня</p>
          <h2>Всё самое важное<br /><i>в одном вечере</i></h2>
        </div>
        <div className="timeline">
          {schedule.map((item, index) => (
            <article className="timeline-item" key={item.time}>
              <div className="time"><span>0{index + 1}</span>{item.time}</div>
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
          <h2>{wedding.venue}</h2>
          <p className="address">{wedding.address}<br />Сбор гостей — 15:30</p>
          <a className="primary-link light" href={wedding.mapUrl} target="_blank" rel="noreferrer">Открыть карту <span aria-hidden="true">↗</span></a>
        </div>
        <div className="map-art" aria-hidden="true">
          <span className="road r1" /><span className="road r2" /><span className="road r3" />
          <span className="river" /><span className="park p1" /><span className="park p2" />
          <div className="pin"><span>A&S</span></div>
          <p>МОСКВА · 55.72° N</p>
        </div>
      </section>

      <section className="dress-code">
        <div>
          <p className="section-number">04 / dress code</p>
          <h2>Наряды, в которых<br />хочется <i>танцевать</i></h2>
        </div>
        <div className="dress-copy">
          <p>Будем рады, если вы поддержите палитру вечера. Выбирайте комфортные образы в природных и винных оттенках.</p>
          <div className="palette" aria-label="Палитра дресс-кода">
            <span className="c1" aria-label="Сливочный" /><span className="c2" aria-label="Пудровый" />
            <span className="c3" aria-label="Шалфейный" /><span className="c4" aria-label="Винный" />
            <span className="c5" aria-label="Шоколадный" />
          </div>
        </div>
      </section>

      <section className="rsvp" id="rsvp">
        <div className="rsvp-copy">
          <p className="section-number">05 / ваше решение</p>
          <p className="script-note">{guest ? `${guest.firstName}, очень ждём вас` : "Очень ждём вас"}</p>
          <h2>Получится<br />быть с нами?</h2>
          <p>Пожалуйста, дайте ответ до 18 июля 2026 года.</p>
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
            <p>Спасибо, {guest?.firstName}! Ответ сохранён в нашем списке гостей.</p>
            <button type="button" onClick={() => setSent(false)}>Изменить ответ</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>Ваше имя<input name="name" value={guest?.fullName ?? ""} readOnly aria-readonly="true" /></label>
            <fieldset>
              <legend>Вы сможете прийти?</legend>
              <label className="radio"><input type="radio" name="attendance" value="yes" required /><span>Да, с удовольствием</span></label>
              <label className="radio"><input type="radio" name="attendance" value="no" /><span>К сожалению, не смогу</span></label>
            </fieldset>
            <label>С кем вы будете?<input name="plusOne" maxLength={120} placeholder="Имя спутника / спутницы" /></label>
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
        <div><span>{wedding.date}</span><span>С любовью из Москвы</span></div>
      </footer>
    </main>
  );
}
