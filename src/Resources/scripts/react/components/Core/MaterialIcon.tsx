import { HTMLAttributes, PropsWithChildren } from 'react';
import classnames from "classnames";

export type MaterialIconProps = PropsWithChildren &
	HTMLAttributes<HTMLSpanElement>;
export const MaterialIcon = (props: MaterialIconProps) => {
	const className = classnames(
		'material-icons-outlined',
		props.className?.split(' ')
	);

	const iconProps = {
		...props,
		className
	};

	return <span {...iconProps}>{props.children}</span>;
};
