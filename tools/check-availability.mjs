// Garde-fou du protocole de disponibilité : le statut affiché dans le hero est
// l'état canonique (lu dans la classe de .hero-availability). Il doit être repris
// à l'identique partout où le site en parle — liste de contact, FAQ visible, FAQ
// JSON-LD, availability des 5 offres, llms.txt. Tout écart = code 1 (CI bloquée).
//
// Changer d'état : README « Protocole de disponibilité (3 états) ».
// Les textes de référence sont dans tools/availability-states.json.
import { readFileSync } from "node:fs";

const ETATS = JSON.parse(readFileSync("tools/availability-states.json", "utf8"));
const CLES = Object.keys(ETATS);

const normaliser = (texte) => texte.replace(/\s+/g, " ").trim();
const lire = (fichier) => readFileSync(fichier, "utf8");

const erreurs = [];
const html = lire("index.html");

// 1. État canonique : la classe du badge hero.
const badge = html.match(/<p class="hero-availability([^"]*)">([^<]*)<\/p>/);
let etatCourant = null;

if (!badge) {
  erreurs.push("Badge .hero-availability introuvable dans index.html.");
} else {
  const modificateur = badge[1].trim();
  etatCourant = CLES.find((cle) => ETATS[cle].modificateur === modificateur) || null;
  if (!etatCourant) {
    erreurs.push(
      `Modificateur de badge inconnu : « ${modificateur || "(aucun)"} » — ` +
        `valeurs attendues : ${CLES.map((c) => ETATS[c].modificateur || "(aucun)").join(", ")}.`
    );
  }
}

if (etatCourant) {
  const attendu = ETATS[etatCourant];
  console.log(`Garde-fou de la disponibilité — état détecté : ${etatCourant}`);

  const verifier = (nom, obtenu, attenduTexte) => {
    if (obtenu !== attenduTexte) {
      erreurs.push(`${nom} : « ${obtenu} » ≠ « ${attenduTexte} »`);
    } else {
      console.log(`  OK  ${nom}`);
    }
  };

  // 2. Texte du badge lui-même.
  verifier("badge hero", normaliser(badge[2]), normaliser(attendu.texte));

  // 3. Liste de contact.
  const contact = html.match(
    /<span class="contact-label">Disponibilité<\/span>\s*<span class="contact-value">([^<]*)<\/span>/
  );
  verifier(
    "liste de contact",
    contact ? normaliser(contact[1]) : "(introuvable)",
    normaliser(attendu.texte)
  );

  // 4. Réponse de la FAQ (contenu visible).
  const faqHtml = html.match(
    /<summary>Êtes-vous disponible pour de nouvelles missions \?<\/summary>\s*<div class="faq-answer">\s*<p>([\s\S]*?)<\/p>/
  );
  verifier(
    "réponse FAQ (HTML)",
    faqHtml ? normaliser(faqHtml[1]) : "(introuvable)",
    normaliser(attendu.reponseFaq)
  );

  // 5. FAQ JSON-LD + availability des 5 offres (même bloc de données).
  let reponseJsonLd = "(bloc JSON-LD introuvable)";
  let offres = [];
  for (const bloc of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    let donnees;
    try {
      donnees = JSON.parse(bloc[1]);
    } catch {
      continue;
    }
    const graphe = donnees["@graph"] || [donnees];
    const faq = graphe.find((n) => n["@type"] === "FAQPage");
    if (faq) {
      const question = (faq.mainEntity || []).find((q) =>
        /disponible pour de nouvelles missions/i.test(q.name)
      );
      if (question && question.acceptedAnswer) {
        reponseJsonLd = normaliser(question.acceptedAnswer.text);
      }
    }
    for (const noeud of graphe) {
      const catalogue = noeud.hasOfferCatalog;
      if (catalogue && Array.isArray(catalogue.itemListElement)) {
        offres = catalogue.itemListElement.map((offre) => offre.availability || "(absente)");
      }
    }
  }
  verifier("réponse FAQ (JSON-LD)", reponseJsonLd, normaliser(attendu.reponseFaq));

  verifier(
    "5 offres JSON-LD (availability)",
    offres.join(", ") || "(introuvable)",
    Array.from({ length: 5 }, () => attendu.schema).join(", ")
  );

  // 6. llms.txt : exactement un seul des trois libellés, et le bon.
  const llms = lire("llms.txt");
  const presents = CLES.filter((cle) => llms.includes(ETATS[cle].texte));
  if (presents.length !== 1 || presents[0] !== etatCourant) {
    erreurs.push(
      `llms.txt : libellé(s) de disponibilité trouvé(s) : ${
        presents.length ? presents.join(", ") : "(aucun)"
      } — attendu uniquement « ${etatCourant} » (${attendu.texte}).`
    );
  } else {
    console.log("  OK  llms.txt");
  }
}

if (erreurs.length) {
  console.error("Garde-fou de la disponibilité : ECHEC");
  for (const e of erreurs) console.error(" - " + e);
  console.error(
    "Procédure : README « Protocole de disponibilité (3 états) » — textes de référence dans tools/availability-states.json."
  );
  process.exit(1);
}

console.log("Garde-fou de la disponibilité : OK");
