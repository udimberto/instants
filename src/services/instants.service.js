import React from 'react';
import axios from 'axios';

const host = 'https://api.cleanvoice.ru/myinstants/';

const getUrlById = (id) => {
	const itemUrl = 
		host +
		'?type=file&id=' +
		id
	;

	return itemUrl;
}

const getInfoById = (id) => {
	const itemUrl = 
		host +
		'?type=single&id=' +
		id
	;

	return axios.get(itemUrl);
}

const getFileById = (id) => {
	const itemUrl = 
		host +
		'?type=file&id=' +
		id
	;

	return axios.get(itemUrl);
}

const search = (term, offset) => {
	const searchUrl = 
		host +
		'?type=many&limit=100&search=' +
		term +
		'&offset=' + 
		offset
	;

	return axios.get(searchUrl);
}

export const instantsService = {
	host       : host,
	getUrlById : getUrlById,
	getInfoById: getInfoById,
	getFileById: getFileById,
	search     : search,
};
