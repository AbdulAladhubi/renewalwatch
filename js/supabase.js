import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(
  "https://wojfhlorozyfvitnizjx.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvamZobG9yb3p5ZnZpdG5pemp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NTk5NjcsImV4cCI6MjA4MzUzNTk2N30.Bxt7HQX5xkyzgvIWbjn6aETR5VFajwOTVHL0GWNhEEc"
);
