---
title: "Featured Images in Zola: Best Practices"
date: 2025-05-31
author: Carey Balboa
categories: [Zola, Web Development]
tags: [featured image, front matter, zola]
extra:
  image: images/logo-blue-square.svg
  image_alt: "Example featured graphic for Zola posts"
description: "How to use extra.image in front matter and templates for clean featured images in Zola."
---

Including a featured image in your Zola blog posts can be clean and idiomatic. The key is placing custom fields under `extra` in the front matter and then referencing them in your templates.

## Using `extra.image`

Zola is strict about front‑matter keys. Custom metadata like a featured image path should live under an `extra` table (for TOML) or mapping (for YAML). For example:

```yaml
---
title: "My Post Title"
extra:
  image: "images/hero.jpg"
  image_alt: "A description of the featured image"
---
```

This approach keeps the top level clean and avoids conflicts with built‑in fields.

## Template Snippet

Add the following to `templates/page.html` to render a featured image when one is defined:

```jinja
{% raw %}
{% if page.extra.image %}
  <figure class="featured-image">
    <img src="{{ get_url(path=page.extra.image) }}" alt="{{ page.extra.image_alt | default(value="Featured graphic") }}">
  </figure>
{% endif %}
{% endraw %}
```

The `get_url` helper resolves the correct URL for files in `static`, so your images work locally and after deployment.

Using this setup keeps your Markdown readable on GitHub and ensures featured images display consistently across your site.
