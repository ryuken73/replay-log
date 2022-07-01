import {
	openReadOnly, 
	getReadStream, 
	getStat
} from './fsUtil.js';

import { OUT_FILE as accessLog }  from './config_setup.js';

const main = async () => {
	try {
		const fd = await openReadOnly(accessLog);
		const fSize = await getStat(fd, 'size');
		console.log(fd)
		console.log(fSize);
	} catch (err) {
		console.log(err.message)
	}
}
main()
