import { cp, rename, unlink, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, join } from 'node:path';
import { printCurrentDirectory, printOperationFailed } from './consoleUtils.js';

export function readFile(currentDir, path) {
    const filePath = resolve(currentDir, path);
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    stream.on('data', chunk => console.log(chunk));
    stream.on('end', () => printCurrentDirectory(currentDir));
    stream.on('error', () => printOperationFailed());
}

export async function createFile(currentDir, name) {
    const filePath = join(currentDir, name);
    try{
        await writeFile(filePath, '');
    }catch{
        printOperationFailed();
    }
}

export async function renameFile(currentDir, oldName, newName) {
    const oldPath = resolve(currentDir, oldName);
    const newPath = resolve(currentDir, newName);
    try{
        await rename(oldPath, newPath);
    }catch{
        printOperationFailed();
    }
}

export async function copyFile(currentDir, source, destination, toDelete = false) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination);

    try{
        await cp(sourcePath, destPath);
        if (toDelete) await deleteFile(currentDir, source);
    }catch{
        printOperationFailed();
    }
}

export async function moveFile(currentDir, source, destination) {
    await copyFile(currentDir, source, destination, true);
}

export async function deleteFile(currentDir, path) {
    const filePath = resolve(currentDir, path);
    try{
        await unlink(filePath);
    }catch{
        printOperationFailed();
    }
}