import React from 'react';

const ls = window.localStorage;

const get = (key) => {
	let result = ls.getItem(key);

	if (result) {
		return JSON.parse(result);
	}

	return result;
}

const set = (key, value) => {
	return ls.setItem(key, JSON.stringify(value));
}

const remove = (key) => {
	ls.removeItem(key);
}

export const lsService = {
	ls    : ls,
	get   : get,
	set   : set,
	remove: remove,
};
