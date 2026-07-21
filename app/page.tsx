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
  couple: "Андрей & Лиля",
  firstName: "Андрей",
  secondName: "Лиля",
  date: "16 сентября 2026",
  city: "Санкт-Петербург",
};

const schedule = [
  { time: "ЗАГС", title: "Регистрация", text: "Отдел ЗАГС Петроградского района · Большая Монетная ул., 17." },
  { time: "Банкет", title: "Ресторан Vinity", text: "Фурштатская ул., 52 · семейный ужин, тосты и танцы." },
];

const venues = [
  {
    label: "Церемония",
    name: "Отдел ЗАГС Петроградского района",
    address: "Большая Монетная ул., 17, Санкт-Петербург",
    mapUrl: "https://www.google.com/search?sca_esv=1e1e55aabb50fa0b&sxsrf=APpeQnuzMuyfbtP7cK5ZJwCPFCAwHX5TkQ:1784636595816&q=%D0%BE%D1%82%D0%B4%D0%B5%D0%BB+%D0%B7%D0%B0%D0%B3%D1%81+%D0%BF%D0%B5%D1%82%D1%80%D0%BE%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%BE%D0%B3%D0%BE+%D1%80%D0%B0%D0%B9%D0%BE%D0%BD%D0%B0+%D0%B0%D0%B4%D1%80%D0%B5%D1%81&ludocid=4501468994677333700&sa=X&ved=2ahUKEwjH_eGy4eOVAxXvzwIHHZn-GmkQ6BN6BAgcEAI",
  },
  {
    label: "Банкет",
    name: "Ресторан Vinity",
    address: "Фурштатская ул., 52, Санкт-Петербург",
    mapUrl: "https://yandex.com/maps/org/vinity/1261311115/?yclid=",
  },
];

const dressCodeColors = ["#79553d", "#1e5945", "#755c48", "#ac7580", "#641c34", "#4f7942", "#321414", "#556B2F"];

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
        <a className="mini-rsvp" href="#rsvp">RSVP <span aria-hidden="true">↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy reveal">
          <p className="eyebrow">{guest ? `${guest.firstName}, мы женимся` : "Мы женимся"}</p>
          <h1><span>{wedding.firstName}</span><i>&</i><span>{wedding.secondName}</span></h1>
          <div className="hero-meta">
            <p>{wedding.date}</p>
            <p>{wedding.city}</p>
          </div>
          <a className="primary-link" href="#rsvp">Будем вместе? <span aria-hidden="true">→</span></a>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="flower flower-one"><span /><span /><span /><span /></div>
          <div className="portrait-frame">
            <Image className="hero-photo" src="/andrey-lilya-rooftop.jpg" alt="Андрей и Лиля вместе" fill priority sizes="(max-width: 850px) 87vw, 42vw" />
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
            <Image src="/andrey-lilya-travel.jpg" alt="Андрей и Лиля в путешествии" width={1600} height={1200} sizes="(max-width: 850px) 86vw, 24vw" />
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
        <div className="map-art" aria-hidden="true">
          <span className="road r1" /><span className="road r2" /><span className="road r3" />
          <span className="river" /><span className="park p1" /><span className="park p2" />
          <div className="pin"><span>A&L</span></div>
          <p>САНКТ-ПЕТЕРБУРГ · 59.94° N</p>
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
            {dressCodeColors.map((color) => <span key={color} style={{ backgroundColor: color }} aria-label={color} />)}
          </div>
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
              <label className="radio"><input type="radio" name="attendance" value="yes" required /><span>Да, с удовольствием</span></label>
              <label className="radio"><input type="radio" name="attendance" value="no" /><span>{guest?.addressForm === "ты" ? "К сожалению, не смогу" : "К сожалению, не сможем"}</span></label>
            </fieldset>
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
