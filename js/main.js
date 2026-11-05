/* ==========================================================================
   Portfolio — Andy Rakotondrabe
   Interactions : menu mobile, scrollspy, FAQ (fermeture des autres),
   formulaire mailto, année du pied de page.
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

  /* ---------- Formulaire de contact → mailto ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var DEST = "andy261mdg@gmail.com";

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var name = form.elements["name"].value.trim();
      var email = form.elements["email"].value.trim();
      var subject =
        form.elements["subject"].value.trim() ||
        "Prise de contact via le portfolio";
      var message = form.elements["message"].value.trim();

      var body =
        "Bonjour Andy,\n\n" +
        message +
        "\n\n— " +
        (name || "Visiteur") +
        "\n" +
        email;

      var mailto =
        "mailto:" +
        DEST +
        "?subject=" +
        encodeURIComponent(subject) +
        "&body=" +
        encodeURIComponent(body);

      window.location.href = mailto;
    });
  }
})();
