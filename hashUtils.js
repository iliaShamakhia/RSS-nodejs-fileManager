import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { printOperationFailed } from './consoleUtils.js';

export function calculateHash(currentDir, path) {
    const filePath = resolve(currentDir, path);
    const stream = createReadStream(filePath);
    const hash = createHash('sha256');

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => console.log(hash.digest('hex')));
    stream.on('error', () => printOperationFailed());
}