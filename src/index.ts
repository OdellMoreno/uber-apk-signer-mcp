#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ApkSignerTools } from './tools/apk-signer-tools.js';
import { Command } from 'commander';

async function main() {
  const program = new Command();
  
  program
    .name('uber-apk-signer-mcp')
    .description('MCP server for Uber APK Signer tool integration')
    .version('1.0.0');

  program
    .option('-p, --port <port>', 'Port for TCP transport (optional)')
    .option('-h, --host <host>', 'Host for TCP transport (default: localhost)')
    .option('--stdio', 'Use stdio transport (default)')
    .parse();

  const options = program.opts();

  // Create MCP server
  const server = new Server(
    {
      name: 'uber-apk-signer-mcp',
      version: '1.0.0',
    }
  );

  // Register tools
  const apkSignerTools = new ApkSignerTools();
  server.setRequestHandler(apkSignerTools.listTools, apkSignerTools.handleListTools);
  server.setRequestHandler(apkSignerTools.callTool, apkSignerTools.handleCallTool);

  // For now, only support stdio transport
  // TCP transport can be added later when needed
  const transport = new StdioServerTransport();
  console.log('Starting MCP server with stdio transport');
  await server.connect(transport);

  console.log('Uber APK Signer MCP server is running');
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
}); 