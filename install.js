#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const os = require('os');

const scriptName = 'cpr';
const scriptPath = path.join(__dirname, scriptName);

function getInstallPath() {
  const platform = os.platform();
  
  switch(platform) {
    case 'darwin':
    case 'linux':
      return '/usr/local/bin';
    case 'win32':
      // On Windows, we'll add to npm's global bin directory
      try {
        const npmBin = execSync('npm bin -g', { encoding: 'utf8' }).trim();
        return npmBin;
      } catch {
        // Fallback to a common location
        return path.join(process.env.APPDATA || '', 'npm');
      }
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function makeExecutable() {
  if (os.platform() !== 'win32') {
    try {
      fs.chmodSync(scriptPath, '755');
      console.log(`✓ Made ${scriptName} executable`);
    } catch (error) {
      console.error(`Failed to make script executable: ${error.message}`);
      process.exit(1);
    }
  }
}

function installScript() {
  const installDir = getInstallPath();
  const destPath = path.join(installDir, scriptName);
  
  console.log(`Installing ${scriptName} to ${installDir}...`);
  
  // Check if install directory exists
  if (!fs.existsSync(installDir)) {
    console.error(`Install directory does not exist: ${installDir}`);
    console.error('You may need to create it with: sudo mkdir -p ' + installDir);
    process.exit(1);
  }
  
  // Make script executable first
  makeExecutable();
  
  // Try to copy the script
  try {
    // Check if we have write permissions
    fs.accessSync(installDir, fs.constants.W_OK);
    
    // Copy the script
    fs.copyFileSync(scriptPath, destPath);
    
    // On Windows, create a batch file wrapper
    if (os.platform() === 'win32') {
      const batchContent = `@echo off\nbash "%~dp0${scriptName}" %*`;
      fs.writeFileSync(destPath + '.cmd', batchContent);
      console.log(`✓ Created Windows batch wrapper`);
    }
    
    console.log(`✓ Successfully installed ${scriptName} to ${destPath}`);
    console.log(`You can now use the '${scriptName}' command from anywhere!`);
    
  } catch (error) {
    if (error.code === 'EACCES') {
      console.error(`Permission denied. Trying with sudo...`);
      
      // On Unix-like systems, try with sudo
      if (os.platform() !== 'win32') {
        try {
          execSync(`sudo cp "${scriptPath}" "${destPath}"`, { stdio: 'inherit' });
          execSync(`sudo chmod 755 "${destPath}"`, { stdio: 'inherit' });
          console.log(`✓ Successfully installed ${scriptName} to ${destPath} (with sudo)`);
          console.log(`You can now use the '${scriptName}' command from anywhere!`);
        } catch (sudoError) {
          console.error(`Failed to install with sudo: ${sudoError.message}`);
          console.error(`\nManual installation steps:`);
          console.error(`1. sudo cp "${scriptPath}" "${destPath}"`);
          console.error(`2. sudo chmod 755 "${destPath}"`);
          process.exit(1);
        }
      } else {
        console.error(`Failed to install: ${error.message}`);
        console.error(`\nTry running as Administrator or copy manually:`);
        console.error(`copy "${scriptPath}" "${destPath}"`);
        process.exit(1);
      }
    } else {
      console.error(`Failed to install: ${error.message}`);
      process.exit(1);
    }
  }
}

// Check if script exists
if (!fs.existsSync(scriptPath)) {
  console.error(`Script not found: ${scriptPath}`);
  process.exit(1);
}

// Check for bash on Windows
if (os.platform() === 'win32') {
  try {
    execSync('bash --version', { stdio: 'ignore' });
  } catch {
    console.warn('Warning: bash not found. Make sure Git Bash or WSL is installed.');
    console.warn('The cpr script requires bash to run on Windows.');
  }
}

// Run installation
installScript();