import type { Metadata } from "next";
import Link from "next/link";
import { BrandLogo } from "../BrandLogo";
import "./contact-us.css";

export const metadata: Metadata = {
  title: "Contact Us | Appliance Studio",
  description:
    "Get in touch by phone, fax, or email, and find location details and directions.",
};

const contact = {
  phone: "123456789",
  fax: "123456789",
  email: "example.com",
};

const address = "1,abc, maharashtra, india";
const directionsUrl =
  "https://www.google.com/maps/dir//mumbai+location/data=!4m6!4m5!1m1!4e2!1m2!1m1!1s0x3be7c6306644edc1:0x5da4ed8f8d648c69?sa=X&ved=1t:155782&ictx=111";
const mapEmbedUrl = new URL("https://maps.google.com/maps");
mapEmbedUrl.searchParams.set("q", address);
mapEmbedUrl.searchParams.set("output", "embed");

const contactMethods = [
  {
    label: "Phone",
    value: contact.phone,
    href: `tel:${contact.phone}`,
    note: "Call our team",
    icon: "01",
  },
  {
    label: "Fax",
    value: contact.fax,
    note: "Send us a fax",
    icon: "02",
  },
  {
    label: "Email",
    value: contact.email,
    href: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
      ? `mailto:${contact.email}`
      : undefined,
    note: "Write to us",
    icon: "03",
  },
];

export default function ContactPage() {
  return (
    <main className="contact-page">
      <div className="topline">
        <span>Appliance Studio</span>
        <span>Here to help you find the right appliance</span>
      </div>

      <header className="site-header">
        <Link className="brand" href="/" aria-label="Beingstones home">
          <BrandLogo priority />
        </Link>

        <nav className="main-nav" aria-label="Page navigation">
          <a href="#contact-details">Contact</a>
          <a href="#location">Location Details</a>
          <a href="#directions">Maps &amp; Directions</a>
        </nav>

        <a className="header-link" href={directionsUrl} target="_blank" rel="noreferrer">
          Get directions <span aria-hidden="true">↗</span>
        </a>
      </header>

      <section className="page-hero" id="top">
        <div className="hero-art" aria-hidden="true">
          <div className="hero-art-inner"></div>
          <span className="hero-art-caption">A good conversation is a great place to start.</span>
        </div>
        <div className="contact-hero-copy">
          <p className="eyebrow"><span></span> Contact us</p>
          <h1>We&apos;re here<br />to <em>help.</em></h1>
          <p className="hero-description">
            Have a question, a project in mind, or just want to say hello?
            We&apos;d love to hear from you.
          </p>
          <a className="scroll-link" href="#contact-details">
            Find the right way to reach us <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="contact-hero-index" aria-hidden="true">01 <span></span> 03</div>
      </section>

      <section className="contact-section" id="contact-details">
        <div className="contact-section-heading">
          <div>
            <p className="eyebrow">Let&apos;s connect</p>
            <h2>Phone / Fax / <em>Email</em></h2>
          </div>
          <p className="section-intro">
            Our team is ready to help. Choose the best way to get in touch.
          </p>
        </div>

        <div className="contact-grid">
          {contactMethods.map((method) => (
            <article className="contact-card" key={method.label}>
              <span className="contact-number">{method.icon}</span>
              <span className="contact-symbol" aria-hidden="true">
                {method.label === "Phone" ? "↗" : method.label === "Fax" ? "⌁" : "✉"}
              </span>
              <div className="contact-card-content">
                <h3>{method.label}</h3>
                {method.href ? (
                  <a className="contact-value" href={method.href}>{method.value}</a>
                ) : (
                  <p className="contact-value">{method.value}</p>
                )}
                <p className="contact-note">{method.note}</p>
              </div>
              {method.href && (
                <a className="card-arrow" href={method.href} aria-label={`${method.note}: ${method.value}`}>
                  ↗
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="location-section" id="location">
        <div className="location-copy">
          <p className="eyebrow">Come see us</p>
          <h2>Location<br /><em>Details</em></h2>
          <p className="location-intro">
            We look forward to welcoming you. Find us at the address below.
          </p>
          <div className="address-block">
            <span className="address-icon" aria-hidden="true">⌖</span>
            <div>
              <h3>Our location</h3>
              <address>{address}</address>
            </div>
          </div>
          <a className="directions-button" href={directionsUrl} target="_blank" rel="noreferrer">
            Maps and directions <span aria-hidden="true">↗</span>
          </a>
        </div>
        <div className="map-frame" id="directions">
          <iframe
            src={mapEmbedUrl.toString()}
            title={`Map showing ${address}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-label">
            <span className="map-pin" aria-hidden="true">⌖</span>
            <div>
              <strong>Appliance Studio</strong>
              <span>{address}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <Link className="brand footer-brand" href="/" aria-label="Beingstones home">
          <BrandLogo />
        </Link>
        <p>Better appliances. Personal service.</p>
        <a href="#top">Back to top <span aria-hidden="true">↑</span></a>
      </footer>
    </main>
  );
}
