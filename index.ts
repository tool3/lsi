#!/usr/bin/env node

import fs, { Stats } from 'fs';
import colors from './consts/colors';
import chars from './consts/chars';
import { promisify } from 'util';

class Item {
    public size: number = 0;
    public length: number = 0;
    public name: string = "";
    public unit: string = "B";
    public unitColor: string = "gray";
    public getStats: Function = promisify(fs.stat);
    public stats: Stats;

    constructor(name: string) {
        this.name = name;
        this.length = name.length;
        this.stats = this.getStats(name);
    }

    public async getItemStats(): Promise<void> {
        this.stats = await this.getStats(this.name);
        this.size = this.stats.size;
        this.calculateUnit();
    }

    public calculateUnit(): void {
        let size: number = this.stats.size;
        if (this.stats.size >= 1000000000) {
            this.unit = 'GB';
            this.unitColor = 'red';
            this.size = Number((size / 1000 / 1000 / 1000).toFixed(2));
        } else if (this.stats.size > 1000000) {
            this.unit = 'MB';
            this.unitColor = 'yellow';
            this.size = Number((size / 1000 / 1000).toFixed(2));
        } else if (this.stats.size > 1000) {
            this.unit = 'KB';
            this.unitColor = 'green';
            this.size = Number((size / 1000).toFixed(2));
        }
    }

    public isDirectory(): Boolean {
        return this.stats.isDirectory();
    }

    public format(spaceSize: number,): string {
        const formattedItem: string = `${this.name}${colors.reset}`;
        const formattedSpace: string = `${' '.repeat(spaceSize)}`;
        const formattedSize: string = ` ${colors.white}${this.size} `;
        const formattedUnit: string = `${colors[this.unitColor]}${this.unit}`;
        return formattedItem + formattedSpace + formattedSize + formattedUnit;
    }

}

class Main {
    public listDir: Function = promisify(fs.readdir);
    public list: Array<string> = [];
    public directoryCount: number = 0;
    public longest: number = 0;
    public fileCount: number = 0;

    public async readDirectory() {
        this.list = await this.listDir(process.cwd());
        this.longest = this.list.reduce((a, b) => a.length > b.length ? a : b, "").length;
        return this;
    }

    public async makeList() {
        let length: number = this.list.length;
        this.print('.', 'gray', '');

        for await (const i of this.list) {
            length--;
            const item: Item = new Item(i);
            await item.getItemStats();

            const spaceSize: number = this.longest - item.length + 2;
            const color: string = this.getItemColor(item);
            const char: string = length === 0 ? chars.end : chars.middle;
            this.print(char, color, item.format(spaceSize));
        }
        this.logTotal();
    }

    public getItemColor(item: Item): string {
        if (item.isDirectory()) {
            this.directoryCount++;
            return 'blue';
        } else {
            this.fileCount++;
            return 'gray';
        }
    }

    public logTotal(): void {
        this.print('\n', 'gray', ` ${this.directoryCount} directories, ${this.fileCount} files${colors.reset}`);
    };

    public print(char: string, color: string, item: string) {
        console.log(`${char} ${colors[color]}${item}${colors.reset}`);
    }
}

new Main().readDirectory().then(async main => await main.makeList());