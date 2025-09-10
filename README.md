# IT Help San Diego Inc. Website

A high-performance static website built with **Zola** (Rust-based static site generator) and optimized for speed, security, and accessibility.

## 🚀 Project Overview

This site showcases how websites can be built **simple and done right** with:
- **Zero runtime overhead** - Pure static site generation
- **Performance-first approach** - Targeting 100/100 Lighthouse scores
- **Security hardened** - Strict CSP, comprehensive security headers
- **Accessibility focused** - WCAG 2.2 AA compliance
- **No tracking or cookies** - Privacy-respecting approach

## 🛠 Technology Stack

### Core Technologies
- **[Zola](https://www.getzola.org/)** - Rust-based static site generator
- **Sass** - CSS preprocessing with maintainable stylesheets
- **System Fonts** - Zero web font loading for instant text rendering
- **Minimal JavaScript** - Progressive enhancement only where needed

### Performance Features
- **AVIF/WebP Images** - Modern image formats with fallbacks
- **Critical CSS Inlining** - Above-the-fold styles for instant rendering
- **PurgeCSS** - Automated removal of unused CSS
- **CDN Deployment** - AWS S3 + CloudFront with optimized caching

### Security Features
- **Content Security Policy (CSP)** - Strict nonce-based security
- **Security Headers** - HSTS, X-Frame-Options, Permissions-Policy
- **Input Sanitization** - Safe content processing
- **No External Dependencies** - Reduced attack surface

## 📋 Prerequisites

- **Zola** v0.17+ installed on your system
- **Git** for version control
- Modern web browser for development

## 🔧 Installation

### Install Zola

#### macOS (via Homebrew)
```bash
brew install zola
```

#### Windows (via Chocolatey)
```bash
choco install zola
```

#### Windows (via Scoop)
```bash
scoop install zola
```

#### Universal (via Docker)
```bash
# No installation needed - use Docker commands below
```

## 🚀 Development

### Start Development Server
```bash
zola serve
```

The site will be available at **http://127.0.0.1:1111** with live reloading enabled.

### Custom Port/Interface
```bash
# Custom port
zola serve --port 3000

# Network accessible
zola serve --interface 0.0.0.0 --port 3000

# Auto-open in browser
zola serve --open
```

### Using Docker (Alternative)
```bash
# Serve with live reload
docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app \
  -p 1111:1111 -p 1024:1024 \
  ghcr.io/getzola/zola:latest serve \
  --interface 0.0.0.0 --port 1111 --base-url localhost
```

## 🏗 Building for Production

### Build Static Files
```bash
zola build
```

Generated files will be in the `public/` directory.

### Build with Custom Base URL
```bash
zola build --base-url https://your-domain.com
```

### Build with Docker
```bash
docker run -u "$(id -u):$(id -g)" -v $PWD:/app --workdir /app \
  ghcr.io/getzola/zola:latest build
```

## 📁 Project Structure

```
├── config.toml              # Site configuration
├── content/                 # Markdown content files
│   ├── _index.md           # Homepage content
│   ├── blog/               # Blog posts
│   ├── services.md         # Services page
│   └── billing.md          # Pricing page
├── templates/              # Tera HTML templates
│   ├── base.html           # Base template
│   ├── macros/             # Reusable template macros
│   ├── partials/           # Template partials
│   └── shortcodes/         # Content shortcodes
├── sass/                   # Sass stylesheets
│   ├── _custom.scss        # Custom styles
│   ├── _extra.scss         # Additional styles
│   └── critical-inline.scss # Critical CSS
├── static/                 # Static assets
│   ├── images/             # Optimized images (AVIF/WebP)
│   ├── css/                # Compiled CSS
│   └── js/                 # Minimal JavaScript
├── themes/abridge/         # Abridge theme
└── public/                 # Generated site (after build)
```

## 🎨 Customization

### Content Management
- **Pages**: Edit Markdown files in `content/`
- **Blog Posts**: Add `.md` files to `content/blog/`
- **Navigation**: Update `config.toml` menu configuration

### Styling
- **Custom CSS**: Edit `sass/_custom.scss`
- **Color Scheme**: Modify variables in `sass/css/abridge.scss`
- **System Fonts**: Already configured for optimal performance

### Templates
- **HTML Structure**: Modify templates in `templates/`
- **Reusable Components**: Create macros in `templates/macros/`
- **Content Blocks**: Add shortcodes in `templates/shortcodes/`

## 📊 Performance Optimization

### Current Optimizations
- ✅ **System fonts** (zero loading time)
- ✅ **AVIF/WebP images** with responsive sizing
- ✅ **Critical CSS inlining**
- ✅ **PurgeCSS** for minimal bundle size
- ✅ **Minimal JavaScript** (progressive enhancement)

### Build Commands for Optimization
```bash
# Build with CSS purging (automatic in CI)
zola build

# Manual CSS optimization (if needed)
npm install -g purgecss
purgecss --css public/css/*.css --content public/**/*.html --output public/css/
```

## 🚀 Deployment

### GitHub Actions (Current)
Automated deployment via `.github/workflows/deploy.yml`:
- Builds site with Zola
- Optimizes CSS with PurgeCSS
- Deploys to AWS S3 + CloudFront

### Manual Deployment
```bash
# Build for production
zola build

# Upload public/ directory to your hosting provider
```

## 🔧 Development Workflow

### Local Development
1. **Start server**: `zola serve`
2. **Edit content**: Modify `.md` files in `content/`
3. **Update styles**: Edit `.scss` files in `sass/`
4. **Test changes**: Browser auto-refreshes on save

### Asset Optimization
- **Images**: Add to `static/images/` (AVIF/WebP preferred)
- **CSS**: Use Sass in `sass/` directory
- **JavaScript**: Minimal additions to `static/js/`

## 🛡 Security Features

### Content Security Policy
Strict CSP with nonce-based inline script/style approval:
```
default-src 'none'; script-src 'self' 'nonce-*'; style-src 'self' 'nonce-*';
```

### Security Headers
- **HSTS** with preload
- **X-Frame-Options: DENY**
- **X-Content-Type-Options: nosniff**
- **Comprehensive Permissions-Policy**

## 📈 Performance Targets

### Current Metrics
- **Lighthouse Performance**: 95+ (targeting 100)
- **Accessibility**: WCAG 2.2 AA compliant
- **SEO**: Structured data + meta optimization
- **Best Practices**: Security headers + modern standards

### Optimization Goals
- **CSS Bundle**: <35KB gzipped
- **JavaScript**: <10KB total
- **Images**: AVIF-first with WebP fallbacks
- **Core Web Vitals**: "Good" ratings across all metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `zola serve`
5. Submit a pull request

## 📄 License

© 2025 IT Help San Diego Inc. All rights reserved.

✨ **Built with Rust (Zola) & Sass; no frameworks, trackers, or cookies. Just lean, fast, cost-efficient tech.** ✨