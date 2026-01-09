import { supabase } from "./supabase.js";
import { protect, logout } from "./auth.js";

await protect();
document.getElementById("logout").onclick = logout;

const table = document.getElementById("table");
const searchInput = document.getElementById("search");

async function loadLicenses() {
  let { data: licenses } = await supabase.from("licenses").select("*");
  const query = searchInput.value.toLowerCase();
  licenses = licenses.filter(
    (l) =>
      l.name.toLowerCase().includes(query) ||
      l.vendor.toLowerCase().includes(query)
  );

  table.innerHTML = "";
  let today = new Date(),
    soon = 0,
    expired = 0;

  licenses.forEach((l) => {
    const days = (new Date(l.expiry_date) - today) / 86400000;
    if (days < 0) expired++;
    else if (days <= 30) soon++;

    table.innerHTML += `
      <tr>
        <td>${l.name}</td>
        <td>${l.vendor}</td>
        <td>${l.expiry_date}</td>
        <td>$${l.cost}</td>
        <td>${l.auto_renew ? "Yes" : "No"}</td>
        <td>
          <button class="actions-btn edit-btn" onclick="editLicense('${
            l.id
          }')">Edit</button>
          <button class="actions-btn delete-btn" onclick="deleteLicense('${
            l.id
          }')">Delete</button>
        </td>
      </tr>`;
  });

  document.getElementById("total").innerText = licenses.length;
  document.getElementById("soon").innerText = soon;
  document.getElementById("expired").innerText = expired;
}

window.editLicense = (id) => {
  localStorage.setItem("editId", id);
  window.location.href = "add.html";
};

window.deleteLicense = async (id) => {
  if (!confirm("Delete this license?")) return;
  await supabase.from("licenses").delete().eq("id", id);
  loadLicenses();
};

searchInput.oninput = loadLicenses;
loadLicenses();
