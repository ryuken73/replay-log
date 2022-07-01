import readline from 'readline';
import fs from 'fs';
import { IN_FILE, OUT_FILE }  from './config_setup.js';
//const LOG_DIR = process.env.LOG_DIR || './';
//const SRC_FILE = process.env.SRC_FILE_NAME || 'access.log';
//const DST_FILE = process.env.DST_FILE_NAME || 'access_clone.log';

//const IN_FILE = path.join(LOG_DIR, SRC_FILE);
//const OUT_FILE = path.join(LOG_DIR, DST_FILE);

const rStream = fs.createReadStream(IN_FILE);
const wStream = fs.createWriteStream(OUT_FILE);
const rl = readline.createInterface(rStream);

const COLUMN_NUM_TIME = 3;

const getFieldBy = (line, position, sep=' ') => {
    return line.split(sep)[position-1]
}
const createValueChecker = (initial) => {
    let lastValue = initial;
    return newValue => {
        const changed = lastValue !== newValue;
        const isBackward = newValue < lastValue;
        lastValue = newValue;
        return [changed, isBackward];
    }
}

const checkValueChanged = createValueChecker(0);

let buffer;
rl.on('line', line => {
    const eventTime = getFieldBy(line, COLUMN_NUM_TIME);
    const [timeChanged, isBackward] = checkValueChanged(eventTime);
    buffer += `${line}\n`;
    if(timeChanged && !isBackward){
        wStream.write(buffer);
        buffer='';
        setTimeout(() => {
            rl.resume();
        },1000)
        rl.pause();
    }
});
