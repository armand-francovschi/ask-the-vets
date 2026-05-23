import React from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { LiveChatProvider } from "./context/LiveChatContext";
import "./index.css";

function MobileKeyboardOverlayGuard() {
  useEffect(() => {
    const nav = navigator as Navigator & {
      virtualKeyboard?: {
        overlaysContent?: boolean;
        boundingRect?: { height?: number };
        addEventListener?: (type: string, listener: () => void) => void;
        removeEventListener?: (type: string, listener: () => void) => void;
      };
    };

    const viewport = window.visualViewport;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    let focusLockScrollY = 0;
    let isEditableFocused = false;

    const isEditableElement = (target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement => {
      if (!(target instanceof HTMLElement)) return false;

      const tag = target.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target.isContentEditable
      );
    };

    if (nav.virtualKeyboard) {
      nav.virtualKeyboard.overlaysContent = true;
    }

    const applyKeyboardInset = () => {
      const virtualKeyboardHeight = nav.virtualKeyboard?.boundingRect?.height || 0;
      const viewportInset = viewport
        ? Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop))
        : 0;
      const keyboardInset = Math.max(virtualKeyboardHeight, viewportInset);

      document.documentElement.style.setProperty("--kb-inset", `${keyboardInset}px`);
      document.documentElement.classList.toggle("keyboard-open", keyboardInset > 0);

      // iOS Safari can auto-scroll the layout viewport when inputs receive focus.
      // Keep the page anchored while the keyboard is open and an editable element is focused.
      if (isIOS && isEditableFocused && keyboardInset > 0) {
        requestAnimationFrame(() => {
          window.scrollTo({ top: focusLockScrollY, behavior: "auto" });
        });
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      if (!isIOS || !isEditableElement(event.target)) return;

      isEditableFocused = true;
      focusLockScrollY = window.scrollY;
      document.documentElement.classList.add("keyboard-focus-lock");

      requestAnimationFrame(() => {
        window.scrollTo({ top: focusLockScrollY, behavior: "auto" });
      });
    };

    const handleFocusOut = () => {
      if (!isIOS) return;

      isEditableFocused = false;
      window.setTimeout(() => {
        if (!isEditableFocused) {
          document.documentElement.classList.remove("keyboard-focus-lock");
        }
      }, 80);
    };

    applyKeyboardInset();
    viewport?.addEventListener("resize", applyKeyboardInset);
    viewport?.addEventListener("scroll", applyKeyboardInset);
    nav.virtualKeyboard?.addEventListener?.("geometrychange", applyKeyboardInset);
    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("focusout", handleFocusOut);

    return () => {
      viewport?.removeEventListener("resize", applyKeyboardInset);
      viewport?.removeEventListener("scroll", applyKeyboardInset);
      nav.virtualKeyboard?.removeEventListener?.("geometrychange", applyKeyboardInset);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("focusout", handleFocusOut);
      document.documentElement.style.setProperty("--kb-inset", "0px");
      document.documentElement.classList.remove("keyboard-open");
      document.documentElement.classList.remove("keyboard-focus-lock");
    };
  }, []);

  return null;
}

function AutoRefreshOnMutationGuard() {
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    let refreshScheduled = false;

    const shouldSkipRefresh = (url: string, method: string) => {
      if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        return true;
      }

      return (
        /\/auth\//i.test(url) ||
        /\/users\/bookings\/payment\/confirm$/i.test(url) ||
        /\/users\/bookings\/\d+\/pay$/i.test(url)
      );
    };

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl =
        typeof input === "string"
          ? input
          : input instanceof Request
            ? input.url
            : input instanceof URL
              ? input.toString()
              : String(input);

      const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
      const response = await originalFetch(input, init);

      if (!refreshScheduled && response.ok && !shouldSkipRefresh(requestUrl, method)) {
        refreshScheduled = true;
        window.setTimeout(() => {
          window.location.reload();
        }, 120);
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LiveChatProvider>
          <AutoRefreshOnMutationGuard />
          <MobileKeyboardOverlayGuard />
          <App />
        </LiveChatProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
