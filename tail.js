import {
	openReadOnly, 
	closeFD,
	getReadStream, 
	getStat
} from './fsUtil.js';

import { 
	OUT_FILE as accessLog, 
	SLEEP_TIME,
	MAPPING_FIELDS, 
	ENABLE_FAST_COLLECT,
	FAST_FIELDS,
	FAST_FIELD_POSITIONS
}  from './setup_env.js';

import { 
	createCollector, 
	convertObj, 
	convertObjFast, 
	splitLine, 
	classifyStatusCode
} from './readlineUtil.js';

const makeObj = ENABLE_FAST_COLLECT ? 
				convertObjFast(FAST_FIELDS, FAST_FIELD_POSITIONS) : 
				convertObj(MAPPING_FIELDS);

import debug from 'debug';

const logger = {
	info: debug('info'),
	error: debug('error'),
	debug: debug('debug'),
	trace: debug('trace')
}

logger.info(`ENABLE_FAST_COLLECT = ${ENABLE_FAST_COLLECT}`);

const tailLine = async (fname, fromBytes) => {
	try {
		logger.debug('start tail!');
		const fd = await openReadOnly(fname);
		const lastSize = await getStat(fd, 'size');
		if(fromBytes === lastSize){
			console.log(`same size: ${lastSize}`);
			closeFD(fd);
			return [lastSize, []];
		}
		if(fromBytes > lastSize){
			// file truncated of new access log created.
			// read from first bytes.
			fromBytes = 0;
		}
		console.log(`read file [ fromBytes: ${fromBytes}, size: ${lastSize - fromBytes}, read to ${lastSize}]...`);
		const rStream = getReadStream(fd, fromBytes, lastSize);
		const lines = await splitLine(rStream);
		return [lastSize, lines];
	} catch(err) {
		console.log(err.message);
	}
}
const classifyRecords = (records, collector) => {
	records.forEach((record, index) => {
		logger.trace('line = %j', record);
		if(record.httpCode === undefined) return;
		if(index === 0 ) collector.startTime = record.time;
		const matchedCode = collector.getMatchedCode(record);
		collector.increaseCount(matchedCode);
	})
}

const loop = async (collector, offset, postMessage=()=>{}) => {
	try {
		logger.debug('start loop');
		collector.updated = Date.now();
		const [lastSize, lines] = await tailLine(accessLog, offset);
		if(lines.length === 0){
			collector.startTime = `[${(new Date(collector.updated - SLEEP_TIME)).toISOString()}]`;
			postMessage(collector);
			return lastSize;
		}
		const records = lines.map(line => makeObj(line))
		classifyRecords(records, collector);
		logger.debug('end loop');
		postMessage(collector);
		return lastSize;
	} catch (err) {
		console.log(err.message)
	}
}

const postMessage = collector => {
	console.log('collected: ',collector.startTime, collector.counts, collector.updated);
}

const main = async () => {
	const collector = createCollector();
	const fd = await openReadOnly(accessLog);
	let offset = await getStat(fd, 'size');
	await closeFD(fd);
	setInterval(async () => {
		const newOffset = await loop(collector, offset, postMessage);
		offset = newOffset;
		collector.reset();
	},SLEEP_TIME);
}
main()
