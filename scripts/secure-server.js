#!/usr/bin/env node

const express = require('express');
const path = require('node:path');
const fs = require('node:fs');

// Read security headers configuration
const headersConfig = JSON.parse(fs.readFileSync('headers.json', 'utf8'));

function createSecureServer(port) {
  const app = express();

  // Disable Express version disclosure for security
  app.disable('x-powered-by');

  // Apply security headers middleware
  app.use((req, res, next) => {
    // Apply security headers from headers.json
    const security = headersConfig.SecurityHeadersConfig;

    // Content Security Policy
    if (security.ContentSecurityPolicy) {
      res.setHeader('Content-Security-Policy', security.ContentSecurityPolicy.ContentSecurityPolicy);
    }

    // X-Frame-Options
    if (security.FrameOptions) {
      res.setHeader('X-Frame-Options', security.FrameOptions.FrameOption);
    }

    // X-Content-Type-Options
    if (security.ContentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    if (security.ReferrerPolicy) {
      res.setHeader('Referrer-Policy', security.ReferrerPolicy.ReferrerPolicy);
    }

    // HSTS
    if (security.StrictTransportSecurity) {
      const hsts = security.StrictTransportSecurity;
      let hstsValue = `max-age=${hsts.AccessControlMaxAgeSec}`;
      if (hsts.IncludeSubdomains) hstsValue += '; includeSubDomains';
      if (hsts.Preload) hstsValue += '; preload';
      res.setHeader('Strict-Transport-Security', hstsValue);
    }

    // XSS Protection
    if (security.XSSProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // Custom headers (Permissions-Policy, COEP, COOP, CORP)
    if (headersConfig.CustomHeadersConfig?.Items) {
      for (const item of headersConfig.CustomHeadersConfig.Items) {
        res.setHeader(item.Header, item.Value);
      }
    }

    next();
  });

  // Serve static files from public directory
  app.use(express.static('public', {
    setHeaders: (res, path) => {
      // Set appropriate content types
      if (path.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      }
    }
  }));

  // Handle SPA routing - serve index.html for all non-asset requests
  app.get('*', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
  });

  return new Promise((resolve, reject) => {
    const server = app.listen(port, () => {
      console.log(`🔒 Secure server running on http://localhost:${port}`);
      resolve(server);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} already in use, skipping...`);
        resolve(null);
      } else {
        reject(err);
      }
    });
  });
}

// If called directly, start servers on specified ports
if (require.main === module) {
  const ports = process.argv.slice(2).map(Number).filter(Boolean);
  if (ports.length === 0) {
    console.error('Usage: node secure-server.js <port1> [port2] [port3]');
    process.exit(1);
  }

  (async () => {
    const servers = [];

    // Start servers sequentially to avoid race conditions
    for (const port of ports) {
      try {
        const server = await createSecureServer(port);
        if (server) {
          servers.push(server);
        }
      } catch (err) {
        console.error(`❌ Failed to start server on port ${port}:`, err.message);
      }
    }

    if (servers.length === 0) {
      console.error('❌ No servers started successfully');
      process.exit(1);
    }

    console.log(`✅ Started ${servers.length} of ${ports.length} servers successfully`);

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🧹 Shutting down secure servers...');
      for (const server of servers) {
        server.close();
      }
      process.exit(0);
    });
  })().catch(err => {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  });
}

module.exports = createSecureServer;