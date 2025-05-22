/**
 * watch-docs.js
 * 
 * This script watches for changes to markdown files in the docs directory
 * and automatically copies them to the public/docs directory.
 * 
 * Usage: node scripts/watch-docs.js
 */

import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const docsDir = path.join(__dirname, '../docs');
const publicDocsDir = path.join(__dirname, '../public/docs');

// Ensure the public/docs directory exists
if (!fs.existsSync(publicDocsDir)) {
  fs.mkdirSync(publicDocsDir, { recursive: true });
  console.log(`Created directory: ${publicDocsDir}`);
}

// Function to copy a file
function copyFile(source, destination) {
  fs.copyFile(source, destination, (err) => {
    if (err) {
      console.error(`Error copying ${source} to ${destination}:`, err);
      return;
    }
    console.log(`Copied: ${path.basename(source)} → public/docs/`);
  });
}

// Copy all existing markdown files on startup
console.log('Copying existing markdown files...');
fs.readdir(docsDir, (err, files) => {
  if (err) {
    console.error('Error reading docs directory:', err);
    return;
  }

  files.filter(file => file.endsWith('.md')).forEach(file => {
    const sourcePath = path.join(docsDir, file);
    const destPath = path.join(publicDocsDir, file);
    copyFile(sourcePath, destPath);
  });
});

// Watch for changes to markdown files
console.log(`Watching for changes in ${docsDir}...`);
const watcher = chokidar.watch(`${docsDir}/*.md`, {
  persistent: true,
  ignoreInitial: true
});

// Copy files when they're added or changed
watcher
  .on('add', filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(publicDocsDir, fileName);
    copyFile(filePath, destPath);
  })
  .on('change', filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(publicDocsDir, fileName);
    copyFile(filePath, destPath);
  })
  .on('unlink', filePath => {
    const fileName = path.basename(filePath);
    const destPath = path.join(publicDocsDir, fileName);
    
    // Remove the file from public/docs if it's deleted from docs
    fs.unlink(destPath, err => {
      if (err && err.code !== 'ENOENT') {
        console.error(`Error removing ${destPath}:`, err);
        return;
      }
      console.log(`Removed: ${fileName} from public/docs/`);
    });
  });

console.log('Watching for changes to markdown files. Press Ctrl+C to stop.');
