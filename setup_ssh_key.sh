#!/bin/bash

echo "🔑 Setting up SSH key for GitHub Actions deployment..."

# Generate SSH key
ssh-keygen -t rsa -b 4096 -C "github-actions-avaa" -f ~/.ssh/avaa_deploy -N ""

echo "✅ SSH key generated!"
echo ""
echo "📋 PUBLIC KEY (copy this):"
echo "================================"
cat ~/.ssh/avaa_deploy.pub
echo "================================"
echo ""
echo "🔐 PRIVATE KEY (copy this):"
echo "================================"
cat ~/.ssh/avaa_deploy
echo "================================"
echo ""
echo "Next steps:"
echo "1. Copy the PUBLIC KEY and add it to Hostinger SSH keys"
echo "2. Copy the PRIVATE KEY and add it to GitHub secrets as 'SSH_KEY'"
echo "3. Use these GitHub secrets:"
echo "   - SSH_HOST: 153.92.10.98"
echo "   - SSH_PORT: 65002"
echo "   - SSH_USERNAME: u850020960"
echo "   - SSH_KEY: (paste private key here)"
