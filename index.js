import { printCurrentDirectory, printGoodbye, printOperationFailed, printWelcome, printInvalidInput } from './consoleUtils.js';
import { parseArgs, goUp, changeDirectory, createDirectory, listDirectory } from './directoryUtils.js';
import { compressFile, decompressFile } from './fileCompressUtils.js';
import { readFile, createFile, renameFile, copyFile, moveFile, deleteFile } from './fileUtils.js';
import { handleOSCommand } from './osUtils.js';
import { calculateHash } from './hashUtils.js';
import { homedir } from 'node:os';

const username = process.argv.find(arg => arg.startsWith('--username='))?.split('=')[1] || 'Anonymous';
let currentDir = homedir();

printWelcome(username);
printCurrentDirectory(currentDir);

process.on("SIGINT", () => {
    printGoodbye(username);
    process.exit(0);
});

process.stdin.on('data', async (data) => {
    const input = data.toString().trim();
    const [command, ...args] = parseArgs(input);

    try {
        switch (command) {
            case 'up':
                currentDir = goUp(currentDir);
                break;
            case 'cd':
                currentDir = await changeDirectory(currentDir, args[0]);
                break;
            case 'ls':
                await listDirectory(currentDir);
                break;
            case 'cat':
                readFile(currentDir, args[0]);
                break;
            case 'add':
                await createFile(currentDir, args[0]);
                break;
            case 'mkdir':
                await createDirectory(currentDir, args[0]);
                break;
            case 'rn':
                await renameFile(currentDir, args[0], args[1]);
                break;
            case 'cp':
                await copyFile(currentDir, args[0], args[1]);
                break;
            case 'mv':
                await moveFile(currentDir, args[0], args[1]);
                break;
            case 'rm':
                await deleteFile(currentDir, args[0]);
                break;
            case 'os':
                handleOSCommand(args[0]);
                break;
            case 'hash':
                calculateHash(currentDir, args[0]);
                break;
            case 'compress':
                compressFile(currentDir, args[0], args[1]);
                break;
            case 'decompress':
                decompressFile(currentDir, args[0], args[1]);
                break;
            case '.exit':
                printGoodbye(username);
                process.exit(0);
            default:
                printInvalidInput();
        }
    } catch (error) {
        printOperationFailed();
    }

    printCurrentDirectory(currentDir);
});