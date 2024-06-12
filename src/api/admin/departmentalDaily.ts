import request from '/@/utils/request';

export function getList(query?: Object) {
	console.log('query', query);
	return request({
		url: '/admin/doctor/daily/deptMonthStatistics',
		method: 'get',
		params: query,
	});
}

export function myDailyGetList(query?: Object) {
	console.log('query', query);
	return request({
		url: '/admin/doctor/daily/monthDailyInfo',
		method: 'get',
		params: query,
	});
}

export const getUser = () => {
	return request({
		url: '/admin/user/getAlldoctor',
		method: 'get',
	});
};
