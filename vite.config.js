import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// If you deploy this to GitHub Pages under a repo name (e.g.
// https://yourname.github.io/vitallead/), uncomment and set base below.
export default defineConfig({
  plugins: [react()],
  // base: "/vitallead/",
});
