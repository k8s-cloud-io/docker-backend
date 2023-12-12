import { DocumentNode, useApolloClient } from '@apollo/client';
import {
	ReactNode,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState
} from 'react';
import { uniqueId } from '../../utils';
import { ApolloExtendedError } from './ApolloExtendedError';
import { Checkbox } from './Checkbox';
import { MessageView } from './MessageView';

type FieldMap = {
	[key: string]: (_fieldValue: any) => string | ReactNode;
};

export type GraphQLListProps = {
	headers: Array<string>;
	fields: Array<string>;
	projection: DocumentNode;
	listField?: string;
	fieldRenderer?: FieldMap;
	sort?: (data: any) => Array<any>;
	checkable?: boolean;
	onSelect?: (data: Array<any>) => void;
	onListLoaded?: () => void;
};

export const GraphQLListView = forwardRef((props: GraphQLListProps, ref) => {
	const client = useApolloClient();
	const [state, setState] = useState({
		loading: false,
		loaded: false,
		error: null,
		data: []
	});

	const load = () => {
		if (state.loaded || state.loading) return;
		const newState = {
			...state,
			loaded: false,
			loading: true
		};
		setState({ ...newState });
		client.resetStore().then(() => {
			client
				.query({
					query: props.projection
				})
				.then((result) => {
					let data = props.sort
						? props.sort(result.data[props.listField] || [])
						: result.data[props.listField] || [];
					data = data.map((item: any) => {
						item.__generated__ = uniqueId();
						item.__internalChecked__ = false;
						return item;
					});
					const newState = {
						...state,
						loading: false,
						loaded: true,
						error: null,
						data
					};
					setState({ ...newState });
				})
				.catch((e: ApolloExtendedError) => {
					const error = new ApolloExtendedError(e);
					setState({
						...state,
						loading: false,
						loaded: true,
						error,
						data: []
					});
					if (props.onListLoaded) props.onListLoaded();
				});
		});
	};

	useImperativeHandle(ref, () => {
		return {
			itemsAvailable: () => {
				return state?.data && state.data.length > 0;
			},
			refresh: () => {
				setState({
					...state,
					loaded: false
				});
				if (props.onSelect) {
					props.onSelect([]);
				}
			},
			unselectAll: () => {
				const data = state.data.map((d) => {
					return {
						...d,
						__internalChecked__: false
					};
				});
				setState({
					...state,
					data
				});
				if (props.onSelect) {
					props.onSelect([]);
				}
			}
		};
	});

	useEffect(() => {
		load();
	}, [state.loading, state.loaded]);

	useEffect(() => {
		if (props.onListLoaded) props.onListLoaded();
	}, [state.data]);

	if (state.loading)
		return (
			<MessageView
				type={'info'}
				message={'Please wait, while loading...'}
			/>
		);
	if (state.error?.message)
		return <MessageView message={state.error.message} type={'warning'} />;

	if (state?.data && state.data.constructor === Array && state.data.length) {
		let headers: Array<any> = props.headers;
		if (props.checkable) {
			const allChecked =
				[...state.data.filter((item) => item.__internalChecked__)]
					.length === state.data.length;
			headers = [
				<Checkbox
					checked={allChecked}
					onChange={(e: any) => {
						const data = state.data.map((item) => {
							return {
								...item,
								__internalChecked__: e.target.checked
							};
						});
						if (props.onSelect) {
							props.onSelect(data);
						}
						setState({
							...state,
							data
						});
					}}
				/>,
				...props.headers
			];
		}
		return (
			<table className={'table data-table small'}>
				<thead>
					<tr>
						{headers.map((header) => {
							return (
								<th
									className={'valign-middle'}
									key={uniqueId()}
								>
									{header}
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{state.data.map((item: any) => {
						return (
							<tr key={uniqueId()}>
								{props.checkable && (
									<td>
										<Checkbox
											onChange={() => {
												const __internalChecked__ =
													!item.__internalChecked__;
												const data = state.data.map(
													(d) => {
														if (
															d.__generated__ ===
															item.__generated__
														) {
															return {
																...d,
																__internalChecked__
															};
														}

														return d;
													}
												);
												if (props.onSelect) {
													props.onSelect(data);
												}

												setState({
													...state,
													data
												});
											}}
											checked={item.__internalChecked__}
										/>
									</td>
								)}
								{props.fields.map((field) => {
									return (
										<td
											className={'valign-middle'}
											key={uniqueId()}
										>
											{props.fieldRenderer?.[field] &&
												props.fieldRenderer[field](
													item
												)}
											{!props.fieldRenderer?.[field] &&
												item[field]}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		);
	}

	return (
		<MessageView
			message={'There are no items in this view'}
			type={'info'}
		/>
	);
});
