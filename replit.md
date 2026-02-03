# IT Help San Diego Inc. Site

## Overview
A static website for IT Help San Diego Inc., built with Zola static site generator and the Abridge theme.

## Project Structure
- `content/` - Markdown content files for pages and blog posts
- `templates/` - Zola HTML templates and macros
- `sass/` - SASS stylesheets
- `static/` - Static assets (images, CSS, JS)
- `themes/abridge/` - Abridge theme for Zola
- `config.toml` - Zola configuration file
- `public/` - Generated static files (build output)

## Development
Run the development server:
```
zola serve --interface 0.0.0.0 --port 5000
```

## Build
Build the static site:
```
zola build
```
Output goes to the `public/` directory.

## Deployment
This is a static site. The build command `zola build` generates files in `public/` which are served directly.

## Recent Changes
- 2026-02-03: Configured for Replit environment with Zola static site generator
