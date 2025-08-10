#!/usr/bin/env node

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPClient() {
  console.log('🧪 Testing MCP Client Connection\n');
  
  try {
    // Create MCP client
    const client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });
    
    // Create transport to our server
    const transport = new StdioClientTransport({
      command: 'node',
      args: [join(__dirname, 'dist/index.js')],
      cwd: __dirname,
    });
    
    console.log('🔌 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected successfully!');
    
    // Test 1: List available tools
    console.log('\n📋 Testing: List Tools');
    const tools = await client.listTools();
    console.log(`Found ${tools.tools.length} tools:`);
    tools.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    
    // Test 2: Try to call list_keystores tool
    console.log('\n🔧 Testing: Call list_keystores tool');
    try {
      const result = await client.callTool({
        name: 'list_keystores',
        arguments: { directory: '.' }
      });
      
      if (result.isError) {
        console.log('⚠️  Tool returned error (expected without uber-apk-signer):');
        console.log(result.content[0].text);
      } else {
        console.log('✅ Tool executed successfully:');
        console.log(result.content[0].text);
      }
    } catch (error) {
      console.log('⚠️  Tool call failed (expected without uber-apk-signer):');
      console.log(error.message);
    }
    
    // Test 3: Test tool schema
    console.log('\n📊 Testing: Tool Schema');
    const signApkTool = tools.tools.find(t => t.name === 'sign_apk');
    if (signApkTool) {
      console.log('sign_apk tool schema:');
      console.log(`  Required: ${signApkTool.inputSchema.required.join(', ')}`);
      console.log(`  Properties: ${Object.keys(signApkTool.inputSchema.properties).join(', ')}`);
    }
    
    console.log('\n🎉 MCP Client Test Complete!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testMCPClient(); 