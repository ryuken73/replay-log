import debug from 'debug';
import readline from 'readline';
import fs from 'fs';
import { IN_FILE, OUT_FILE }  from './setup_env.js';

const rStream = fs.createReadStream(IN_FILE);
const wStream = fs.createWriteStream(OUT_FILE);
const rl = readline.createInterface(rStream);

const TIME_FIELD_NUM = 3;

const logger = {
	info: debug('info'),
	error: debug('error'),
	debug: debug('debug'),
	trace: debug('trace')
}

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
    const eventTime = getFieldBy(line, TIME_FIELD_NUM);
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
