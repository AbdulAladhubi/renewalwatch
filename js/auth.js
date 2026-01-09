import { supabase } from "./supabase.js";

export async function login(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  else window.location.href = "index.html";
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = "login.html";
}

export async function protect() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) window.location.href = "login.html";
}
