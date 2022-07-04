import {
	openReadOnly, 
	closeFD,
	getReadStream, 
	getStat
} from './fsUtil.js';

import { OUT_FILE as accessLog }  from './config_setup.js';
import { createCollector, convertObj, MAPPING_FIELDS, classifyStatusCode, splitLine } from './readlineUtil.js';

let offset = 0;
const loop = async () => {
	try {
		const collector = createCollector();
		const fd = await openReadOnly(accessLog);
		const lastSize = await getStat(fd, 'size');
		if(lastSize === offset){
			console.log(`same size: ${lastSize}`);
			closeFD(fd)
			return;
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
		console.log('collected: ',collector.startTime, collector.counts, collector.updated);
		offset = lastSize;
	} catch (err) {
		console.log(err.message)
	}
}

const main = async () => {
	const fd = await openReadOnly(accessLog);
	offset = await getStat(fd, 'size');
	await closeFD(fd);
	setInterval(async () => {
		await loop();
	},5000);
}
main()
