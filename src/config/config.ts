import { z } from 'zod';

// Configuration schema
export const ConfigSchema = z.object({
  uberApkSigner: z.object({
    path: z.string().default('uber-apk-signer'),
    timeout: z.number().default(300000), // 5 minutes
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
  server: z.object({
    name: z.string().default('uber-apk-signer-mcp'),
    version: z.string().default('1.0.0'),
    transport: z.enum(['stdio', 'tcp']).default('stdio'),
    tcp: z.object({
      host: z.string().default('localhost'),
      port: z.number().default(3000),
    }),
  }),
  security: z.object({
    allowInsecureConnections: z.boolean().default(false),
    maxFileSize: z.number().default(100 * 1024 * 1024), // 100MB
  }),
});

export type Config = z.infer<typeof ConfigSchema>;

// Default configuration
export const defaultConfig: Config = {
  uberApkSigner: {
    path: 'uber-apk-signer',
    timeout: 300000,
    logLevel: 'info',
  },
  server: {
    name: 'uber-apk-signer-mcp',
    version: '1.0.0',
    transport: 'stdio',
    tcp: {
      host: 'localhost',
      port: 3000,
    },
  },
  security: {
    allowInsecureConnections: false,
    maxFileSize: 100 * 1024 * 1024,
  },
};

// Load configuration from environment variables
export function loadConfig(): Config {
  const envConfig = {
    uberApkSigner: {
      path: process.env.UBER_APK_SIGNER_PATH,
      timeout: process.env.UBER_APK_SIGNER_TIMEOUT ? parseInt(process.env.UBER_APK_SIGNER_TIMEOUT) : undefined,
      logLevel: process.env.UBER_APK_SIGNER_LOG_LEVEL as any,
    },
    server: {
      name: process.env.MCP_SERVER_NAME,
      version: process.env.MCP_SERVER_VERSION,
      transport: process.env.MCP_TRANSPORT as any,
      tcp: {
        host: process.env.MCP_TCP_HOST,
        port: process.env.MCP_TCP_PORT ? parseInt(process.env.MCP_TCP_PORT) : undefined,
      },
    },
    security: {
      allowInsecureConnections: process.env.MCP_ALLOW_INSECURE === 'true',
      maxFileSize: process.env.MCP_MAX_FILE_SIZE ? parseInt(process.env.MCP_MAX_FILE_SIZE) : undefined,
    },
  };

  // Merge with defaults, filtering out undefined values
  const mergedConfig = {
    uberApkSigner: {
      ...defaultConfig.uberApkSigner,
      ...Object.fromEntries(Object.entries(envConfig.uberApkSigner).filter(([_, v]) => v !== undefined)),
    },
    server: {
      ...defaultConfig.server,
      ...Object.fromEntries(Object.entries(envConfig.server).filter(([_, v]) => v !== undefined)),
      tcp: {
        ...defaultConfig.server.tcp,
        ...Object.fromEntries(Object.entries(envConfig.server.tcp).filter(([_, v]) => v !== undefined)),
      },
    },
    security: {
      ...defaultConfig.security,
      ...Object.fromEntries(Object.entries(envConfig.security).filter(([_, v]) => v !== undefined)),
    },
  };

  return ConfigSchema.parse(mergedConfig);
} 