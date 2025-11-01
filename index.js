import { createReadStream, createWriteStream } from 'node:fs';
import { readdir, stat, rename, unlink, mkdir, access, writeFile } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { homedir, cpus, EOL, userInfo, arch } from 'node:os';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream';
import { createGzip, createGunzip } from 'node:zlib';

const username = process.argv.find(arg => arg.startsWith('--username='))?.split('=')[1] || 'Anonymous';
let currentDir = homedir();

console.log(`Welcome to the File Manager, ${username}!`);
printCurrentDirectory();

process.on("SIGINT", () => {
    printGoodbye();
    process.exit(0);
});

process.stdin.on('data', async (data) => {
    const input = data.toString().trim();
    const [command, ...args] = input.split(' ');

    try {
        switch (command) {
            case 'up':
                goUp();
                break;
            case 'cd':
                await changeDirectory(args[0]);
                break;
            case 'ls':
                await listDirectory();
                break;
            case 'cat':
                readFile(args[0]);
                break;
            case 'add':
                await createFile(args[0]);
                break;
            case 'mkdir':
                await createDirectory(args[0]);
                break;
            case 'rn':
                await renameFile(args[0], args[1]);
                break;
            case 'cp':
                copyFile(args[0], args[1]);
                break;
            case 'mv':
                await moveFile(args[0], args[1]);
                break;
            case 'rm':
                await deleteFile(args[0]);
                break;
            case 'os':
                handleOSCommand(args[0]);
                break;
            case 'hash':
                calculateHash(args[0]);
                break;
            case 'compress':
                compressFile(args[0], args[1]);
                break;
            case 'decompress':
                decompressFile(args[0], args[1]);
                break;
            case '.exit':
                printGoodbye();
                process.exit(0);
            default:
                console.log('Invalid input');
        }
    } catch (error) {
        printOperationFailed();
    }

    printCurrentDirectory();
});

function printCurrentDirectory() {
    console.log(`You are currently in ${currentDir}`);
}

function printGoodbye(){
    console.log(`Thank you for using File Manager, ${username}, goodbye!`);
}

function printOperationFailed(){
    console.log('Operation failed');
}

function goUp() {
    const parentDir = dirname(currentDir);
    if (parentDir !== currentDir) {
        currentDir = parentDir;
    }
}

async function changeDirectory(path) {
    const newPath = resolve(currentDir, path);
    try{
        await access(newPath);
        currentDir = newPath;
    }catch(e){
        printOperationFailed();
    }
} 

async function listDirectory() {
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

function readFile(path) {
    const filePath = resolve(currentDir, path);
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    stream.on('data', chunk => console.log(chunk));
    stream.on('end', () => printCurrentDirectory());
    stream.on('error', () => printOperationFailed());
}

async function createFile(name) {
    const filePath = join(currentDir, name);
    try{
        await writeFile(filePath, '');
    }catch(e){
        printOperationFailed();
    }
}

async function createDirectory(name) {
    const dirPath = join(currentDir, name);
    try{
        await mkdir(dirPath);
    }catch(e){
        printOperationFailed();
    }
}

async function renameFile(oldName, newName) {
    const oldPath = resolve(currentDir, oldName);
    const newPath = resolve(currentDir, newName);
    try{
        await rename(oldPath, newPath);
    }catch(e){
        printOperationFailed();
    }
}

function copyFile(source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination, source);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);

    pipeline(readStream, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}

async function moveFile(source, destination) {
    copyFile(source, destination);
    await deleteFile(source);
}

async function deleteFile(path) {
    const filePath = resolve(currentDir, path);
    try{
        await unlink(filePath);
    }catch(e){
        printOperationFailed();
    }
}

function handleOSCommand(option) {
    switch (option) {
        case '--EOL':
            console.log(JSON.stringify(EOL));
            break;
        case '--cpus':
            const cpuInfo = cpus().map(cpu => ({
                model: cpu.model,
                speed: `${cpu.speed / 1000} GHz`
            }));
            console.log(`Total CPUs: ${cpuInfo.length}`);
            console.table(cpuInfo);
            break;
        case '--homedir':
            console.log(homedir());
            break;
        case '--username':
            console.log(userInfo().username);
            break;
        case '--architecture':
            console.log(arch());
            break;
        default:
            console.log('Invalid input');
    }
}

function calculateHash(path) {
    const filePath = resolve(currentDir, path);
    const stream = createReadStream(filePath);
    const hash = createHash('sha256');

    stream.on('data', chunk => hash.update(chunk));
    stream.on('end', () => console.log(hash.digest('hex')));
    stream.on('error', () => printOperationFailed());
}

function compressFile(source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const gzipStream = createGzip();

    pipeline(readStream, gzipStream, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}

function decompressFile(source, destination) {
    const sourcePath = resolve(currentDir, source);
    const destPath = resolve(currentDir, destination);

    const readStream = createReadStream(sourcePath);
    const writeStream = createWriteStream(destPath);
    const gunzipStream = createGunzip();

    pipeline(readStream, gunzipStream, writeStream, (err) => {
        if (err) printOperationFailed();
    });
}