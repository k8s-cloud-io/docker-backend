import { PropsWithChildren } from 'react';

export const PageContainer = (props: PropsWithChildren) => {
	return (
		<div className={'container-fluid d-flex flex-column pt-0'}>
			{props.children}
		</div>
	);
};
