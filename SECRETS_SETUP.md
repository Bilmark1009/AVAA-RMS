# GitHub Secrets Setup

You need to add these secrets to your GitHub repository:

## Go to: GitHub Repository → Settings → Secrets and variables → Actions

### Required Secrets:

1. **FTP_SERVER**
   ```
   autopilotvirtual.com
   ```

2. **FTP_USERNAME**
   ```
   u850020960
   ```

3. **FTP_PASSWORD**
   ```
   Your Hostinger FTP password
   ```

4. **SSH_HOST**
   ```
   153.92.10.98
   ```

5. **SSH_PORT**
   ```
   65002
   ```

6. **SSH_USERNAME**
   ```
   u850020960
   ```

7. **SSH_KEY**
   ```
   Generate SSH key and add the private key here
   ```

## SSH Key Setup:

1. Generate SSH key locally:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   # Save as: ~/.ssh/avaa_deploy
   # No passphrase needed
   ```

2. Add public key to Hostinger:
   - Copy public key: `cat ~/.ssh/avaa_deploy.pub`
   - Add to Hostinger: Hosting → SSH Access → Add SSH Key

3. Add private key to GitHub:
   - Copy private key: `cat ~/.ssh/avaa_deploy`
   - Add to GitHub secrets as `SSH_KEY`

## Alternative: Use Password-based SSH

If SSH keys don't work, you can use password:

Add this secret instead of SSH_KEY:
```
SSH_PASSWORD=your_hostinger_password
```

And modify the workflow to use password instead of key.

## Testing:

1. Push to main branch → Auto-deploys
2. Or trigger manually: GitHub → Actions → Deploy to Hostinger → Run workflow

## Benefits:

✅ Automatic builds on every push
✅ No manual uploads needed
✅ Caches cleared automatically
✅ Proper permissions set
✅ Rollback capability (just push previous commit)
✅ Deployment history and logs
