import { supabase } from "./supabase.js";
import { protect, logout } from "./auth.js";

await protect();

document.getElementById("logout").onclick = logout;

const { data: licenses } = await supabase.from("licenses").select("*");

const today = new Date();
let soon = 0,
  expired = 0;

document.getElementById("total").innerText = licenses.length;

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
    </tr>`;
});

document.getElementById("soon").innerText = soon;
document.getElementById("expired").innerText = expired;
