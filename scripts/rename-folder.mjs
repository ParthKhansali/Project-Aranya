import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const currentDir = path.resolve(__filename, '../..');
const parentDir = path.dirname(currentDir);
const targetDir = path.join(parentDir, 'aranya');

if (fs.existsSync(targetDir)) {
  console.log(`Target directory ${targetDir} already exists.`);
} else {
  console.log(`Renaming from: ${currentDir}`);
  console.log(`          to: ${targetDir}`);
  fs.renameSync(currentDir, targetDir);
  console.log('Folder successfully renamed to aranya!');
}
