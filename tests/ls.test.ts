import { exec } from 'child_process';
import { promisify } from 'util';
import snap from 'snaptdout';
const execute = promisify(exec);

describe('help', () => {
    it('should match help', async () => {
        const { stdout } = await execute('node -r ts-node/register index.ts');
        await snap(stdout, 'help');
    });
});