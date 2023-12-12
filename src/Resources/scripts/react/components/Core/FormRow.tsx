import { PropsWithChildren } from 'react';

export type FormRowProps = {
	label?: string;
} & PropsWithChildren;

export const FormRow = (props: FormRowProps) => {
	return (
		<div className={'row mb-3'}>
			<label className={'col-sm-2 col-form-label'}>{props.label}</label>
			<div className={'col-sm-10'}>{props.children}</div>
		</div>
	);
};
