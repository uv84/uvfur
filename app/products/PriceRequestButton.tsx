"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createPriceRequest, type PriceRequestState } from "./actions";

const initialState: PriceRequestState = {};

export function PriceRequestButton({
  productId,
  productName,
  variant = "default",
}: {
  productId: string;
  productName: string;
  variant?: "default" | "featured";
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <>
      <button
        className={`catalog-ask-price${variant === "featured" ? " product-price-request" : ""}`}
        onClick={() => setIsOpen(true)}
        ref={triggerRef}
        type="button"
      >
        {variant === "featured" ? (
          <>
            <svg
              aria-hidden="true"
              className="product-price-request-icon"
              fill="none"
              viewBox="0 0 32 32"
            >
              <path
                d="M4 13V5h8l15 15-7 7L4 13Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <circle cx="9" cy="10" r="1.5" fill="currentColor" />
            </svg>
            <span>Request a Better Price</span>
            <span aria-hidden="true" className="product-price-request-arrow">→</span>
          </>
        ) : (
          <>Ask for a better price <span aria-hidden="true">↗</span></>
        )}
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <PriceRequestDialog
            onClose={closeDialog}
            productId={productId}
            productName={productName}
          />,
          document.body,
        )}
    </>
  );
}

function PriceRequestDialog({
  onClose,
  productId,
  productName,
}: {
  onClose: () => void;
  productId: string;
  productName: string;
}) {
  const [state, formAction, pending] = useActionState(createPriceRequest, initialState);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (state.whatsappUrl && !state.whatsappNotificationError) {
      window.location.assign(state.whatsappUrl);
    }
  }, [state.whatsappUrl, state.whatsappNotificationError]);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, pending]);

  return (
    <div
      className="price-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onClose();
      }}
      role="presentation"
    >
      <section
        aria-labelledby="price-request-title"
        aria-modal="true"
        className="price-modal"
        role="dialog"
      >
        <button
          aria-label="Close price request"
          className="price-modal-close"
          disabled={pending}
          onClick={onClose}
          ref={closeButtonRef}
          type="button"
        >
          ×
        </button>

        {state.message ? (
          <div className="price-request-success" role="status">
            <span aria-hidden="true">✓</span>
            <h2 id="price-request-title">Request received.</h2>
            <p>{state.message}</p>
            {state.whatsappNotificationError && state.whatsappUrl && (
              <>
                <p className="price-request-error" role="alert">
                  {state.whatsappNotificationError}
                </p>
                <a className="price-request-submit" href={state.whatsappUrl}>
                  Continue to WhatsApp <span aria-hidden="true">↗</span>
                </a>
              </>
            )}
            <button className="price-request-submit" onClick={onClose} type="button">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">A better price, personally.</p>
            <h2 id="price-request-title">Let&apos;s talk about <em>your appliance.</em></h2>
            <p className="price-modal-product">{productName}</p>
            <form action={formAction} className="price-request-form">
              <input name="productId" type="hidden" value={productId} />
              <label>
                Full name
                <input autoComplete="name" maxLength={120} name="fullName" required />
              </label>
              <label>
                Phone number
                <input
                  autoComplete="tel"
                  maxLength={20}
                  name="phone"
                  placeholder="+91 98765 43210"
                  required
                  type="tel"
                />
              </label>
              <label>
                Email address
                <input
                  autoComplete="email"
                  maxLength={254}
                  name="email"
                  required
                  type="email"
                />
              </label>
              {state.error && <p className="price-request-error" role="alert">{state.error}</p>}
              <button className="price-request-submit" disabled={pending} type="submit">
                {pending ? "Saving your request…" : "Continue to WhatsApp"}
                {!pending && <span aria-hidden="true">↗</span>}
              </button>
              <p className="price-request-privacy">
                Your contact details are saved with your request and shared with our team via WhatsApp to follow up.
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
