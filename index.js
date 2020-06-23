#!/usr/bin/env node

const fs = require('fs');
const colors = require('./consts/colors');
const chars = require('./consts/chars');
const { promisify } = require('util');

const logTotal = (directoryCount, fileCount) => {
    console.log(`\n${colors['gray']} ${directoryCount} directories, ${fileCount} files${colors['reset']}`);
};

const main = async () => {
    const listDir = promisify(fs.readdir);
    const statItem = promisify(fs.lstat);
    let directoryCount = 0;
    let fileCount = 0;
    console.log('.');

    try {
        const directories = await listDir(process.cwd());
        let length = directories.length;
        let longest = directories.reduce(function (a, b) {
            return a.length > b.length ? a : b
        }, '');
        for await (const directory of directories) {
            length--;
            const stats = await statItem(directory);
            let color = 'gray';
            let unitColor = 'gray';
            let unit = 'B';
            let char = chars["middle"];
            let size = stats.size;

            if (stats.isDirectory()) {
                color = 'blue';
                directoryCount++;
            } else {
                color = 'gray';
                fileCount++;
            }

            if (stats.size > 1073741824) {
                unit = "GB";
                unitColor = 'red';
                size = (size / 1000 / 1000 / 1000).toFixed(2);
            } else if (stats.size > 1000000) {
                unit = "MB";
                unitColor = 'yellow';
                size = (size / 1000 / 1000).toFixed(2);
            } else if (stats.size > 1000) {
                unit = "KB";
                unitColor = 'green';
                size = (size / 1000).toFixed(2);
            }

            if (length === 0) {
                char = chars['end'];
            }
            const spaceSize = longest.length - directory.length + 2;

            console.log(`${char} ${colors[color]}${directory}${colors['reset']}${' '.repeat(spaceSize)}${colors['white']}${size} ${colors[unitColor]}${unit}${colors['reset']}`);
        };

        logTotal(directoryCount, fileCount);

    } catch (error) {
        console.error(error);
    }
};

main();
