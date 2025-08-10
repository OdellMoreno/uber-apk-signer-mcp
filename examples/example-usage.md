# Example Usage

This document provides examples of how to use the Uber APK Signer MCP server with different chat LLMs and MCP clients.

## Basic Setup

First, make sure you have:
1. Built the MCP server: `npm run build`
2. Set the `UBER_APK_SIGNER_PATH` environment variable
3. Have your keystore and APK files ready

## Example 1: Sign an APK

### Chat Request
```
Can you sign my APK file located at /Users/me/projects/myapp/app-release-unsigned.apk using the keystore at /Users/me/keystores/release.jks?
```

### MCP Tool Call
The LLM will automatically call the `sign_apk` tool with:

```json
{
  "apkPath": "/Users/me/projects/myapp/app-release-unsigned.apk",
  "keystorePath": "/Users/me/keystores/release.jks",
  "keystorePassword": "your_keystore_password",
  "keyAlias": "your_key_alias",
  "keyPassword": "your_key_password"
}
```

### Expected Response
```
APK signed successfully!
Output: /Users/me/projects/myapp/app-release-unsigned-signed.apk
Size: 52428800 bytes
```

## Example 2: Verify APK Signature

### Chat Request
```
Can you verify the signature of my signed APK at /Users/me/projects/myapp/app-release-signed.apk?
```

### MCP Tool Call
```json
{
  "apkPath": "/Users/me/projects/myapp/app-release-signed.apk"
}
```

### Expected Response
```
APK signature verification:
Valid: true
Signer: Your Organization
Certificate: CN=Your App, O=Your Organization
```

## Example 3: List Available Keystores

### Chat Request
```
What keystores do I have available in my keystores directory?
```

### MCP Tool Call
```json
{
  "directory": "/Users/me/keystores"
}
```

### Expected Response
```
Found 3 keystore(s):
- /Users/me/keystores/debug.jks (JKS)
- /Users/me/keystores/release.jks (JKS)
- /Users/me/keystores/test.p12 (P12)
```

## Example 4: Create a New Keystore

### Chat Request
```
I need to create a new keystore for my production app. Can you create one at /Users/me/keystores/production.jks?
```

### MCP Tool Call
```json
{
  "keystorePath": "/Users/me/keystores/production.jks",
  "keystorePassword": "secure_production_password",
  "keyAlias": "production",
  "keyPassword": "secure_key_password",
  "commonName": "My Production App",
  "organization": "My Company Inc."
}
```

### Expected Response
```
Keystore created successfully at: /Users/me/keystores/production.jks
```

## Integration Examples

### Claude Desktop

1. Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "uber-apk-signer": {
      "command": "node",
      "args": ["/Users/me/repos/uber-apk-signer-mcp/dist/index.js"],
      "cwd": "/Users/me/repos/uber-apk-signer-mcp"
    }
  }
}
```

2. Restart Claude Desktop
3. Start a new chat and ask about APK signing

### Custom MCP Client

If you're building a custom MCP client, here's how to connect:

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const client = new Client({
  name: 'my-client',
  version: '1.0.0',
});

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/uber-apk-signer-mcp/dist/index.js'],
  cwd: '/path/to/uber-apk-signer-mcp',
});

await client.connect(transport);

// List available tools
const tools = await client.listTools();
console.log('Available tools:', tools.tools);

// Call a tool
const result = await client.callTool({
  name: 'sign_apk',
  arguments: {
    apkPath: '/path/to/app.apk',
    keystorePath: '/path/to/keystore.jks',
    keystorePassword: 'password',
    keyAlias: 'alias',
    keyPassword: 'keypass',
  },
});

console.log('Result:', result);
```

## Environment Configuration Examples

### Development Setup
```bash
export UBER_APK_SIGNER_PATH="/usr/local/bin/uber-apk-signer"
export UBER_APK_SIGNER_LOG_LEVEL="debug"
export MCP_TRANSPORT="stdio"
```

### Production Setup
```bash
export UBER_APK_SIGNER_PATH="/opt/uber-apk-signer/bin/uber-apk-signer"
export UBER_APK_SIGNER_TIMEOUT=600000
export MCP_TRANSPORT="tcp"
export MCP_TCP_HOST="0.0.0.0"
export MCP_TCP_PORT=3000
export MCP_ALLOW_INSECURE=false
```

## Troubleshooting Examples

### Issue: "Uber APK Signer not found"
```bash
# Check if the tool is accessible
which uber-apk-signer

# Test the tool directly
uber-apk-signer --version

# Set the correct path
export UBER_APK_SIGNER_PATH="/correct/path/to/uber-apk-signer"
```

### Issue: "Permission denied"
```bash
# Check file permissions
ls -la /path/to/your.apk
ls -la /path/to/keystore.jks

# Fix permissions if needed
chmod 644 /path/to/your.apk
chmod 600 /path/to/keystore.jks
```

### Issue: "Keystore password incorrect"
```bash
# Test keystore access directly
keytool -list -keystore /path/to/keystore.jks -storepass your_password
```

## Advanced Usage

### Batch APK Signing
You can ask the LLM to sign multiple APKs:

```
I have several APK files in /Users/me/projects/myapp/build/outputs/apk/ that need to be signed. Can you sign them all using my release keystore?
```

The LLM will use the `list_keystores` tool to find your keystore, then iterate through the APK files to sign each one.

### Custom Output Paths
```
Can you sign my APK and save it to /Users/me/projects/myapp/releases/app-v1.0.0-signed.apk?
```

The LLM will use the `outputPath` parameter to specify the exact output location.

### Keystore Management
```
I need to create a new keystore for my beta app and then sign my beta APK with it. Can you help?
```

The LLM will:
1. Create a new keystore using `create_keystore`
2. Sign your APK using the newly created keystore
3. Provide you with the keystore details for future use 