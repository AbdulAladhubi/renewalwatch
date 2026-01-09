import { supabase } from "./supabase.js";
import { protect } from "./auth.js";

await protect();

const form = document.getElementById("form");
const name = document.getElementById("name");
const vendor = document.getElementById("vendor");
const purchase = document.getElementById("purchase");
const expiry = document.getElementById("expiry");
const cost = document.getElementById("cost");
const url = document.getElementById("url");
const auto = document.getElementById("auto");
const notes = document.getElementById("notes");

const emailInput = document.getElementById("email");
const addEmailBtn = document.getElementById("addEmail");
const emailsList = document.getElementById("emails");

const editId = localStorage.getItem("editId");
if (editId) {
  const { data } = await supabase.from("licenses").select("*").eq("id", editId);
  const l = data[0];
  name.value = l.name;
  vendor.value = l.vendor;
  purchase.value = l.purchase_date;
  expiry.value = l.expiry_date;
  cost.value = l.cost;
  url.value = l.renewal_url;
  auto.checked = l.auto_renew;
  notes.value = l.notes;
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const payload = {
    name: name.value,
    vendor: vendor.value,
    purchase_date: purchase.value,
    expiry_date: expiry.value,
    cost: cost.value,
    renewal_url: url.value,
    auto_renew: auto.checked,
    notes: notes.value,
  };

  if (editId) {
    await supabase.from("licenses").update(payload).eq("id", editId);
    localStorage.removeItem("editId");
  } else {
    await supabase.from("licenses").insert([payload]);
  }
  alert("Saved!");
  window.location.href = "index.html";
};

async function loadEmails() {
  const { data } = await supabase.from("notification_emails").select("*");
  emailsList.innerHTML = "";
  data.forEach((e) => (emailsList.innerHTML += `<li>${e.email}</li>`));
}

addEmailBtn.onclick = async () => {
  if (!emailInput.value) return;
  await supabase
    .from("notification_emails")
    .insert([{ email: emailInput.value }]);
  emailInput.value = "";
  loadEmails();
};

loadEmails();
