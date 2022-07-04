import {
	openReadOnly, 
	closeFD,
	getReadStream, 
	getStat
} from './fsUtil.js';

import { OUT_FILE as accessLog }  from './config_setup.js';
import { classifyStatusCode, createRequests } from './readlineUtil.js';

let offset = 0;
const callback = () => {

}
const loop = async () => {
	let fd = await openReadOnly(accessLog);
	try {
		const results = createRequests();
		const lastSize = await getStat(fd, 'size');
		if(lastSize === offset){
			console.log(`same size: ${lastSize}`);
			return;
		}

		console.log(`read file [size = ${lastSize - offset}]...`);
		const rStream = getReadStream(fd, offset, lastSize);
		classifyStatusCode(rStream, results);
		offset = lastSize;
	} catch (err) {
		console.log(err.message)
	} finally {
		closeFD(fd);
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
