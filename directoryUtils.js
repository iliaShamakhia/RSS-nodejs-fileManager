import { resolve, join, dirname } from 'node:path';
import { readdir, stat, access } from 'node:fs/promises';
import { mkdir } from 'node:fs/promises';
import { printOperationFailed } from './consoleUtils.js';

export function parseArgs(input) {
    if (!input){
        return [];
    }
    const regex = /(?:[^\s"]+|"[^"]*")+/g;
    return input?.match(regex)?.map(arg => arg.replace(/^"|"$/g, ''));
}

export function goUp(currentDir) {
    const parentDir = dirname(currentDir);
    if (parentDir !== currentDir) {
        currentDir = parentDir;
    }
    return currentDir;
}

export async function changeDirectory(currentDir, path) {
    const newPath = resolve(currentDir, path);
    try{
        await access(newPath);
    }catch(e){
        printOperationFailed();
    }
    return newPath;
}

export async function createDirectory(currentDir, name) {
    const dirPath = join(currentDir, name);
    try{
        await mkdir(dirPath);
    }catch(e){
        printOperationFailed();
    }
}

export async function listDirectory(currentDir) {
    try {
        const files = await readdir(currentDir);
        const fileDetails = await Promise.all(
            files.map(async file => {
                const filePath = join(currentDir, file);
                const fileStat = await stat(filePath);
                return { name: file, type: fileStat.isDirectory() ? 'directory' : 'file' };
            })
        );

        fileDetails.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name);
            }
            return a.type === 'directory' ? -1 : 1;
        });

        console.table(fileDetails);
    } catch {
        printOperationFailed();
    }
}