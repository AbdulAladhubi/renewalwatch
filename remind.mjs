// Load .env ONLY if running locally (safe in GitHub Actions too)
import "dotenv/config";

import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

console.log("🔔 RenewalWatch reminder script started...");

// Validate environment variables
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_KEY ||
  !process.env.RESEND_KEY
) {
  console.error("❌ Missing environment variables.");
  console.error("Required: SUPABASE_URL, SUPABASE_KEY, RESEND_KEY");
  process.exit(1);
}

// Create Supabase client (SERVICE ROLE key)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const RESEND_KEY = process.env.RESEND_KEY;

// -------------------------
// Send Email via Resend
// -------------------------
async function sendEmail(to, subject, html) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "RenewalWatch <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(`Resend error: ${JSON.stringify(result)}`);
  }

  return result;
}

// -------------------------
// Main Logic
// -------------------------
async function main() {
  console.log("📡 Fetching licenses from Supabase...");

  const { data: licenses, error: licError } = await supabase
    .from("licenses")
    .select("*");

  if (licError) {
    console.error("❌ Error fetching licenses:", licError);
    return;
  }

  console.log(`📄 Licenses found: ${licenses.length}`);

  if (licenses.length === 0) {
    console.log("ℹ️ No licenses found. Exiting.");
    return;
  }

  console.log("📡 Fetching notification emails...");

  const { data: emails, error: emailError } = await supabase
    .from("notification_emails")
    .select("*");

  if (emailError) {
    console.error("❌ Error fetching notification emails:", emailError);
    return;
  }

  console.log(`📧 Notification emails found: ${emails.length}`);

  if (emails.length === 0) {
    console.log("ℹ️ No notification emails configured. Exiting.");
    return;
  }

  const today = new Date();
  let emailsSent = 0;

  for (const license of licenses) {
    if (!license.expiry_date) continue;

    const expiryDate = new Date(license.expiry_date);
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    console.log(
      `🔎 Checking "${license.name}" → expires in ${daysLeft} day(s)`
    );

    if (![30, 7, 1].includes(daysLeft)) continue;

    for (const recipient of emails) {
      const html = `
        <h2>License Expiry Alert</h2>
        <p><strong>${
          license.name
        }</strong> will expire in <b>${daysLeft} day(s)</b>.</p>
        <ul>
          <li><b>Vendor:</b> ${license.vendor || "N/A"}</li>
          <li><b>Cost:</b> ${license.cost || "N/A"}</li>
          <li><b>Auto-Renew:</b> ${license.auto_renew ? "Yes" : "No"}</li>
        </ul>
        <p>
          <a href="${license.renewal_url}" target="_blank">
            Renew License
          </a>
        </p>
        <hr />
        <small>RenewalWatch – automated reminder</small>
      `;

      try {
        await sendEmail(
          recipient.email,
          `🚨 License Expiring: ${license.name}`,
          html
        );
        emailsSent++;
        console.log(
          `✅ Email sent to ${recipient.email} for "${license.name}"`
        );
      } catch (err) {
        console.error(
          `❌ Failed to send email to ${recipient.email}:`,
          err.message
        );
      }
    }
  }

  console.log(`📬 Emails sent: ${emailsSent}`);
  console.log("✅ Reminder script completed.");
}

// Run
main().catch((err) => {
  console.error("🔥 Unexpected error:", err);
  process.exit(1);
});
