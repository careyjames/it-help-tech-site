# IT Help San Diego Inc. Site

This site is a static HTML5 project.

© 2025 IT Help San Diego Inc.

## Comment moderation

Comments are submitted through GitHub Issues using a no‑JavaScript form.
Visitors click **Submit your comment via GitHub** at the bottom of a post which
opens an issue form. The link pre‑fills the post slug in the issue title so the
workflow can place the comment correctly. A workflow converts new issues with the `comment` label
into pull requests that add a markdown file under `content/comments/`.

To publish a comment:

1. Review the pull request generated for the issue.
2. Merge the PR to approve the comment and deploy it with the next site build.
3. Ensure Issues are enabled and that the comment link in `templates/page.html` points to your repository.

✨ Built with GitHub Actions & Sass, hosted on AWS S3/CloudFront/Route 53 (<$10/mo). Zero JS, trackers, or cookies. Just lean, fast, cost-efficient tech. ✨
