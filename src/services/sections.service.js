import React from 'react';

import { lsService as localStorage } from './';

const storageName = 'sections';
const storageData = localStorage.get(storageName);

const get = () => {
	return storageData;
}

const getById = (id) => {
	if (!id || !storageData) {
		return null;
	}

	const sectionFound = 
		storageData.some((section, index) => {
			if (section.id === id) {
				return section;
			}
		});

	return sectionFound || null;
}

const set = (value) => {
	if (!value) {
		return false;
	}

	storageData.push(value);
	localStorage.set(storageName, storageData);

	return true;
}

const update = (id, newValue) => {
	if (!id || !storageData) {
		return false;
	}

	const sectionUpdated = 
		storageData.some((section, index) => {
			if (section.id === id) {
				section = newValue;
				return true;
			}
		});

	if (sectionUpdated) {
		localStorage.set(storageName, storageData);
		return true;
	}

	return false;
}

const remove = (id) => {
	if (!id || !storageData) {
		return false;
	}

	const sectionIndex = 
		storageData.some((section, index) => {
			if (section.id === id) {
				return index;
			}
		});

	if (!isNaN(sectionIndex)) {
		storageData.splice(sectionIndex, 1);
		localStorage.set(storageName, storageData);

		return true;
	}

	return false;
}

export const sectionsService = {
	data   : storageData,
	get    : get,
	getById: getById,
	set    : set,
	update : set,
	remove : remove,
};
