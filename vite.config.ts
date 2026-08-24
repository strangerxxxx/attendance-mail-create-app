import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const repoName = "attendance-mail-create-app";
const isGitHubPages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? `/${repoName}/` : "/",
});
