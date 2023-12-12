import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import classnames from "classnames";

export type ToolbarButtonProps = PropsWithChildren &
	ButtonHTMLAttributes<HTMLButtonElement>;

export const ToolbarButton = (props: ToolbarButtonProps) => {
	const className = classnames('btn btn-sm d-flex flex-row ', props.className);
	const newProps = Object.assign({}, props, { className });
	return (
		<button
			{...newProps}
			onClick={(e) => {
				e.currentTarget.blur();
				if (newProps.onClick) {
					newProps.onClick(e);
				}
			}}
		>
			{props.children}
		</button>
	);
};

export const Toolbar = (props: PropsWithChildren) => {
	return <div className={'toolbar'}>{props.children}</div>;
};
