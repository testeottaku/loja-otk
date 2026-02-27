// Vercel Serverless Function: gera HTML com meta tags OG dinâmicas para preview (WhatsApp/Instagram/etc.)
// Rota: /produto/:id  -> rewrite em vercel.json para /api/produto?id=:id
const fs = require("fs");
const path = require("path");

function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Firestore REST -> JS simples (só o necessário)
function decodeFirestoreValue(v) {
  if (!v || typeof v !== "object") return undefined;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return Number(v.doubleValue);
  if ("booleanValue" in v) return !!v.booleanValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("nullValue" in v) return null;
  if ("mapValue" in v) {
    const out = {};
    const fields = (v.mapValue && v.mapValue.fields) || {};
    for (const k of Object.keys(fields)) out[k] = decodeFirestoreValue(fields[k]);
    return out;
  }
  if ("arrayValue" in v) {
    const values = (v.arrayValue && v.arrayValue.values) || [];
    return values.map(decodeFirestoreValue);
  }
  return undefined;
}

async function fetchProduct({ projectId, apiKey, id }) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/products/${encodeURIComponent(id)}?key=${encodeURIComponent(apiKey)}`;
  const r = await fetch(url, { headers: { "accept": "application/json" } });
  if (!r.ok) return null;
  const data = await r.json();
  const fields = (data && data.fields) || {};
  const obj = {};
  for (const k of Object.keys(fields)) obj[k] = decodeFirestoreValue(fields[k]);
  obj.id = id;
  return obj;
}

module.exports = async (req, res) => {
  try {
    const id = (req.query && req.query.id) ? String(req.query.id) : "";
    const templatePath = path.join(process.cwd(), "produto.html");
    const template = fs.readFileSync(templatePath, "utf8");

    // Lê config do próprio script.js (pública)
    const scriptPath = path.join(process.cwd(), "script.js");
    const script = fs.readFileSync(scriptPath, "utf8");
    const apiKeyMatch = script.match(/apiKey:\s*"([^"]+)"/);
    const projectIdMatch = script.match(/projectId:\s*"([^"]+)"/);
    const apiKey = apiKeyMatch ? apiKeyMatch[1] : "";
    const projectId = projectIdMatch ? projectIdMatch[1] : "";

    // base URL para og:url
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers["x-forwarded-host"] || req.headers["host"] || "";
    const baseUrl = `${proto}://${host}`.replace(/\/+$/,"");
    const pageUrl = `${baseUrl}/produto/${encodeURIComponent(id)}`;

    let name = "Produto";
    let description = "Confira esse produto na OttakuBrasil Store.";
    let image = "";

    if (id && apiKey && projectId) {
      const p = await fetchProduct({ projectId, apiKey, id });
      if (p) {
        name = (p.name || "Produto");
        description = (p.description && String(p.description).trim()) ? String(p.description).trim() : description;

        // images pode vir como array de strings
        const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
        image = imgs[0] || "";
      }
    }

    // fallback de imagem (usa a mesma do normalizeProduct)
    if (!image) {
      image = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1200";
    }

    const og = [
      `<meta property="og:type" content="product">`,
      `<meta property="og:site_name" content="OttakuBrasil Store">`,
      `<meta property="og:title" content="${escapeHtml(name)}">`,
      `<meta property="og:description" content="${escapeHtml(description)}">`,
      `<meta property="og:url" content="${escapeHtml(pageUrl)}">`,
      `<meta property="og:image" content="${escapeHtml(image)}">`,
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${escapeHtml(name)}">`,
      `<meta name="twitter:description" content="${escapeHtml(description)}">`,
      `<meta name="twitter:image" content="${escapeHtml(image)}">`,
      `<link rel="canonical" href="${escapeHtml(pageUrl)}">`,
    ].join("\n  ");

    // injeta OG tags no <head>
    let html = template;

    // atualiza title + injeta og logo depois do title
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(name)} • OttakuBrasil Store</title>\n  ${og}`);

    // dica pro client: garantir que o script pegue o id sem depender de parsing estranho
    // (não quebra nada se o script ignorar)
    html = html.replace(/<\/head>/i, `  <script>window.__PRODUCT_ID__ = ${JSON.stringify(id)};</script>\n</head>`);

    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(html);
  } catch (e) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(`<!doctype html><html><head><meta charset="utf-8"><title>Produto • OttakuBrasil Store</title></head><body></body></html>`);
  }
};
