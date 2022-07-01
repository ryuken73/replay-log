import path from 'path';
const LOG_DIR = process.env.LOG_DIR || './';
const SRC_FILE = process.env.SRC_FILE_NAME || 'access.log';
const DST_FILE = process.env.DST_FILE_NAME || 'access_clone.log';

export const IN_FILE = path.join(LOG_DIR, SRC_FILE);
export const OUT_FILE = path.join(LOG_DIR, DST_FILE);


