import { defineConfig } from 'astro/config';

// Static output only — the build result in dist/ is uploaded to Hostinger by FTP.
export default defineConfig({
  site: 'https://topcosmeticsclinic.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // The stylesheet is small; inlining it removes the only render-blocking request.
    inlineStylesheets: 'always',
  },
  image: {
    responsiveStyles: false,
  },
});
