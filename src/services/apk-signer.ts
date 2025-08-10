import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export interface SignApkOptions {
  apkPath: string;
  keystorePath: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  outputPath?: string;
}

export interface SignApkResult {
  outputPath: string;
  size: number;
}

export interface VerifyApkResult {
  isValid: boolean;
  signer: string;
  certificate: string;
}

export interface KeystoreInfo {
  path: string;
  type: string;
}

export interface CreateKeystoreOptions {
  keystorePath: string;
  keystorePassword: string;
  keyAlias: string;
  keyPassword: string;
  commonName: string;
  organization: string;
}

export class ApkSigner {
  private uberApkSignerPath: string;

  constructor() {
    // You can configure this path or make it configurable
    this.uberApkSignerPath = process.env.UBER_APK_SIGNER_PATH || 'uber-apk-signer';
  }

  async signApk(options: SignApkOptions): Promise<SignApkResult> {
    const {
      apkPath,
      keystorePath,
      keystorePassword,
      keyAlias,
      keyPassword,
      outputPath,
    } = options;

    // Validate inputs
    await this.validateFileExists(apkPath, 'APK file');
    await this.validateFileExists(keystorePath, 'Keystore file');

    const finalOutputPath = outputPath || this.generateOutputPath(apkPath);

    // Build the command for Uber APK Signer
    const command = [
      this.uberApkSignerPath.endsWith('.jar') ? `java -jar "${this.uberApkSignerPath}"` : this.uberApkSignerPath,
      
      'sign',
      '--apk', apkPath,
      '--keystore', keystorePath,
      '--keystore-pass', keystorePassword,
      '--key-alias', keyAlias,
      '--key-pass', keyPassword,
      '--output', finalOutputPath,
    ].join(' ');

    try {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn('Stderr output:', stderr);
      }

      console.log('Stdout output:', stdout);

      // Verify the output file was created
      const stats = await fs.stat(finalOutputPath);
      
      return {
        outputPath: finalOutputPath,
        size: stats.size,
      };
    } catch (error) {
      throw new Error(`Failed to sign APK: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async verifyApkSignature(apkPath: string): Promise<VerifyApkResult> {
    await this.validateFileExists(apkPath, 'APK file');

    const command = [
      this.uberApkSignerPath,
      'verify',
      '--apk', apkPath,
    ].join(' ');

    try {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn('Stderr output:', stderr);
      }

      // Parse the verification output
      // This is a simplified parser - you may need to adjust based on actual output format
      const isValid = !stdout.includes('INVALID') && !stdout.includes('FAILED');
      const signerMatch = stdout.match(/Signer:\s*(.+)/);
      const certificateMatch = stdout.match(/Certificate:\s*(.+)/);

      return {
        isValid,
        signer: signerMatch ? signerMatch[1].trim() : 'Unknown',
        certificate: certificateMatch ? certificateMatch[1].trim() : 'Unknown',
      };
    } catch (error) {
      throw new Error(`Failed to verify APK signature: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async listKeystores(directory: string): Promise<KeystoreInfo[]> {
    try {
      const files = await fs.readdir(directory);
      const keystores: KeystoreInfo[] = [
    ];

      for (const file of files) {
        const filePath = path.join(directory, file);
        const stats = await fs.stat(filePath);
        
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          if (ext === '.jks' || ext === '.keystore' || ext === '.p12' || ext === '.pfx') {
            keystores.push({
              path: filePath,
              type: ext.substring(1).toUpperCase(),
            });
          }
        }
      }

      return keystores;
    } catch (error) {
      throw new Error(`Failed to list keystores: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async createKeystore(options: CreateKeystoreOptions): Promise<void> {
    const {
      keystorePath,
      keystorePassword,
      keyAlias,
      keyPassword,
      commonName,
      organization,
    } = options;

    // Check if keystore already exists
    try {
      await fs.access(keystorePath);
      throw new Error(`Keystore already exists at: ${keystorePath}`);
    } catch {
      // File doesn't exist, proceed with creation
    }

    // Build the command for creating a keystore
    const command = [
      this.uberApkSignerPath,
      'create-keystore',
      '--keystore', keystorePath,
      '--keystore-pass', keystorePassword,
      '--key-alias', keyAlias,
      '--key-pass', keyPassword,
      '--common-name', commonName,
      '--organization', organization,
    ].join(' ');

    try {
      console.log(`Executing: ${command}`);
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn('Stderr output:', stderr);
      }

      console.log('Stdout output:', stdout);

      // Verify the keystore was created
      await this.validateFileExists(keystorePath, 'Keystore file');
    } catch (error) {
      throw new Error(`Failed to create keystore: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async validateFileExists(filePath: string, fileType: string): Promise<void> {
    try {
      await fs.access(filePath);
    } catch {
      throw new Error(`${fileType} not found at: ${filePath}`);
    }
  }

  private generateOutputPath(apkPath: string): string {
    const dir = path.dirname(apkPath);
    const name = path.basename(apkPath, path.extname(apkPath));
    const ext = path.extname(apkPath);
    return path.join(dir, `${name}-signed${ext}`);
  }

  // Method to check if Uber APK Signer is available
  async checkAvailability(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`${this.uberApkSignerPath.endsWith('.jar') ? `java -jar "${this.uberApkSignerPath}"` : this.uberApkSignerPath} --version`);
      console.log(`Uber APK Signer version: ${stdout.trim()}`);
      return true;
    } catch {
      return false;
    }
  }
} 