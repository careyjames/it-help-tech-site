# Remote IT Help Site

This site is a static HTML5 project built from SCSS using **Sass**.

## Install Sass and compile SCSS

1. Install Node.js (v18 or later).
2. Install Sass globally:
   ```bash
   npm install -g sass
   ```
3. Compile the stylesheet whenever you update the SCSS:
   ```bash
   sass src/styles/global.scss public/global.css
   ```

## Editing content and deploying

Edit the Markdown or HTML files (such as `index.md` or files in `_posts/`).
Commit your changes and push them to the `main` branch. A GitHub Actions
workflow automatically compiles the SCSS and deploys the `public` folder to
AWS S3/CloudFront.

© 2025 Remote IT Help. A service by IT Help San Diego Inc.

✨ Built with GitHub Actions & Sass, hosted on AWS S3/CloudFront/Route 53 (<$10/mo). Zero JS, trackers, or cookies. Just lean, fast, cost-efficient tech. ✨
