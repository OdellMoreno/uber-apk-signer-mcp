import {
  CallToolRequestSchema,
  CallToolResultSchema,
  ListToolsRequestSchema,
  ListToolsResultSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { ApkSigner } from '../services/apk-signer.js';

export class ApkSignerTools {
  private apkSigner: ApkSigner;

  constructor() {
    this.apkSigner = new ApkSigner();
  }

  // Tool definitions
  readonly listTools = ListToolsRequestSchema;
  readonly callTool = CallToolRequestSchema;

    handleListTools = async (): Promise<z.infer<typeof ListToolsResultSchema>> => {
    return {
      tools: [
        {
          name: 'sign_apk',
          description: 'Sign an APK file using Uber APK Signer. Only apkPath is required - other parameters can use defaults or be configured.',
          inputSchema: {
            type: 'object',
            properties: {
              apkPath: {
                type: 'string',
                description: 'Path to the APK file to sign (required)',
              },
              keystorePath: {
                type: 'string',
                description: 'Path to the keystore file (defaults to ~/.android/debug.keystore)',
                default: '~/.android/debug.keystore',
              },
              keystorePassword: {
                type: 'string',
                description: 'Password for the keystore (defaults to "android")',
                default: 'android',
              },
              keyAlias: {
                type: 'string',
                description: 'Alias of the key to use for signing (defaults to "androiddebugkey")',
                default: 'androiddebugkey',
              },
              keyPassword: {
                type: 'string',
                description: 'Password for the key (defaults to "android")',
                default: 'android',
              },
              outputPath: {
                type: 'string',
                description: 'Output path for the signed APK (optional, auto-generated if not provided)',
              },
            },
            required: ['apkPath'],
          },
        },
        {
          name: 'verify_apk_signature',
          description: 'Verify the signature of an APK file',
          inputSchema: {
            type: 'object',
            description: 'Verify the signature of an APK file',
            properties: {
              apkPath: {
                type: 'string',
                description: 'Path to the APK file to verify',
              },
            },
            required: ['apkPath'],
          },
        },
        {
          name: 'list_keystores',
          description: 'List available keystores in a directory',
          inputSchema: {
            type: 'object',
            properties: {
              directory: {
                type: 'string',
                description: 'Directory to search for keystores',
                default: '.',
              },
            },
            required: [],
          },
        },
        {
          name: 'create_keystore',
          description: 'Create a new keystore for APK signing',
          inputSchema: {
            type: 'object',
            properties: {
              keystorePath: {
                type: 'string',
                description: 'Path where to create the keystore',
              },
              keystorePassword: {
                type: 'string',
                description: 'Password for the keystore',
              },
              keyAlias: {
                type: 'string',
                description: 'Alias for the key',
              },
              keyPassword: {
                type: 'string',
                description: 'Password for the key',
              },
              commonName: {
                type: 'string',
                description: 'Common name for the certificate',
                default: 'APK Signer',
              },
              organization: {
                type: 'string',
                description: 'Organization name',
                default: 'Your Organization',
              },
            },
            required: ['keystorePath', 'keystorePassword', 'keyAlias', 'keyPassword'],
          },
        },
      ],
    };
  }

  handleCallTool = async (request: z.infer<typeof CallToolRequestSchema>): Promise<z.infer<typeof CallToolResultSchema>> => {
    const { params } = request;
    const { name, arguments: args } = params;

    try {
      switch (name) {
        case 'sign_apk':
          return await this.handleSignApk(args);

        case 'verify_apk_signature':
          return await this.handleVerifyApkSignature(args);

        case 'list_keystores':
          return await this.handleListKeystores(args);

        case 'create_keystore':
          return await this.handleCreateKeystore(args);

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Error executing tool ${name}: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleSignApk(args: any): Promise<z.infer<typeof CallToolResultSchema>> {
    const result = await this.apkSigner.signApk({
      apkPath: args.apkPath,
      keystorePath: args.keystorePath,
      keystorePassword: args.keystorePassword,
      keyAlias: args.keyAlias,
      keyPassword: args.keyPassword,
      outputPath: args.outputPath,
    });

    return {
      content: [
        {
          type: 'text',
          text: `APK signed successfully!\nOutput: ${result.outputPath}\nSize: ${result.size} bytes`,
        },
      ],
      isError: false,
    };
  }

  private async handleVerifyApkSignature(args: any): Promise<z.infer<typeof CallToolResultSchema>> {
    const result = await this.apkSigner.verifyApkSignature(args.apkPath);

    return {
      content: [
        {
          type: 'text',
          text: `APK signature verification:\nValid: ${result.isValid}\nSigner: ${result.signer}\nCertificate: ${result.certificate}`,
        },
      ],
      isError: false,
    };
  }

  private async handleListKeystores(args: any): Promise<z.infer<typeof CallToolResultSchema>> {
    const keystores = await this.apkSigner.listKeystores(args.directory || '.');

    return {
      content: [
        {
          type: 'text',
          text: `Found ${keystores.length} keystore(s):\n${keystores.map(k => `- ${k.path} (${k.type})`).join('\n')}`,
        },
      ],
      isError: false,
    };
  }

  private async handleCreateKeystore(args: any): Promise<z.infer<typeof CallToolResultSchema>> {
    await this.apkSigner.createKeystore({
      keystorePath: args.keystorePath,
      keystorePassword: args.keystorePassword,
      keyAlias: args.keyAlias,
      keyPassword: args.keyPassword,
      commonName: args.commonName || 'APK Signer',
      organization: args.organization || 'Your Organization',
    });

    return {
      content: [
        {
          type: 'text',
          text: `Keystore created successfully at: ${args.keystorePath}`,
        },
      ],
      isError: false,
    };
  }
} 