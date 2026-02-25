module.exports = (req, res) => {
  const waNumber = process.env.WHATSAPP_NUMBER;

  if (!waNumber) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Falta configurar WHATSAPP_NUMBER en Vercel.");
    return;
  }

  const rawMessage = typeof req.query.m === "string" ? req.query.m : "";
  const message = rawMessage.slice(0, 1200);
  const target = `https://wa.me/${waNumber}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  res.writeHead(307, { Location: target });
  res.end();
};
