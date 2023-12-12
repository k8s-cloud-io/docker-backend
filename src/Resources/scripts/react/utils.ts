import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

export const formatUptime = (input: string) => {
	const duration = dayjs.duration(dayjs().diff(dayjs(input)));

	const years = duration.years();
	const months = duration.months();
	const days = duration.days();
	const hours = duration.hours();
	const minutes = duration.minutes();
	const seconds = duration.seconds();

	const segments = [];

	if (years > 0) segments.push(years + ' year' + (years == 1 ? '' : 's'));
	if (months > 0) segments.push(months + ' month' + (months == 1 ? '' : 's'));
	if (days > 0) segments.push(days + ' day' + (days == 1 ? '' : 's'));
	if (hours > 0) segments.push(hours + ' hour' + (hours == 1 ? '' : 's'));
	if (minutes > 0)
		segments.push(minutes + ' minute' + (minutes == 1 ? '' : 's'));
	if (seconds > 0)
		segments.push(seconds + ' second' + (seconds == 1 ? '' : 's'));
	return segments.join(', ');
};

export const uniqueId = () => {
	return btoa(
		window.crypto.getRandomValues(new Uint8Array(6)).join()
	).replace(/=+/g, '');
};
