// remind.mjs
import "dotenv/config";
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

// --- Supabase setup ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// --- Resend setup ---
const RESEND_KEY = process.env.RESEND_KEY;

async function sendEmail(to, subject, html) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "RenewalWatch <onboarding@resend.dev>", // Change to verified domain in production
        to: [to],
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }

    console.log(`✅ Email sent to ${to} for "${subject}"`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
  }
}

// --- Main function ---
async function runReminder() {
  console.log("🔔 RenewalWatch reminder script started...");

  // Fetch licenses
  const { data: licenses, error: licensesError } = await supabase
    .from("licenses")
    .select("*")
    .order("expiry_date", { ascending: true });

  if (licensesError) {
    console.error(
      "❌ Supabase error fetching licenses:",
      licensesError.message
    );
    return;
  }

  console.log(`📄 Licenses found: ${licenses.length}`);

  // Fetch notification emails
  const { data: emails, error: emailsError } = await supabase
    .from("notification_emails")
    .select("*");

  if (emailsError) {
    console.error("❌ Supabase error fetching emails:", emailsError.message);
    return;
  }

  console.log(`📧 Notification emails found: ${emails.length}`);

  const today = new Date();
  let emailsSent = 0;

  for (const license of licenses) {
    if (!license.expiry_date) continue;

    const expiryDate = new Date(license.expiry_date);
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    // Only send reminders 30, 7, or 1 day(s) before expiry
    if (![30, 7, 1].includes(daysLeft)) continue;

    for (const recipient of emails) {
      const subject = `🚨 License Expiring: ${license.name}`;
      const html = `
        <p><strong>${
          license.name
        }</strong> is expiring in <strong>${daysLeft} day(s)</strong>.</p>
        <p>Vendor: ${license.vendor || "N/A"}<br>
        Expiry Date: ${license.expiry_date}<br>
        Renewal URL: <a href="${license.renewal_url}" target="_blank">${
        license.renewal_url
      }</a></p>
        <p>Notes: ${license.notes || "None"}</p>
      `;

      await sendEmail(recipient.email, subject, html);
      emailsSent++;
    }
  }

  console.log(`📬 Total emails sent: ${emailsSent}`);
  console.log("✅ Reminder script completed.");
}

// Run the script
runReminder();
