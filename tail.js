import {
	openReadOnly, 
	closeFD,
	getReadStream, 
	getStat
} from './fsUtil.js';

import { OUT_FILE as accessLog }  from './config_setup.js';
import { createCollector, convertObj, MAPPING_FIELDS, classifyStatusCode, splitLine } from './readlineUtil.js';

// let offset = 0;
const loop = async (collector, offset, callback=()=>{}) => {
	try {
		const fd = await openReadOnly(accessLog);
		const lastSize = await getStat(fd, 'size');
		collector.updated = Date.now();
		if(lastSize === offset){
			console.log(`same size: ${lastSize}`);
			closeFD(fd)
			collector.startTime = `[${new Date(collector.updated)}]`;
			callback(collector);
			return lastSize;
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
		callback(collector);
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
		offset = await loop(collector, offset, postMessage);
		collector.reset();
	},5000);
}
main()
