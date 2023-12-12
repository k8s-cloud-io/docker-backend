import classnames from 'classnames';
import { HTMLProps } from 'react';

export type CheckboxPros = {
	label?: string;
} & HTMLProps<HTMLInputElement>;

export const Checkbox = (props: CheckboxPros) => {
	if (props.label) {
		const className = classnames(props.className, 'form-check');
		return (
			<div className={className}>
				<input
					className="form-check-input"
					type="checkbox"
					{...props}
				/>
				<label className="form-check-label" htmlFor="flexCheckDefault">
					{props.label}
				</label>
			</div>
		);
	}

	const className = classnames(props.className, 'form-check-input');
	return <input type={'checkbox'} {...props} className={className} />;
};
