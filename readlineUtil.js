import readline from 'readline';

class Collector {
	constructor(){
		this.statusCodes = {
			'200': [],
			'400': [],
			'500': [],
			'other': []
		}
		this._updated = Date.now();
		this._startTime = null;
	}
	reset = () =>{
		this.statusCodes = {
			'200': [],
			'400': [],
			'500': [],
			'other': []
		};
	}
	getMatchedCode = statusCode => {
		try {
			const firstCode = statusCode.toString()[0];
			const resultCodes = Object.keys(this.statusCodes);
			return resultCodes.find(resultCode => resultCode.startsWith(firstCode)) || 'other';
		} catch(err) {
			throw new Error(err);
		}
	}
	increaseCount = code => {
		this.statusCodes[code].push(code);
	}
	get counts() { 
		return Object.keys(this.statusCodes).reduce((acc, statusCode) => {
			return {
				...acc,
				[statusCode]: this.statusCodes[statusCode].length
			}
		}, {})
		
	};
	get updated() { return this._updated };
	set startTime(time) { this._startTime = time };
	get startTime() { return this._startTime };
};

export const MAPPING_FIELDS = [
    'ip',
    'url1',
    'time',
    'elapsed',
    'method',
    'url2',
    'httpVersion',
    'httpCode',
    'bytes1',
    'bytes2',
    'unknown1',
    'unknown2',
    'referrer',
]

const lineToArray = (rawLine, sep=' ') => {
    return rawLine.split(sep)
}

const arrayToObject = (array, keys) => {
    let undefinedCount = 0;
    return array.reduce((acct, element, index) => {
        const key = keys[index] || `undefined${undefinedCount++}`;
        return {
            ...acct,
            [key]: element
        }
    }, {})
}

const makeRecord = (line, keys) => {
    const lineSplitted = lineToArray(line);
    return arrayToObject(lineSplitted, keys)
}

export const convertObj = makeRecord;

const checkValueChanged = (key) => {
    let lastValue = '';
    let lastRecord = {};
    return newRecord => {
        const prevRecord = {...lastRecord};
        const newValue = newRecord[key];
        const changed = lastValue !== newValue;
        lastRecord = newRecord;
        lastValue = newValue;
        return [changed, prevRecord];
    }
}

const checkTimeChanged = checkValueChanged('time');
const isLocalRequest = line => line.startsWith('127.0.0.1')

export const splitLine = (rStream) => {
	let results = [];
	return new Promise((resolve, reject) => {
		const rl = readline.createInterface(rStream);
		rl.on('line', line => {
			try {
				if(isLocalRequest(line)) return;
				results = [...results, line];
			} catch (err){
				console.error(err)
			}
		})
		rStream.on('close', () => {
			console.log('rStream closed: ', results.length)
			resolve(results);
		})
	});
}

export const classifyStatusCode = (rStream, results) => {
	const rl = readline.createInterface(rStream);
	rl.on('line', line => {
		try {
			if(isLocalRequest(line)) return;
			const record = makeRecord(line, MAPPING_FIELDS);
			if(record.httpCode === undefined) return;
			const httpCode = record.httpCode.toString();
			const matchedCode = results.getMatchedCode(httpCode);
			results.increaseCount(matchedCode);
		} catch (err) {
			console.error(err)
		}
	});
	rStream.on('close', () => {
		console.log('rStream closed', results.counts);
	})
}

export const analyzeLine = (rStream, callback=()=>{}) => {
	let totalProcessed = 0;
	let count = 0;
	const requests = new Set();
	const rl = readline.createInterface(rStream);
	rl.on('line', line => {
	    if(isLocalRequest(line)) return;
	    count ++;
	    // console.log(`${count++} : ${data}`)
	    const record = makeRecord(line, MAPPING_FIELDS);
		callback(record);
	    requests.add(record.ip, '');
	    const [changed, prevRecord] = checkTimeChanged(record);
	    if(changed){
			console.log(`${prevRecord.time}:${prevRecord.ip}: ${count}: ${requests.size}`);
			count = 0;
			requests.clear();
	    }
	    totalProcessed++;
	});
}

export const getCountByStatus = rStream => {
	const requests = new Map();
	const rl = readline.createInterface(rStream);
	rl.on('line', line => {
		if(isLocalRequest(line)) return;
	    	const record = makeRecord(line, MAPPING_FIELDS);
		request.add(record.status,'');
	});
}

export const createCollector = () => {
	return new Collector();
}
