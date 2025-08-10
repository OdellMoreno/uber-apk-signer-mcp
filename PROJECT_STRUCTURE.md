# Project Structure

This document provides an overview of the Uber APK Signer MCP Server project structure.

## Directory Layout

```
uber-apk-signer-mcp/
├── src/                          # Source code
│   ├── index.ts                  # Main server entry point
│   ├── tools/                    # MCP tool implementations
│   │   └── apk-signer-tools.ts  # Tool handlers for APK signing operations
│   ├── services/                 # Business logic services
│   │   └── apk-signer.ts        # APK signing service implementation
│   └── config/                   # Configuration management
│       └── config.ts             # Environment-based configuration
├── dist/                         # Built JavaScript files (generated)
├── examples/                     # Usage examples and documentation
│   └── example-usage.md         # Detailed usage examples
├── package.json                  # Node.js package configuration
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # Main project documentation
├── PROJECT_STRUCTURE.md          # This file
├── quick-start.sh                # Quick setup script
└── .gitignore                    # Git ignore patterns
```

## Key Components

### 1. Main Server (`src/index.ts`)
- **Purpose**: Entry point for the MCP server
- **Responsibilities**:
  - Initialize the MCP server
  - Register tool handlers
  - Set up transport (currently stdio only)
  - Handle command-line arguments

### 2. Tool Handlers (`src/tools/apk-signer-tools.ts`)
- **Purpose**: Implement MCP tool interfaces
- **Tools Provided**:
  - `sign_apk`: Sign APK files
  - `verify_apk_signature`: Verify APK signatures
  - `list_keystores`: List available keystores
  - `create_keystore`: Create new keystores

### 3. APK Signer Service (`src/services/apk-signer.ts`)
- **Purpose**: Core business logic for APK operations
- **Responsibilities**:
  - Execute Uber APK Signer commands
  - Handle file operations
  - Validate inputs
  - Parse command outputs

### 4. Configuration (`src/config/config.ts`)
- **Purpose**: Centralized configuration management
- **Features**:
  - Environment variable support
  - Type-safe configuration
  - Default values
  - Validation

## Build Output

After running `npm run build`, the `dist/` directory contains:
- Compiled JavaScript files
- TypeScript declaration files
- Source maps for debugging

## Development Workflow

1. **Install Dependencies**: `npm install`
2. **Development Mode**: `npm run dev` (uses tsx for fast iteration)
3. **Build**: `npm run build`
4. **Production**: `npm start`

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `UBER_APK_SIGNER_PATH` | Path to Uber APK Signer tool | `uber-apk-signer` |
| `UBER_APK_SIGNER_TIMEOUT` | Command timeout in milliseconds | `300000` (5 min) |
| `UBER_APK_SIGNER_LOG_LEVEL` | Logging level | `info` |
| `MCP_SERVER_NAME` | Server name | `uber-apk-signer-mcp` |
| `MCP_TRANSPORT` | Transport type | `stdio` |

### File Paths

- **APK Files**: Any readable APK file path
- **Keystores**: JKS, P12, or PFX files
- **Output**: Configurable output paths for signed APKs

## Integration Points

### MCP Protocol
- Implements MCP v1.0 specification
- Supports stdio transport
- Tool-based interface for APK operations

### Uber APK Signer
- Executes shell commands
- Parses command outputs
- Handles errors gracefully

### File System
- Reads APK and keystore files
- Writes signed APK outputs
- Manages keystore creation

## Security Considerations

- **Input Validation**: All file paths and parameters are validated
- **File Permissions**: Respects existing file permissions
- **Keystore Security**: No keystore passwords are logged
- **Command Injection**: Uses proper command construction

## Error Handling

- **File Not Found**: Clear error messages for missing files
- **Permission Errors**: Helpful guidance for file access issues
- **Tool Errors**: Detailed error reporting from Uber APK Signer
- **Validation Errors**: Input validation with helpful messages

## Testing

- **Unit Tests**: Individual component testing
- **Integration Tests**: End-to-end workflow testing
- **Error Scenarios**: Various failure mode testing

## Deployment

### Local Development
- Use `npm run dev` for fast iteration
- Hot reloading with tsx

### Production
- Build with `npm run build`
- Run with `npm start`
- Configure environment variables

### Docker (Future)
- Containerized deployment
- Volume mounts for APK files
- Environment-based configuration 