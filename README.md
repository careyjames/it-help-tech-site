# IT Help San Diego Inc. Site

This site is a static HTML5 project.

© 2025 IT Help San Diego Inc.

## Comment moderation

Comments are powered by [Utterances](https://utteranc.es/), which uses GitHub Issues as the backend.
The embedded widget loads via a small JavaScript snippet. A fallback link labeled
**Submit your comment via GitHub** opens an issue form if you prefer to comment
directly on GitHub. The link pre‑fills the post slug so the workflow can place
the comment correctly. New issues with the `comment` label are automatically
converted into pull requests that add a markdown file under `content/comments/`.

To publish a comment:

1. Review the pull request generated for the issue.
2. Merge the PR to approve the comment and deploy it with the next site build.
3. Ensure Issues are enabled and that the comment link in `templates/page.html` points to your repository.

✨ Built with GitHub Actions & Sass, hosted on AWS S3/CloudFront/Route 53 (<$10/mo). Minimal JS, no trackers or cookies. Just lean, fast, cost-efficient tech. ✨
