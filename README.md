# Uber APK Signer MCP Server

An MCP (Model Context Protocol) server that provides access to the Uber APK Signer tool through your chat LLM. This allows you to sign APK files, verify signatures, manage keystores, and perform other APK signing operations directly from your chat interface.

## Features

- **Sign APK Files**: Sign APK files using existing keystores
- **Verify Signatures**: Verify the signature of APK files
- **Keystore Management**: List available keystores and create new ones
- **Flexible Transport**: Support for both stdio and TCP transport modes
- **Configurable**: Environment-based configuration for easy customization

## Prerequisites

- Node.js 18.0.0 or higher
- Uber APK Signer tool installed and accessible in your PATH
- Java Runtime Environment (JRE) for APK signing operations

## Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd uber-apk-signer-mcp
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

## Configuration

### Environment Variables

You can configure the server using environment variables:

```bash
# Uber APK Signer configuration
export UBER_APK_SIGNER_PATH="/path/to/uber-apk-signer"
export UBER_APK_SIGNER_TIMEOUT=300000
export UBER_APK_SIGNER_LOG_LEVEL=info

# MCP Server configuration
export MCP_SERVER_NAME="uber-apk-signer-mcp"
export MCP_TRANSPORT="stdio"  # or "tcp"
export MCP_TCP_HOST="localhost"
export MCP_TCP_PORT=3000

# Security settings
export MCP_ALLOW_INSECURE=false
export MCP_MAX_FILE_SIZE=104857600
```

### Uber APK Signer Path

Make sure the Uber APK Signer tool is accessible. You can either:
- Add it to your system PATH, or
- Set the `UBER_APK_SIGNER_PATH` environment variable to the full path

## Usage

### Starting the Server

#### Stdio Transport (Default)
```bash
npm start
```

#### TCP Transport
```bash
npm start -- --port 3000 --host localhost
```

### Available Tools

The MCP server provides the following tools:

#### 1. Sign APK (`sign_apk`)
Sign an APK file using a keystore. **Only `apkPath` is required** - other parameters use smart defaults.

**Parameters:**
- `apkPath` (required): Path to the APK file to sign
- `keystorePath` (optional): Path to the keystore file (defaults to `~/.android/debug.keystore`)
- `keystorePassword` (optional): Password for the keystore (defaults to `android`)
- `keyAlias` (optional): Alias of the key to use for signing (defaults to `androiddebugkey`)
- `keyPassword` (optional): Password for the key (defaults to `android`)
- `outputPath` (optional): Output path for the signed APK (auto-generated if not provided)

**Examples:**

**Simple signing (development/testing):**
```json
{
  "apkPath": "./app.apk"
}
```

**Production signing with custom keystore:**
```json
{
  "apkPath": "./release.apk",
  "keystorePath": "~/keys/release.keystore",
  "keystorePassword": "mysecret",
  "keyAlias": "release-key",
  "keyPassword": "mysecret"
}
```

**Chat usage:**
- "Can you sign my app.apk file?" (uses debug keystore defaults)
- "Sign my release.apk with my production keystore" (asks for keystore details)

#### 2. Verify APK Signature (`verify_apk_signature`)
Verify the signature of an APK file.

**Parameters:**
- `apkPath` (required): Path to the APK file to verify

**Example:**
```json
{
  "apkPath": "/path/to/app.apk"
}
```

#### 3. List Keystores (`list_keystores`)
List available keystores in a directory.

**Parameters:**
- `directory` (optional): Directory to search for keystores (default: current directory)

**Example:**
```json
{
  "directory": "/path/to/keystores"
}
```

#### 4. Create Keystore (`create_keystore`)
Create a new keystore for APK signing.

**Parameters:**
- `keystorePath` (required): Path where to create the keystore
- `keystorePassword` (required): Password for the keystore
- `keyAlias` (required): Alias for the key
- `keyPassword` (required): Password for the key
- `commonName` (optional): Common name for the certificate
- `organization` (optional): Organization name

**Example:**
```json
{
  "keystorePath": "/path/to/new-keystore.jks",
  "keystorePassword": "newpass123",
  "keyAlias": "release",
  "keyPassword": "newkey123",
  "commonName": "My App",
  "organization": "My Company"
}
```

## Integration with Chat LLMs

### MCP Client Configuration

The server supports stdio transport and can be integrated with any MCP-compatible client. Here are configuration examples for popular clients:

#### Claude Desktop
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

#### Ollama
```yaml
# In your Ollama configuration
mcp_servers:
  uber-apk-signer:
    command: node
    args: ["/path/to/uber-apk-signer-mcp/dist/index.js"]
    cwd: "/path/to/uber-apk-signer-mcp"
```

#### Custom MCP Client
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
```

#### Generic Configuration
Most MCP clients use a similar configuration structure:
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

**Note**: Replace `/path/to/uber-apk-signer-mcp` with the actual path to your installation directory.

## Development

### Project Structure

```
src/
├── index.ts              # Main server entry point
├── tools/
│   └── apk-signer-tools.ts  # MCP tool implementations
├── services/
│   └── apk-signer.ts        # APK signing service
└── config/
    └── config.ts             # Configuration management
```

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Testing

```bash
npm test
```

## Troubleshooting

### Common Issues

1. **"Uber APK Signer not found"**
   - Ensure the tool is installed and accessible
   - Check the `UBER_APK_SIGNER_PATH` environment variable
   - Verify the tool works from command line

2. **"Permission denied"**
   - Check file permissions for APK and keystore files
   - Ensure the server has read/write access to the working directory

3. **"Keystore password incorrect"**
   - Verify the keystore password and key password
   - Check if the keystore file is corrupted

4. **"APK file not found"**
   - Verify the APK file path is correct
   - Ensure the file exists and is readable

### Debug Mode

Enable debug logging by setting:
```bash
export UBER_APK_SIGNER_LOG_LEVEL=debug
```

## Security Considerations

- **Keystore Security**: Keep your keystore files and passwords secure
- **File Access**: The server needs access to APK and keystore files
- **Network Security**: When using TCP transport, consider firewall rules
- **Input Validation**: All inputs are validated before processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs with debug mode enabled
3. Open an issue on GitHub
4. Contact your internal team for Uber APK Signer specific issues 