const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

function safeTrim(v) {
  return (v || "").toString().trim();
}

module.exports = async (req, res) => {
  // CORS (optional, but safe)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

  try {
    // Vercel sometimes gives body as object, sometimes as string
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});

    // NOTE: In Resend testing mode you can only send to your Resend account email.
    // Once you verify a domain in Resend, set LEADS_TO_EMAIL to your preferred inbox (e.g. contactcrownforgedigital@gmail.com).
    const to = process.env.LEADS_TO_EMAIL || "contactcrownforgedigital@gmail.com";
    const from = "CrownForge Leads <no-reply@crownforgedigital.com>";

    const email = safeTrim(body.email);
    const phone = safeTrim(body.phone);

  // Send ONLY after: description + business type + (email OR phone)
const description = safeTrim(body.description);
const businessType = safeTrim(body.businessType);

if (!description) {
  return res.status(400).json({ ok: false, error: "Missing description" });
}
if (!businessType) {
  return res.status(400).json({ ok: false, error: "Missing business type" });
}
if (!email) {
  return res.status(400).json({ ok: false, error: "Missing email" });
}

    const subject = `New CrownForge Lead — ${safeTrim(body.businessType) || "Website Inquiry"}${
      safeTrim(body.location) ? ` (${safeTrim(body.location)})` : ""
    }`;

    const pages = Array.isArray(body.pages) ? body.pages.join(", ") : safeTrim(body.pages);
    const features = Array.isArray(body.features) ? body.features.join(", ") : safeTrim(body.features);

    const transcriptArr = Array.isArray(body.transcript) ? body.transcript : [];
    const transcript = transcriptArr
      .slice(-14)
      .map((m) => `${String(m.role || "").toUpperCase()}: ${String(m.content || "")}`)
      .join("\n");

    const maintenanceText =
      body.maintenance === true ? "Yes" : body.maintenance === false ? "No" : "Not specified";

      const text = [
      `Name: ${safeTrim(body.name) || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      `Phone: ${phone || "Not provided"}`,
      `Description: ${safeTrim(body.description) || "Not provided"}`,
      `Location: ${safeTrim(body.location) || "Not provided"}`,
      `Business Type: ${safeTrim(body.businessType) || "Not provided"}`,
      `Pages Requested: ${pages || "Not provided"}`,
      `Features Requested: ${features || "Not provided"}`,
      `Timeline: ${safeTrim(body.timeline) || "Not provided"}`,
      `Budget: ${safeTrim(body.budget) || "Not provided"}`,
      `Maintenance Plan: ${maintenanceText}`,
      `Notes: ${safeTrim(body.notes) || "None"}`,
      ``,
      `Recent Transcript:`,
      transcript || "(none)",
    ].join("\n");

    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: email || undefined,
      subject,
      text,
    });

    if (error) {
      console.error("Resend error:", error);
      return res
        .status(500)
        .json({ ok: false, error: error.message || String(error) });
    }

    return res.status(200).json({ ok: true, id: data?.id || null });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err?.message || "Server error" });
  }
};