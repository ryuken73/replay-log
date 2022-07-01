import { open } from 'node:fs/promises';
const withErrLogging = fn => {
	return (...args) => {
		try {
			return fn(...args);
		} catch (err) {
			console.error(err);
			throw new Error(err);
		}
	}
}

const openFileReadOnly = async fname => open(fname, 'r');
const closeFileFD = async fd => fd.close();
const getFileReadStream = (fd, offset=0, bytes) => {
	return fd.createReadStream({
		start: offset,
		end: bytes,
	})
}
const getFileStat = async (fd, stat) => {
	const fstat = await fd.stat();
	return stat ? fstat[stat] : fstat;
}
export const openReadOnly = withErrLogging(openFileReadOnly);
export const closeFD = withErrLogging(closeFileFD);
export const getReadStream = withErrLogging(getFileReadStream);
export const getStat = withErrLogging(getFileStat);

