import readline from 'readline';

const initialResults = {
	'200': [],
	'400': [],
	'500': [],
	'other': []
}

class Requests {
	constructor(){
		this.results = {
			'200': [],
			'400': [],
			'500': [],
			'other': []
		}
	}
	reset = () =>{
		this.results = {
			'200': [],
			'400': [],
			'500': [],
			'other': []
		};
	}
	getMatchedCode = statusCode => {
		try {
			const firstCode = statusCode.toString()[0];
			const resultCodes = Object.keys(this.results);
			return resultCodes.find(resultCode => resultCode.startsWith(firstCode)) || 'other';
		} catch(err) {
			throw new Error(err);
		}
	}
	increaseCount = code => {
		this.results[code].push(code);
	}
	get counts() { 
		return Object.keys(this.results).reduce((acc, statusCode) => {
			return {
				...acc,
				[statusCode]: this.results[statusCode].length
			}
		}, {})
		
	}
};

const MAPPING_FIELDS = [
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

export const createRequests = () => {
	return new Requests();
}
