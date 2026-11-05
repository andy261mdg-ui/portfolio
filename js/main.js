/* ==========================================================================
   Portfolio — Andy Rakotondrabe
   Interactions : menu mobile, scrollspy, FAQ (fermeture des autres),
   formulaire de contact (envoi direct + repli mailto), année du pied de page.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Année du pied de page ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("nav-toggle");
  var menu = document.getElementById("menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu"
      );
    });

    // Fermer le menu après un clic sur un lien
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      }
    });

    // Fermer le menu avec la touche Échap
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
        toggle.focus();
      }
    });
  }

  /* ---------- Scrollspy : lien actif ---------- */
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-list a[href^="#"]')
  );
  var orderedSections = [];

  navLinks.forEach(function (link) {
    var id = link.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el && orderedSections.indexOf(el) === -1) {
      orderedSections.push(el);
    }
  });

  var headerOffsetCache = null;
  function getHeaderOffset() {
    if (headerOffsetCache === null) {
      var v = parseFloat(
        window.getComputedStyle(document.documentElement).scrollPaddingTop
      );
      headerOffsetCache = isNaN(v) ? 84 : v;
    }
    return headerOffsetCache;
  }

  function setActive(id) {
    navLinks.forEach(function (link) {
      var isActive = id !== "" && link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", isActive);
    });
  }

  function updateActive() {
    if (!orderedSections.length) {
      return;
    }
    var line = window.scrollY + getHeaderOffset() + 8;
    var currentId = "";
    orderedSections.forEach(function (el) {
      if (el.offsetTop <= line) {
        currentId = el.id;
      }
    });
    setActive(currentId);
  }

  window.addEventListener("scroll", updateActive, { passive: true });
  window.addEventListener("resize", updateActive);
  updateActive();

  /* ---------- FAQ : une seule réponse ouverte à la fois ---------- */
  var faqItems = Array.prototype.slice.call(
    document.querySelectorAll(".faq-item")
  );
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) {
          if (other !== item) {
            other.open = false;
          }
        });
      }
    });
  });

  /* ---------- Formulaire de contact → envoi direct (repli mailto) ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var DEST = "andy261mdg@gmail.com";
    var TIMEOUT = 10000;
    var statusEl = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn ? submitBtn.textContent : "";

    function setStatus(message, state) {
      if (!statusEl) {
        return;
      }
      statusEl.textContent = message;
      if (state) {
        statusEl.setAttribute("data-state", state);
      } else {
        statusEl.removeAttribute("data-state");
      }
    }

    function setSending(isSending) {
      if (!submitBtn) {
        return;
      }
      submitBtn.disabled = isSending;
      submitBtn.textContent = isSending ? "Envoi en cours…" : submitLabel;
    }

    function buildMailto(name, email, subject, message) {
      var body =
        "Bonjour Andy,\n\n" +
        message +
        "\n\n— " +
        (name || "Visiteur") +
        "\n" +
        email;

      return (
        "mailto:" +
        DEST +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body)
      );
    }

    // Repli : message d'échec + lien mailto pré-rempli, prêt à cliquer
    function showError(mailto) {
      if (!statusEl) {
        return;
      }
      statusEl.textContent = "L'envoi n'a pas abouti. Écrivez-moi directement : ";
      var link = document.createElement("a");
      link.href = mailto;
      link.textContent = DEST;
      statusEl.appendChild(link);
      statusEl.appendChild(
        document.createTextNode(" (le lien ouvre votre messagerie).")
      );
      statusEl.setAttribute("data-state", "error");
    }

    form.addEventListener("submit", function (event) {
      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var subject =
        form.elements["subject"].value.trim() ||
        "Prise de contact via le portfolio";
      var message = form.elements["message"].value.trim();

      // Champ leurre rempli → robot : on ignore la soumission en silence
      var trap = form.elements["_gotcha"];
      if (trap && trap.value) {
        event.preventDefault();
        setStatus("", null);
        form.reset();
        return;
      }

      var endpoint = (form.getAttribute("action") || "").trim();
      var hasRemoteEndpoint = /^https?:\/\//i.test(endpoint);

      // Service d'envoi non configuré ou fetch indisponible → mailto
      if (!hasRemoteEndpoint || typeof window.fetch !== "function") {
        event.preventDefault();
        setStatus(
          "Votre logiciel de messagerie va s'ouvrir avec le message pré-rempli. " +
            "Rien ne se passe ? Écrivez directement à " +
            DEST +
            ".",
          null
        );
        window.location.href = buildMailto(name, email, subject, message);
        return;
      }

      event.preventDefault();
      setSending(true);
      setStatus("Envoi en cours…", null);

      var mailto = buildMailto(name, email, subject, message);
      var payload = new FormData(form);
      payload.set("_subject", "[Portfolio] " + subject);

      var controller =
        typeof AbortController === "function" ? new AbortController() : null;
      var timer = window.setTimeout(function () {
        if (controller) {
          controller.abort();
        }
      }, TIMEOUT);

      window
        .fetch(endpoint, {
          method: "POST",
          body: payload,
          headers: { Accept: "application/json" },
          signal: controller ? controller.signal : undefined
        })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("HTTP " + response.status);
          }
          return response.json().catch(function () {
            return {};
          });
        })
        .then(function () {
          window.clearTimeout(timer);
          setSending(false);
          form.reset();
          setStatus(
            "Merci ! Votre message a bien été envoyé. Je vous réponds sous 24 à 48 h ouvrées.",
            "success"
          );
        })
        .catch(function () {
          window.clearTimeout(timer);
          setSending(false);
          showError(mailto);
        });
    });
  }

  /* ---------- Copie de l'adresse email ---------- */
  var copyButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-copy]")
  );

  copyButtons.forEach(function (btn) {
    var initialLabel = btn.textContent;
    var timer = null;

    function feedback(message) {
      btn.textContent = message;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        btn.textContent = initialLabel;
      }, 2600);
    }

    // Repli classique : champ temporaire + document.execCommand("copy")
    function legacyCopy(value) {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      document.body.appendChild(field);
      field.select();

      var copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(field);
      return copied;
    }

    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy") || "";
      if (!value) {
        return;
      }

      function afterFailure() {
        feedback(
          legacyCopy(value)
            ? "Adresse copiée !"
            : "Copie impossible, sélectionnez l'adresse"
        );
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(
          function () {
            feedback("Adresse copiée !");
          },
          afterFailure
        );
        return;
      }

      afterFailure();
    });
  });
})();
