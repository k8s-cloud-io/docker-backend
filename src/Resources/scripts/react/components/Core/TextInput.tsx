import classnames from 'classnames';
import {forwardRef, HTMLProps} from 'react';

export const TextInput = forwardRef((props: HTMLProps<HTMLInputElement>, ref: any) => {
	const className = classnames(
		props.className,
		'form-control form-control-sm fs-6'
	);
	return <input {...props} className={className} type="text" ref={ref} />;
});
