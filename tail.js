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
	splitLine 
} from './readlineUtil.js';

const makeObj = ENABLE_FAST_COLLECT ? 
				convertObjFast(FAST_FIELDS, FAST_FIELD_POSITIONS) : 
				convertObj(MAPPING_FIELDS);

import debug from 'debug';
const logger = {
	info: debug('info'),
	error: debug('error'),
	debug: debug('debug'),
}

logger.info(`ENABLE_FAST_COLLECT = ${ENABLE_FAST_COLLECT}`);
const loop = async (collector, offset, postMessage=()=>{}) => {
	try {
		logger.debug('start loop');
		const fd = await openReadOnly(accessLog);
		const lastSize = await getStat(fd, 'size');
		collector.updated = Date.now();
		if(lastSize === offset){
			console.log(`same size: ${lastSize}`);
			closeFD(fd)
			collector.startTime = `[${(new Date(collector.updated - SLEEP_TIME)).toISOString()}]`;
			postMessage(collector);
			return lastSize;
		}
		if(lastSize < offset){
			// file truncated of new access log created.
			// read from first bytes.
			offset = 0;
		}
		console.log(`read file [ offset: ${offset}, size: ${lastSize - offset}, read to ${lastSize}]...`);
		const rStream = getReadStream(fd, offset, lastSize);
		const lines = await splitLine(rStream);
		const records = lines.map(line => makeObj(line))
		logger.debug('get records');
		records.forEach((record, index) => {
			if(record.httpCode === undefined) return;
			if(index === 0 ) collector.startTime = record.time;
			const httpCode = record.httpCode.toString();
			const matchedCode = collector.getMatchedCode(httpCode);
			collector.increaseCount(matchedCode);
		})
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
