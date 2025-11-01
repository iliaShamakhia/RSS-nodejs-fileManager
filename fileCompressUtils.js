import { createBrotliCompress, createBrotliDecompress } from 'node:zlib';
import { createReadStream, createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream';
import { resolve } from 'node:path';
import { printOperationFailed } from './consoleUtils';

export function compressFile(currentDir, source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const brotli = createBrotliCompress();

    pipeline(readStream, brotli, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}

export function decompressFile(currentDir, source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const brotli = createBrotliDecompress();

    pipeline(readStream, brotli, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}