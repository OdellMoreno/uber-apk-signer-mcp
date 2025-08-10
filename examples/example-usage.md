# Uber APK Signer MCP - Usage Examples

This document shows realistic examples of how users would interact with the Uber APK Signer MCP server through their chat LLM.

## 🚀 **Quick Start Examples**

### **Example 1: Simple APK Signing (Minimal Parameters)**

**User Chat Request:**
```
"Can you sign my app.apk file? It's in the current directory."
```

**MCP Tool Call:**
```json
{
  "name": "sign_apk",
  "arguments": {
    "apkPath": "./app.apk"
  }
}
```

**Expected Response:**
```
APK signed successfully!
Output: ./app-signed.apk
Size: 15,247,392 bytes
```

---

### **Example 2: APK Signing with Custom Keystore**

**User Chat Request:**
```
"I need to sign my release.apk with my production keystore at ~/keys/release.keystore. The password is 'mysecret' and key alias is 'release-key'."
```

**MCP Tool Call:**
```json
{
  "name": "sign_apk",
  "arguments": {
    "apkPath": "./release.apk",
    "keystorePath": "~/keys/release.keystore",
    "keystorePassword": "mysecret",
    "keyAlias": "release-key",
    "keyPassword": "mysecret"
  }
}
```

**Expected Response:**
```
APK signed successfully!
Output: ./release-signed.apk
Size: 28,456,789 bytes
```

---

### **Example 3: APK Verification**

**User Chat Request:**
```
"Can you verify the signature of my signed app? I want to make sure it was signed correctly."
```

**MCP Tool Call:**
```json
{
  "name": "verify_apk_signature",
  "arguments": {
    "apkPath": "./app-signed.apk"
  }
}
```

**Expected Response:**
```
APK signature verification successful!
Certificate details:
- Issuer: CN=Your Organization
- Valid from: 2025-01-15 to 2030-01-15
- SHA-256: a1b2c3d4e5f6...
```

---

### **Example 4: List Available Keystores**

**User Chat Request:**
```
"What keystores do I have available for signing?"
```

**MCP Tool Call:**
```json
{
  "name": "list_keystores",
  "arguments": {
    "directory": "~/keys"
  }
}
```

**Expected Response:**
```
Found 3 keystores in ~/keys:
1. debug.keystore (debug build signing)
2. release.keystore (production signing)
3. test.keystore (testing purposes)
```

---

### **Example 5: Create New Keystore**

**User Chat Request:**
```
"I need to create a new keystore for my company app. Can you help me set that up?"
```

**MCP Tool Call:**
```json
{
  "name": "create_keystore",
  "arguments": {
    "keystorePath": "~/keys/company-app.keystore",
    "keystorePassword": "CompanySecret2025!",
    "keyAlias": "company-app-key",
    "keyPassword": "CompanySecret2025!",
    "commonName": "Company App Developer",
    "organization": "My Company Inc."
  }
}
```

**Expected Response:**
```
Keystore created successfully!
Location: ~/keys/company-app.keystore
Key alias: company-app-key
Certificate valid until: 2030-01-15
```

---

## 💬 **Real-World Chat Scenarios**

### **Scenario 1: Developer Workflow**

**User:** "I just built my Android app and need to sign it for testing. Can you help?"

**Assistant:** "I can help you sign your APK! I'll use the default debug keystore which is perfect for testing. What's the path to your APK file?"

**User:** "It's in the build/outputs/apk/debug folder, called app-debug.apk"

**Assistant:** "Perfect! I'll sign your APK using the debug keystore. This will create a signed version ready for testing."

*[Tool call: sign_apk with apkPath: "./build/outputs/apk/debug/app-debug.apk"]*

**Assistant:** "Great! Your APK has been signed successfully. The signed file is now available at `./build/outputs/apk/debug/app-debug-signed.apk` and is ready for testing on your device."

---

### **Scenario 2: Production Release**

**User:** "I need to sign my app for the Play Store release. I have a production keystore."

**Assistant:** "I'll help you sign your APK for production release. I'll need your production keystore details. What's the path to your keystore file?"

**User:** "It's at ~/production-keys/release.keystore"

**Assistant:** "Got it! I'll also need the keystore password and key alias to complete the signing process."

**User:** "The password is 'ProdPass2025' and the alias is 'release-key'"

**Assistant:** "Perfect! I'll sign your APK with your production keystore. This will create a release-ready signed APK."

*[Tool call: sign_apk with production keystore details]*

**Assistant:** "Excellent! Your APK has been signed with your production keystore and is now ready for Play Store submission. The signed file is at `./app-release-signed.apk`."

---

### **Scenario 3: Troubleshooting**

**User:** "I'm getting an error when trying to install my signed APK. Can you verify the signature?"

**Assistant:** "I can definitely help verify the APK signature to make sure it was signed correctly. What's the path to your signed APK?"

**User:** "It's called app-signed.apk in the current directory"

**Assistant:** "I'll verify the signature of your APK to check if there are any issues with the signing process."

*[Tool call: verify_apk_signature with apkPath: "./app-signed.apk"]*

**Assistant:** "The signature verification shows your APK was signed correctly. The issue might be elsewhere - perhaps the APK is corrupted during transfer, or there's a compatibility issue with the target device. Let me know if you'd like me to help investigate further!"

---

## 🔧 **Tool Parameter Guidelines**

### **sign_apk - Smart Defaults**
- **Only `apkPath` is required**
- **Defaults to debug keystore** (`~/.android/debug.keystore`)
- **Default passwords**: `android` (standard Android debug keystore)
- **Default key alias**: `androiddebugkey`
- **Output path**: Auto-generated if not specified

### **When to Override Defaults**
- **Production releases**: Use your production keystore
- **Custom keystores**: Specify path and credentials
- **Different output location**: Set `outputPath`
- **Multiple signing profiles**: Use different keystores for different purposes

### **Security Best Practices**
- **Never commit keystores** to version control
- **Use strong passwords** for production keystores
- **Store keystores securely** (encrypted, backed up)
- **Use different keystores** for debug vs. release

---

## 🎯 **Integration Tips for Chat LLMs**

### **Context Awareness**
- **Remember user's project structure** (build directories, keystore locations)
- **Suggest appropriate defaults** based on the use case
- **Ask clarifying questions** when parameters are unclear

### **Error Handling**
- **Provide helpful error messages** when signing fails
- **Suggest common solutions** (check file paths, verify keystore credentials)
- **Offer to verify signatures** when troubleshooting

### **Workflow Optimization**
- **Batch operations** when multiple APKs need signing
- **Remember keystore preferences** for repeat users
- **Suggest verification** after signing operations

---

## 📱 **Common Use Cases**

1. **Development Testing**: Quick signing with debug keystore
2. **Internal Testing**: Signing with test keystore for team distribution
3. **Beta Releases**: Signing with beta keystore for limited distribution
4. **Production Releases**: Signing with production keystore for app stores
5. **Signature Verification**: Ensuring APKs are properly signed
6. **Keystore Management**: Creating and organizing signing keys

This MCP server makes APK signing as simple as asking your chat LLM to "sign my app" - no need to remember complex command-line parameters!

---

## 🔌 **Integration with MCP Clients**

### **Configuration Examples**

The server works with any MCP-compatible client. Here are configuration examples for popular clients:

#### **Claude Desktop**
```json
{
  "mcpServers": {
    "uber-apk-signer": {
      "command": "node",
      "args": ["/path/to/uber-apk-signer-mcp/dist/index.js"],
      "cwd": "/path/to/uber-apk-signer-mcp"
    }
  }
}
```

#### **Ollama**
```yaml
mcp_servers:
  uber-apk-signer:
    command: node
    args: ["/path/to/uber-apk-signer-mcp/dist/index.js"]
    cwd: "/path/to/uber-apk-signer-mcp"
```

#### **Generic MCP Client**
Most MCP clients use this configuration structure:
```json
{
  "mcpServers": {
    "uber-apk-signer": {
      "command": "node",
      "args": ["/path/to/uber-apk-signer-mcp/dist/index.js"],
      "cwd": "/path/to/uber-apk-signer-mcp"
    }
  }
}
```

### **Custom MCP Client Implementation**

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
    apkPath: '/path/to/app.apk'
  },
});

console.log('Result:', result);
```

### **Environment Setup**

The server automatically loads configuration from a `.env` file in your project directory. Create one with your uber-apk-signer path:

```bash
# Create .env file
echo "UBER_APK_SIGNER_PATH=/path/to/uber-apk-signer" > .env
```

Or set the environment variable directly:

```bash
# Set the path to your Uber APK Signer tool
export UBER_APK_SIGNER_PATH="/usr/local/bin/uber-apk-signer"

# Or add to your shell profile
echo 'export UBER_APK_SIGNER_PATH="/usr/local/bin/uber-apk-signer"' >> ~/.bashrc
```

**Note**: Replace `/path/to/uber-apk-signer-mcp` with the actual path to your installation directory. 