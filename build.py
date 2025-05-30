# Simple static site builder converting Markdown to HTML
import os, re, datetime

def parse_config(path):
    cfg = {}
    with open(path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if ':' in line:
                key, val = line.split(':', 1)
                key = key.strip()
                val = val.split('#',1)[0].strip()
                if val.startswith(('"', "'")) and val.endswith(('"',"'")):
                    val = val[1:-1]
                cfg[key] = val
    return cfg

def parse_front_matter(lines):
    if lines and lines[0].strip() == '---':
        fm = {}
        i = 1
        while i < len(lines):
            if lines[i].strip() == '---':
                break
            if ':' in lines[i]:
                k,v = lines[i].split(':',1)
                fm[k.strip()] = v.strip().strip('"').strip("'")
            i += 1
        body = lines[i+1:]
        return fm, body
    return {}, lines

# inline conversions
def inline(text):
    # images ![alt](url)
    text = re.sub(r'!\[([^\]]*)\]\(([^\s)]+)[^)]*\)', r'<img src="\2" alt="\1">', text)
    # links
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', text)
    # bold
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'__([^_]+)__', r'<strong>\1</strong>', text)
    # italic
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)
    text = re.sub(r'_([^_]+)_', r'<em>\1</em>', text)
    # code
    text = re.sub(r'`([^`]+)`', r'<code>\1</code>', text)
    return text


def markdown_to_html(lines):
    html = []
    in_p = False
    in_list = False
    list_type = 'ul'
    in_code = False
    in_html_block = False
    for line in lines:
        stripped = line.rstrip('\n')
        if in_html_block:
            html.append(stripped)
            if stripped.strip().lower().startswith('</script'):
                in_html_block = False
            continue
        if in_code:
            if stripped.startswith('```'):
                html.append('</code></pre>')
                in_code = False
                continue
            html.append(stripped)
            continue
        if stripped.startswith('```'):
            if in_p:
                html.append('</p>'); in_p=False
            if in_list:
                html.append(f'</{list_type}>'); in_list=False
            html.append('<pre><code>')
            in_code = True
            continue
        if stripped.startswith('<script'):
            if in_p:
                html.append('</p>'); in_p=False
            if in_list:
                html.append(f'</{list_type}>'); in_list=False
            html.append(stripped)
            if not stripped.strip().lower().endswith('</script>'):
                in_html_block = True
            continue
        if stripped.startswith('<'):
            if in_p:
                html.append('</p>'); in_p=False
            if in_list:
                html.append(f'</{list_type}>'); in_list=False
            html.append(stripped)
            continue
        if re.match(r'^#{1,6} ', stripped):
            if in_p:
                html.append('</p>'); in_p=False
            if in_list:
                html.append(f'</{list_type}>'); in_list=False
            level = len(stripped.split(' ')[0])
            content = stripped[level+1:].strip()
            html.append(f'<h{level}>{inline(content)}</h{level}>')
            continue
        if re.match(r'^\d+\. ', stripped):
            bullet = re.sub(r'^\d+\. ', '', stripped)
            if not in_list or list_type != 'ol':
                if in_p:
                    html.append('</p>'); in_p=False
                if in_list:
                    html.append(f'</{list_type}>')
                html.append('<ol>'); in_list=True; list_type='ol'
            html.append(f'<li>{inline(bullet)}</li>')
            continue
        if stripped.startswith('* ') or stripped.startswith('- '):
            bullet = stripped[2:].strip()
            if not in_list or list_type != 'ul':
                if in_p:
                    html.append('</p>'); in_p=False
                if in_list:
                    html.append(f'</{list_type}>')
                html.append('<ul>'); in_list=True; list_type='ul'
            html.append(f'<li>{inline(bullet)}</li>')
            continue
        if stripped.strip() in ('', '---', '***'):
            if in_p:
                html.append('</p>'); in_p=False
            if in_list and stripped.strip()=='':
                html.append(f'</{list_type}>'); in_list=False
            elif stripped.strip() in ('---','***'):
                if in_list:
                    html.append(f'</{list_type}>'); in_list=False
                html.append('<hr>')
            continue
        # regular paragraph text
        if not in_p:
            if in_list:
                html.append(f'</{list_type}>'); in_list=False
            html.append('<p>'); in_p=True
        html.append(inline(stripped))
    if in_p:
        html.append('</p>')
    if in_list:
        html.append(f'</{list_type}>')
    if in_code:
        html.append('</code></pre>')
    return '\n'.join(html)

SITE = parse_config('_config.yml')
site_title = SITE.get('title','')
site_url = 'https://www.it-help.tech'
site_description = SITE.get('description','')
current_year = '2025'

HEADER = f"""
    <header class="container">
      <div class="site-logo"> <a href="/" style="text-decoration: none; color: inherit;">
        <img src="/assets/images/logo.svg" alt="{site_title} Logo" width="400" height="50" style="vertical-align: middle;">
        </a>
      </div>

      <input type="checkbox" id="nav-toggle" class="nav-toggle">
      <label for="nav-toggle" class="nav-toggle-label">
        <span></span>
      </label>
      <nav>
        <ul>
          <li><a href="/">Home 🏠</a></li>
          <li><a href="/services.html">Services 🛠️</a></li>
          <li><a href="/billing.html">Pricing 💰</a></li>
          <li><a href="/dns-tool.html">DNS Tool 🛠️</a></li>
          <li><a href="/blog.html">Blog ✍️</a></li>
          <li><a href="/about.html">About 🧑‍🔬</a></li>
          <li><a href="https://schedule.it-help.tech/" target="_blank" rel="noopener noreferrer">Schedule 📅</a></li>
        </ul>
      </nav>
    </header>"""

FOOTER = f"""
    <footer class="container">
      <div style="text-align: center; margin-bottom: 1rem;">
        <img src="/assets/images/owl-of-athena.png" alt="Owl of Athena symbol" width="100" height="100">
      </div>
      <p>&copy; {current_year} {site_title}. <span class="service-line">A service by <a href="https://it-help.tech">IT Help San Diego Inc.</a></span></p>
      <p class="footer-brag">✨ Built with Jekyll/GitHub, hosted on AWS S3/CloudFront/Route 53 (&lt;$10/mo). Zero JS, trackers, or cookies. Just lean, fast, cost-efficient tech. ✨</p>
    </footer>"""

HEAD_TEMPLATE = f"""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{{{title}}}} | {site_title}</title>
    <link rel="icon" href="/assets/images/red-plus.ico" type="image/x-icon">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/global.css">
    <script type="application/ld+json">
    {{{{jsonld}}}}
    </script>
  </head>
  <body>
"""

JSONLD = f"""{{
  \"@context\": \"https://schema.org\",
  \"@type\": \"ProfessionalService\",
  \"name\": \"{site_title}\",
  \"url\": \"{site_url}\",
  \"description\": \"{site_description}\",
  \"telephone\": \"+1-619-853-5008\",
  \"address\": {{
    \"@type\": \"PostalAddress\",
    \"streetAddress\": \"888 Prospect Street Suite 200\",
    \"addressLocality\": \"La Jolla\",
    \"addressRegion\": \"CA\",
    \"postalCode\": \"92037\",
    \"addressCountry\": \"US\"
  }},
  \"areaServed\": {{\"@type\": \"Country\", \"name\": \"USA\"}},
  \"keywords\": \"Remote IT Support, On-Demand IT, macOS Support, iOS Support, DNS Management, DMARC, Google Workspace Migration & Setup, Email Security, Cybersecurity, Endpoint Protection, Mac Troubleshooting, IT Consulting, La Jolla, San Diego\",
  \"serviceType\": [\"Remote IT Support\", \"Email Migration & Setup\", \"Google Workspace Troubleshooting Migration & Setup\", \"Mac & iOS Mail Support\", \"Advanced DNS Management\", \"DMARC Implementation\", \"Website & Domain Recovery\", \"Endpoint Security\", \"Mobile Device Security (iOS)\", \"Data Privacy Advisory\", \"Mac Performance Troubleshooting\", \"Apple Time Machine Backups\", \"Cloud Storage Solutions\", \"Disaster Recovery Planning\", \"iPhone Text Message Extraction\"],
  \"provider\": {{\"@type\": \"Organization\", \"name\": \"IT Help San Diego Inc.\", \"url\": \"{site_url}\", \"founder\": {{\"@type\": \"Person\", \"name\": \"Carey Balboa\", \"url\": \"{site_url}/about.html\"}}}},
  \"hasOfferCatalog\": {{\"@type\": \"OfferCatalog\", \"name\": \"Remote IT Services\", \"itemListElement\": [{{\"@type\": \"Offer\", \"itemOffered\": {{\"@type\": \"Service\", \"name\": \"Remote IT Consulting & Support\"}}, \"priceSpecification\": {{\"@type\": \"PriceSpecification\", \"price\": \"275.00\", \"priceCurrency\": \"USD\", \"unitText\": \"HOUR\", \"description\": \"Billed per hour with a 30-minute minimum charge.\"}}}}]}}
}}"""

os.makedirs('public', exist_ok=True)

posts_meta = []

def build_page(title, body_html, out_path):
    html = HEAD_TEMPLATE.replace('{{jsonld}}', JSONLD).replace('{{title}}', title)
    html += HEADER
    html += "\n    <main class=\"container\">\n" + body_html + "\n    </main>\n"
    html += FOOTER
    html += "\n  </body>\n</html>\n"
    with open(out_path, 'w') as f:
        f.write(html)

# process posts
for fname in os.listdir('_posts'):
    if not fname.endswith('.md'):
        continue
    path = os.path.join('_posts', fname)
    with open(path) as f:
        lines = f.readlines()
    fm, body_lines = parse_front_matter(lines)
    title = fm.get('title', '')
    date = fm.get('date', '')
    slug = re.sub(r'^\d{4}-\d{2}-\d{2}-', '', fname)[:-3]
    body_html = markdown_to_html(body_lines)
    body_html = re.sub(r'\{\{.*?\}\}', '', body_html)
    body_html = re.sub(r'\{%.*?%\}', '', body_html)
    body_html = re.sub(r'\{:\s*[^}]*\}', '', body_html)
    out_file = os.path.join('public', slug + '.html')
    build_page(title, body_html, out_file)
    text = re.sub(r'<[^>]+>', '', body_html)
    excerpt = ' '.join(text.split()[:30]) + '...'
    posts_meta.append({'title': title, 'date': date, 'slug': slug+'.html', 'excerpt': excerpt})

# sort posts by date desc
posts_meta.sort(key=lambda x: x['date'], reverse=True)

# pages
pages = ['index.md','about.md','services.md','billing.md','dns-tool.md','blog.md']
for p in pages:
    with open(p) as f:
        lines = f.readlines()
    fm, body_lines = parse_front_matter(lines)
    title = fm.get('title','')
    if p == 'blog.md':
        # build blog list
        items = []
        for meta in posts_meta:
            date_iso = meta['date']
            try:
                dt = datetime.datetime.strptime(meta['date'], '%Y-%m-%d')
                date_disp = dt.strftime('%B %-d, %Y')
                date_iso = dt.date().isoformat()
            except Exception:
                date_disp = meta['date']
            items.append(f"<li><h2><a href=\"/{meta['slug']}\">{meta['title']}</a></h2><p class=\"post-meta\"><time datetime=\"{date_iso}\">{date_disp}</time></p><div class=\"post-excerpt\">{meta['excerpt']}</div><a href=\"/{meta['slug']}\" class=\"read-more\">Read more &rarr;</a></li>")
        body_lines = ["# Blog Posts ✍️", "", "<ul class=\"post-list\">"] + items + ["</ul>"]
    body_html = markdown_to_html(body_lines)
    body_html = re.sub(r'\{\{.*?\}\}', '', body_html)
    body_html = re.sub(r'\{%.*?%\}', '', body_html)
    body_html = re.sub(r'\{:\s*[^}]*\}', '', body_html)
    out_file = os.path.join('public', p.replace('.md','.html'))
    build_page(title, body_html, out_file)
