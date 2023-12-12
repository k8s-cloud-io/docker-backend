import { MaterialIcon } from './MaterialIcon';

export const MessageView = (props: {
	message: string;
	type: 'error' | 'warning' | 'info' | 'success';
}) => {
	let iconName = '';
	let alertClass = 'info';

	switch (props.type) {
		case 'info':
		case 'warning':
		case 'error':
			iconName = props.type;
			break;
		case 'success':
			iconName = 'check_circle';
	}

	switch (props.type) {
		case 'info':
		case 'warning':
		case 'success':
			alertClass = props.type;
			break;
		case 'error':
			alertClass = 'danger';
			break;
	}

	return (
		<div className={`alert alert-${alertClass} p-2`}>
			<MaterialIcon className={'me-1'}>{iconName}</MaterialIcon>
			<span>{props.message}</span>
		</div>
	);
};
