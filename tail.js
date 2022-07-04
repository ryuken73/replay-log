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
}  from './config_setup.js';

import { 
	createCollector, 
	convertObj, 
	splitLine 
} from './readlineUtil.js';

const loop = async (collector, offset, postMessage=()=>{}) => {
	try {
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
		const records = lines.map(line => convertObj(line, MAPPING_FIELDS));
		records.forEach((record, index) => {
			if(record.httpCode === undefined) return;
			if(index === 0 ) collector.startTime = record.time;
			const httpCode = record.httpCode.toString();
			const matchedCode = collector.getMatchedCode(httpCode);
			collector.increaseCount(matchedCode);
		})
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
