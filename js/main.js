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
  var nav = document.querySelector(".site-nav");

  if (toggle && menu && nav) {
    // Une seule source de vérité pour l'état ouvert/fermé (classe + ARIA).
    function setMenuOpen(isOpen) {
      menu.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isOpen ? "Fermer le menu" : "Ouvrir le menu"
      );
    }

    toggle.addEventListener("click", function () {
      setMenuOpen(!menu.classList.contains("open"));
    });

    // Fermer le menu après un clic sur un lien
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setMenuOpen(false);
      }
    });

    // Fermer le menu avec la touche Échap
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    // Fermer le menu en cliquant ou en touchant hors de la navigation
    // (le pattern disclosure attend une fermeture au clic extérieur).
    document.addEventListener("pointerdown", function (event) {
      if (
        menu.classList.contains("open") &&
        !menu.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    });

    // Fermer le menu quand le focus sort complètement de la navigation :
    // la tabulation ne doit pas s'échapper d'un menu ouvert sans le refermer.
    nav.addEventListener("focusout", function (event) {
      if (
        menu.classList.contains("open") &&
        event.relatedTarget &&
        !nav.contains(event.relatedTarget)
      ) {
        setMenuOpen(false);
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
      // Mesure réelle de l'en-tête : avec une taille de texte agrandie
      // (zoom / polices utilisateur), la hauteur dépasse --header-h et le
      // décalage d'ancre doit suivre, pas la valeur CSS statique.
      var header = document.querySelector(".site-header");
      var hauteur = header ? header.offsetHeight : 0;
      if (hauteur > 0) {
        headerOffsetCache = hauteur + 16;
        document.documentElement.style.scrollPaddingTop =
          headerOffsetCache + "px";
      } else {
        headerOffsetCache = 84;
      }
    }
    return headerOffsetCache;
  }

  function setActive(id) {
    navLinks.forEach(function (link) {
      var isActive = id !== "" && link.getAttribute("href") === "#" + id;
      link.classList.toggle("active", isActive);
      // Section courante annoncée aux technologies d'assistance : la couleur
      // seule (WCAG 1.4.1) ne suffit pas pour les lecteurs d'écran.
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
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
  window.addEventListener("resize", function () {
    headerOffsetCache = null;
    updateActive();
  });

  // Un changement de taille de texte ne déclenche pas « resize » : on suit la
  // hauteur réelle de l'en-tête pour invalider le décalage mesuré.
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader && window.ResizeObserver) {
    new ResizeObserver(function () {
      headerOffsetCache = null;
      updateActive();
    }).observe(siteHeader);
  }

  updateActive();

  /* ---------- FAQ ----------
     L'ouverture « une seule réponse à la fois » est gérée nativement par
     l'attribut name="faq" des <details> : aucun JavaScript nécessaire. */

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

    /* ---------- Validation accessible des champs ----------
       Sans JavaScript, le navigateur valide nativement (required, type=email).
       Dès que le script est actif, on reprend la main : message d'erreur
       visible rattaché au champ (aria-describedby), état aria-invalid et
       focus sur le premier champ fautif (RGAA 11.10). */
    form.noValidate = true;

    var FIELDS = [
      {
        el: form.elements["name"],
        ok: function (value) {
          return value.length >= 2;
        },
        message: "Indiquez votre nom et prénom (2 caractères minimum)."
      },
      {
        el: form.elements["email"],
        ok: function (value, el) {
          // Source de vérité : l'API de validation native du navigateur
          // (type="email"), la même que celle utilisée sans JavaScript.
          if (el.validity && el.validity.typeMismatch) {
            return false;
          }
          // Heuristique complémentaire : le navigateur accepte « nom@domaine »
          // sans extension, or une adresse sans point est presque toujours une
          // faute de frappe.
          return /\.[a-z]{2,}$/i.test(value);
        },
        message: "Indiquez une adresse email valide, par exemple nom@domaine.fr."
      },
      {
        el: form.elements["message"],
        ok: function (value) {
          return value.length >= 10;
        },
        message: "Décrivez votre besoin en quelques mots (10 caractères minimum)."
      }
    ].filter(function (field) {
      return field.el;
    });

    function setFieldState(field, message) {
      var errorEl = document.getElementById(field.el.id + "-error");

      if (message) {
        field.el.setAttribute("aria-invalid", "true");
      } else {
        field.el.removeAttribute("aria-invalid");
      }
      if (errorEl) {
        errorEl.textContent = message || "";
      }
    }

    // Valide un champ ; renvoie true si sa valeur est acceptée
    function validateField(field) {
      var isValid = field.ok(field.el.value.trim(), field.el);
      setFieldState(field, isValid ? "" : field.message);
      return isValid;
    }

    // Un champ déjà signalé se nettoie dès qu'il redevient conforme
    FIELDS.forEach(function (field) {
      field.el.addEventListener("input", function () {
        if (field.el.getAttribute("aria-invalid") === "true") {
          validateField(field);
        }
      });
    });

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

    // L'aide sous le formulaire décrit le mode réellement actif
    var hintEl = document.getElementById("form-hint");

    function setHint(isRemote) {
      if (!hintEl) {
        return;
      }
      hintEl.textContent = isRemote
        ? "Vos données (nom, email, message) servent uniquement à vous répondre sous 48 heures ouvrées, via Formspree. "
        : "Ce formulaire ouvre votre logiciel de messagerie avec un message pré-rempli. " +
          "Sans messagerie configurée, écrivez directement à ";

      var link = document.createElement("a");
      if (isRemote) {
        link.href = "confidentialite.html";
        link.textContent = "Politique de confidentialité";
      } else {
        link.href = "mailto:" + DEST;
        link.textContent = DEST;
      }
      hintEl.appendChild(link);
      hintEl.appendChild(document.createTextNode("."));
    }

    setHint(/^https?:\/\//i.test((form.getAttribute("action") || "").trim()));

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

      // Validation : messages visibles, aria-invalid et focus sur le premier
      // champ fautif — les bulles natives ne sont pas personnalisables.
      var champsInvalides = FIELDS.filter(function (field) {
        return !validateField(field);
      });

      if (champsInvalides.length) {
        event.preventDefault();
        setStatus(
          champsInvalides.length === 1
            ? "Un champ est à corriger avant l'envoi."
            : champsInvalides.length + " champs sont à corriger avant l'envoi.",
          "error"
        );
        champsInvalides[0].el.focus();
        return;
      }

      setStatus("", null);

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
            "Merci ! Votre message a bien été envoyé. Je vous réponds sous 48 heures ouvrées.",
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
    var liveEl = document.getElementById("copy-status");

    function feedback(message) {
      btn.textContent = message;

      // Le changement de libellé du bouton n'est pas annoncé de façon fiable
      // par les lecteurs d'écran : la région de statut s'en charge.
      if (liveEl) {
        liveEl.textContent = "";
        window.setTimeout(function () {
          liveEl.textContent = message;
        }, 80);
      }

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
