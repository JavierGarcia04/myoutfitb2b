// components/SubscribeForm.js
import React, { useState } from 'react';
import styles from '@/styles/SubscribeForm.module.scss';
import { useLanguage } from '@/context/LanguageContext';

// URL de Mailchimp
const MAILCHIMP_URL =
  'https://myoutfitapp.us7.list-manage.com/subscribe/post?u=a4109ff02e4a53e82e22d2824&id=dd2ff0aa16&f_id=006ba3e4f0';

const translations = {
  en: {
    title: "Don't miss out!",
    description:
      "Leave us your email and we'll let you know when MyOutfit is available.",
    placeholder: 'Your email',
    button: 'Notify me',
    success: "Great! We'll notify you at launch.",
    error: 'Something went wrong. Please try again.',
    privacy: 'We respect your privacy. Unsubscribe at any time.',
  },
  es: {
    title: '¡No te lo pierdas!',
    description:
      'Déjanos tu correo y te avisamos cuando MyOutfit esté disponible.',
    placeholder: 'Tu correo',
    button: 'Avísame',
    success: '¡Genial! Te avisaremos en el lanzamiento.',
    error: 'Algo salió mal. Inténtalo de nuevo.',
    privacy: 'Respetamos tu privacidad. Cancela la suscripción cuando quieras.',
  },
  fr: {
    title: 'Ne ratez rien !',
    description:
      'Laissez-nous votre e-mail et nous vous avertirons lorsque MyOutfit sera disponible.',
    placeholder: 'Votre e-mail',
    button: 'Prévenez-moi',
    success: 'Génial ! Nous vous avertirons au lancement.',
    error: "Une erreur s'est produite. Veuillez réessayer.",
    privacy: 'Nous respectons votre vie privée. Désabonnez-vous à tout moment.',
  },
  de: {
    title: 'Verpassen Sie nichts!',
    description:
      'Hinterlassen Sie uns Ihre E-Mail und wir benachrichtigen Sie, wenn MyOutfit verfügbar ist.',
    placeholder: 'Ihre E-Mail',
    button: 'Benachrichtigen',
    success: 'Großartig! Wir benachrichtigen Sie beim Start.',
    error: 'Etwas ist schief gelaufen. Bitte versuchen Sie es erneut.',
    privacy: 'Wir respektieren Ihre Privatsphäre. Abmeldung jederzeit möglich.',
  },
  it: {
    title: 'Non perdertelo!',
    description:
      'Lasciaci la tua email e ti avviseremo quando MyOutfit sarà disponibile.',
    placeholder: 'La tua email',
    button: 'Avvisami',
    success: 'Fantastico! Ti avviseremo al lancio.',
    error: 'Qualcosa è andato storto. Per favore riprova.',
    privacy:
      "Rispettiamo la tua privacy. Annulla l'iscrizione in qualsiasi momento.",
  },
  cs: {
    title: 'Nenechte si to ujít!',
    description:
      'Zanechte nám svůj e-mail a dáme vám vědět, až bude MyOutfit k dispozici.',
    placeholder: 'Váš e-mail',
    button: 'Upozorněte mě',
    success: 'Skvělé! Upozorníme vás při spuštění.',
    error: 'Něco se pokazilo. Prosím zkuste to znovu.',
    privacy: 'Respektujeme vaše soukromí. Odběr můžete kdykoliv zrušit.',
  },
};

const SubscribeForm = () => {
  const { language } = useLanguage();
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const iframeId = 'mc-subscribe-iframe';
    let iframe = document.getElementById(iframeId);
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.id = iframeId;
      iframe.name = iframeId;
      document.body.appendChild(iframe);
    }

    try {
      const form = document.createElement('form');
      form.method = 'post';
      form.action = MAILCHIMP_URL;
      form.target = iframeId;
      form.style.display = 'none';

      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'EMAIL';
      emailInput.value = email;
      form.appendChild(emailInput);

      const hiddenField = document.createElement('input');
      hiddenField.type = 'text';
      hiddenField.name = 'b_a4109ff02e4a53e82e22d2824_dd2ff0aa16';
      hiddenField.value = '';
      hiddenField.style.position = 'absolute';
      hiddenField.style.left = '-5000px';
      hiddenField.setAttribute('aria-hidden', 'true');
      form.appendChild(hiddenField);

      document.body.appendChild(form);
      form.submit();

      setTimeout(() => {
        setStatus('success');
        setEmail('');
        setLoading(false);
        document.body.removeChild(form);
      }, 1500);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setLoading(false);
    }
  };

  return (
    <div className={styles.subscribeContainer}>
      <h2 className={styles.title}>{t.title}</h2>
      <p className={styles.description}>{t.description}</p>

      {status === 'success' ? (
        <div className={`${styles.alertSuccess} ${styles.animateIn}`}>
          {t.success}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder={t.placeholder}
              required
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : (
                t.button
              )}
            </button>
          </div>
          {status === 'error' && (
            <div className={styles.alertError}>{t.error}</div>
          )}
          <small className={styles.privacy}>{t.privacy}</small>
        </form>
      )}
    </div>
  );
};

export default SubscribeForm;
