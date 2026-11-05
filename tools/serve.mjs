// Serveur statique minimal pour les tests (aucune dépendance).
// Sert le dépôt tel quel, sur le modèle de GitHub Pages (dossier -> index.html).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const port = Number(process.argv[2] || 8765);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".ico": "image/x-icon"
};

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    let filePath = normalize(join(root, urlPath));

    // Refuse toute sortie du répertoire servi.
    if (!filePath.startsWith(root)) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("403");
      return;
    }

    let info = await stat(filePath).catch(() => null);
    if (info && info.isDirectory()) {
      filePath = join(filePath, "index.html");
      info = await stat(filePath).catch(() => null);
    }

    if (!info) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      res.end("<!DOCTYPE html><title>404</title><h1>404</h1>");
      return;
    }

    const body = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(body);
  } catch {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("500");
  }
});

server.listen(port, () => {
  console.log(`Serveur de test : http://localhost:${port}/`);
});
