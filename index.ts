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
    public longest: number = 0;
    public fileCount: number = 0;

    constructor() {
    }

    public async readDirectory() {
        this.items = await this.listDir(process.cwd());
        this.longest = this.items.reduce((a, b) => a.length > b.length ? a : b, '').length;
        return this;
    }

    public async list() {
        let length: number = this.items.length;

        for await (const item of this.items) {
            length--;
            const spaceSize: number = this.longest - item.length + 2;
            const stats: Stats = await this.statItem(item);
            const { unitColor, size, unit } = this.calculateUnit(stats)
            const color: string = this.getColor(stats);
            let char: string = chars['middle'];
            if (length === 0) char = chars['end'];
            // console.log(`${char} ${colors[color]}${colors['reset']}`);
            this.print(char, color, `${item}${colors['reset']}${' '.repeat(spaceSize)}${colors['white']}${size} ${colors[unitColor]}${unit}`);
        }
        this.logTotal();
    }

    public calculateUnit(stats: Stats): Record<string, string | number> {
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

    public getColor(stats: Stats): string {
        if (stats.isDirectory()) {
            this.directoryCount++;
            return 'blue';
        } else {
            this.fileCount++;
            return 'gray';
        }
    }

    public logTotal(): void {
        console.log(`\n${colors['gray']} ${this.directoryCount} directories, ${this.fileCount} files${colors['reset']}`);
    };

    public print(char: string, color: string, item: string) {
        console.log(`${char} ${colors[color]}${item}${colors['reset']}`)
    }
}

new Main().readDirectory().then(async (main) => await main.list());;