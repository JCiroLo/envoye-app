const escapeHtml = (value = "") =>
  value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );

const formatEventDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "full" }).format(date);
};

export default async function handler(request, response) {
  const accessCode = String(request.query.accessCode ?? "")
    .trim()
    .toUpperCase();
  const apiUrl = process.env.VITE_API_URL;
  const protocol = request.headers["x-forwarded-proto"] || "https";
  const appUrl = process.env.PUBLIC_APP_URL || `${protocol}://${request.headers.host}`;
  const inviteUrl = `${appUrl.replace(/\/$/, "")}/invite/${encodeURIComponent(accessCode)}`;

  let event = null;
  if (/^[A-Z0-9]{6,12}$/.test(accessCode) && apiUrl) {
    try {
      const apiResponse = await fetch(`${apiUrl.replace(/\/$/, "")}/api/public/events/${accessCode}`);
      if (apiResponse.ok) ({ event } = await apiResponse.json());
    } catch {
      // A generic preview is preferable to failing the crawler request.
    }
  }

  const name = event?.name ?? "Tienes una invitación";
  const date = formatEventDate(event?.event_date);
  const welcomeMessage = event?.welcome_message_text?.trim();
  const description = welcomeMessage
    ? `${welcomeMessage}${date ? ` · ${date}` : ""}`
    : date
      ? `Te invitan a un evento el ${date}.`
      : "Abre tu invitación para conocer todos los detalles.";
  const title = `${name} | Envoye`;
  const image = event?.cover_url ?? "https://images.pexels.com/photos/34997591/pexels-photo-34997591.jpeg";

  response.setHeader("Content-Type", "text/html; charset=utf-8");
  response.setHeader("Cache-Control", "public, max-age=300, s-maxage=300");
  response.status(200).send(`<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${escapeHtml(inviteUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Envoye" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(inviteUrl)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
  </head>
  <body><p>${escapeHtml(description)}</p></body>
</html>`);
}
