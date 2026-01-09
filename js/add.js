import { supabase } from "./supabase.js";
import { protect } from "./auth.js";

await protect();

form.onsubmit = async (e) => {
  e.preventDefault();

  await supabase.from("licenses").insert([
    {
      name: name.value,
      vendor: vendor.value,
      purchase_date: purchase.value,
      expiry_date: expiry.value,
      cost: cost.value,
      renewal_url: url.value,
      auto_renew: auto.checked,
      notes: notes.value,
    },
  ]);

  alert("Saved");
};

async function loadEmails() {
  const { data } = await supabase.from("notification_emails").select("*");
  emails.innerHTML = "";
  data.forEach((e) => (emails.innerHTML += `<li>${e.email}</li>`));
}

addEmail.onclick = async () => {
  await supabase.from("notification_emails").insert([{ email: email.value }]);
  loadEmails();
};

loadEmails();
