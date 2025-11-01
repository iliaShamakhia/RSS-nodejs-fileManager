import { homedir, cpus, EOL, userInfo, arch } from 'node:os';
import { printInvalidInput } from './consoleUtils';

export function handleOSCommand(option) {
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
            printInvalidInput();
    }
}