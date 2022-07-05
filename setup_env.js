import path from 'path';
const LOG_DIR = process.env.LOG_DIR || './';
const SRC_FILE = process.env.SRC_FILE_NAME || 'access.log';
const DST_FILE = process.env.DST_FILE_NAME || 'access_clone.log';

export const NODE_NAME = process.env.NODE_NAME || 'ip addr of machine';
export const SLEEP_TIME = process.env.SLEEP_TIME || 5000;
export const IN_FILE = path.join(LOG_DIR, SRC_FILE);
export const OUT_FILE = path.join(LOG_DIR, DST_FILE);

export const MAPPING_FIELDS = process.env.ACCESS_LOG_FIELDS ? 
       process.env.ACCESS_LOG_FIELDS.split(' ') :
       [
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
    ];

export const ENABLE_FAST_COLLECT = process.env.ENABLE_FAST_COLLECT === 'true' ? true : false;
export const FAST_FIELDS = process.env.ACCESS_LOG_FAST_FIELDS ?
       process.env.ACCESS_LOG_FAST_FIELDS.split(' ') :
       [
        'time', 
        'httpCode'
       ];
export const FAST_FIELD_POSITIONS = process.env.ACCESS_LOG_FAST_FIELD_POSITIONS ?
       process.env.ACCESS_LOG_FAST_FIELD_POSITIONS.split(' ') :
       [
        2,
        7
       ];


