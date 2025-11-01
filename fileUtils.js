import { rename, unlink, writeFile } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { resolve, join } from 'node:path';
import { pipeline } from 'node:stream';
import { printCurrentDirectory, printOperationFailed } from './consoleUtils';

export function readFile(currentDir, path) {
    const filePath = resolve(currentDir, path);
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    stream.on('data', chunk => console.log(chunk));
    stream.on('end', () => printCurrentDirectory());
    stream.on('error', () => printOperationFailed());
}

export async function createFile(currentDir, name) {
    const filePath = join(currentDir, name);
    try{
        await writeFile(filePath, '');
    }catch(e){
        printOperationFailed();
    }
}

export async function renameFile(currentDir, oldName, newName) {
    const oldPath = resolve(currentDir, oldName);
    const newPath = resolve(currentDir, newName);
    try{
        await rename(oldPath, newPath);
    }catch(e){
        printOperationFailed();
    }
}

export function copyFile(currentDir, source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination, source);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);

    pipeline(readStream, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}

export async function moveFile(currentDir, source, destination) {
    copyFile(currentDir, source, destination);
    await deleteFile(currentDir, source);
}

export async function deleteFile(currentDir, path) {
    const filePath = resolve(currentDir, path);
    try{
        await unlink(filePath);
    }catch(e){
        printOperationFailed();
    }
}