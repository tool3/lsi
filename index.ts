#!/usr/bin/env node

import fs, { Stats } from 'fs';
import colors from './consts/colors';
import chars from './consts/chars';
import { promisify } from 'util';


class Main {
    public listDir: Function = promisify(fs.readdir);
    public statItem: Function = promisify(fs.lstat);
    public items: Array<string> = [];
    public directoryCount: number = 0;
    public fileCount: number = 0;

    constructor() {
    }

    async readDirectory() {
        this.items = await this.listDir(process.cwd());
        return this;
    }

    async list() {
        let length: number = this.items.length;
        let longest: string = this.items.reduce((a, b) => a.length > b.length ? a : b, '');

        for await (const directory of this.items) {
            const stats: Stats = await this.statItem(directory);
            const { unitColor, size, unit } = this.calculateUnit(stats)
            length--;

            let color: string = 'gray';
            let char: string = chars["middle"];

            if (stats.isDirectory()) {
                color = 'blue';
                this.directoryCount++;
            } else {
                color = 'gray';
                this.fileCount++;
            }

            if (length === 0) {
                char = chars['end'];
            }
            const spaceSize = longest.length - directory.length + 2;

            console.log(`${char} ${colors[color]}${directory}${colors['reset']}${' '.repeat(spaceSize)}${colors['white']}${size} ${colors[unitColor]}${unit}${colors['reset']}`);
        }
        this.logTotal();
    }

    calculateUnit(stats: Stats): Record<string, string | number> {
        let size: number = stats.size;
        let unitColor: string = 'gray';
        let unit: string = "B";

        if (stats.size > 1073741824) {
            unit = "GB";
            unitColor = 'red';
            size = Number((size / 1000 / 1000 / 1000).toFixed(2));
        } else if (stats.size > 1000000) {
            unit = "MB";
            unitColor = 'yellow';
            size = Number((size / 1000 / 1000).toFixed(2));
        } else if (stats.size > 1000) {
            unit = "KB";
            unitColor = 'green';
            size = Number((size / 1000).toFixed(2));
        }

        return { unitColor, size, unit };
    }


    logTotal(): void {
        console.log(`\n${colors['gray']} ${this.directoryCount} directories, ${this.fileCount} files${colors['reset']}`);
    };
}

// const logTotal = (directoryCount: number, fileCount: number): void => {
//     console.log(`\n${colors['gray']} ${directoryCount} directories, ${fileCount} files${colors['reset']}`);
// };

// const calculateUnit = (stats: Stats): Record<string, string | number> => {
//     let size: number = stats.size;
//     let unitColor: string = 'gray';
//     let unit: string = "B";

//     if (stats.size > 1073741824) {
//         unit = "GB";
//         unitColor = 'red';
//         size = Number((size / 1000 / 1000 / 1000).toFixed(2));
//     } else if (stats.size > 1000000) {
//         unit = "MB";
//         unitColor = 'yellow';
//         size = Number((size / 1000 / 1000).toFixed(2));
//     } else if (stats.size > 1000) {
//         unit = "KB";
//         unitColor = 'green';
//         size = Number((size / 1000).toFixed(2));
//     }

//     return { unitColor, size, unit };
// }

// const main = async (): Promise<void> => {
//     const listDir: Function = promisify(fs.readdir);
//     const statItem: Function = promisify(fs.lstat);

//     let directoryCount: number = 0;
//     let fileCount: number = 0;

//     console.log('.');

//     try {
//         const directories: Array<string> = await listDir(process.cwd());
//         let length: number = directories.length;
//         let longest: string = directories.reduce((a, b) => a.length > b.length ? a : b, '');

//         for await (const directory of directories) {
//             const stats: Stats = await statItem(directory);
//             const { unitColor, size, unit } = calculateUnit(stats)
//             length--;

//             let color: string = 'gray';
//             let char: string = chars["middle"];

//             if (stats.isDirectory()) {
//                 color = 'blue';
//                 directoryCount++;
//             } else {
//                 color = 'gray';
//                 fileCount++;
//             }

//             if (length === 0) {
//                 char = chars['end'];
//             }
//             const spaceSize = longest.length - directory.length + 2;

//             console.log(`${char} ${colors[color]}${directory}${colors['reset']}${' '.repeat(spaceSize)}${colors['white']}${size} ${colors[unitColor]}${unit}${colors['reset']}`);
//         };

//         logTotal(directoryCount, fileCount);

//     } catch (error) {
//         console.error(error);
//     }
// };

// main();
const main = new Main().readDirectory().then(async (main) => await main.list());;