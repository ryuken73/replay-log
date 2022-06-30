
const readline = require('readline');
const fs = require('fs');
const IN_FILE = 'd:/temp/access.log-2021070815';
const OUT_FILE = 'd:/temp/access_clone.log';

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