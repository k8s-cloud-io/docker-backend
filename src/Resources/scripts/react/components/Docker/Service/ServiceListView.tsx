import { useContext, useEffect, useRef } from 'react';
import { AppCtx } from '../../../contexts/ApplicationContext';
import { SERVICE_LIST_PROJECTION } from '../../../graphql';
import {
	GraphQLListView,
	PageContainer,
	Toolbar,
	ToolbarButton
} from '../../Core';

export const ServiceListView = () => {
	const headers: Array<string> = ['Name', 'Created At'];
	const fields: Array<string> = ['name', 'createdAt'];
	const ref = useRef(null);

	const { setValue } = useContext(AppCtx);
	useEffect(() => {
		setValue('Services');
	});

	return (
		<PageContainer>
			<Toolbar>
				<ToolbarButton onClick={() => ref.current.refresh()}>
					<span className={'material-icons text-primary'}>
						refresh
					</span>
					<span>Refresh</span>
				</ToolbarButton>
			</Toolbar>
			<GraphQLListView
				ref={ref}
				headers={headers}
				fields={fields}
				listField={'services'}
				projection={SERVICE_LIST_PROJECTION}
			/>
		</PageContainer>
	);
};
