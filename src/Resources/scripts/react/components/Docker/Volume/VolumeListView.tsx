import { ApolloError, useApolloClient } from '@apollo/client';
import useForceUpdate from '@restart/hooks/useForceUpdate';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { AppCtx } from '../../../contexts';
import {
	VOLUME_CLEAN_PROJECTION,
	VOLUME_LIST_PROJECTION,
	VOLUME_REMOVE_PROJECTION
} from '../../../graphql';
import { uniqueId } from '../../../utils';
import {
	ApolloExtendedError,
	ErrorDialog,
	GraphQLListView,
	MaterialIcon,
	PageContainer,
	RippleButton,
	Toolbar,
	ToolbarButton
} from '../../Core';

export const VolumeListView = () => {
	const headers: Array<string> = [
		'Name',
		'Driver',
		'Labels',
		'Scope',
		'Created At'
	];
	const fields: Array<string> = [
		'name',
		'driver',
		'labels',
		'scope',
		'createdAt'
	];
	const ref = useRef(null);
	const apolloClient = useApolloClient();
	const updateViewInternal = useForceUpdate();
	const [confirmDialogVisible, setConfirmDialogVisible] = useState(null);
	const [listSelection, setListSelection] = useState([]);
	const [errorMessage, setErrorMessage] = useState('');

	const updateView = useCallback(() => {
		updateViewInternal();
	}, [updateViewInternal]);

	const { setValue } = useContext(AppCtx);
	useEffect(() => {
		setValue('Volumes');
	});

	const cleanVolumes = () => {
		apolloClient
			.mutate({
				mutation: VOLUME_CLEAN_PROJECTION
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					ref.current.refresh();
				});
			});
	};

	const sortVolumes = (items: Array<any>): Array<any> => {
		if (items?.length) {
			return items
				.map((item) => {
					return {
						...item,
						timestamp: dayjs(item['createdAt']).unix()
					};
				})
				.sort((left, right) => {
					return right.timestamp - left.timestamp;
				});
		}
		return items;
	};

	const onSelect = (items: Array<any>) => {
		setListSelection([...items.filter((item) => item.__internalChecked__)]);
	};

	const removeVolumes = () => {
		apolloClient
			.mutate({
				mutation: VOLUME_REMOVE_PROJECTION,
				variables: {
					volumes: listSelection.map((item) => item.name)
				}
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					ref.current.refresh();
				});
			})
			.catch((error: ApolloError) => {
				const e = new ApolloExtendedError(error);
				setErrorMessage(e.message);
				ref.current?.unselectAll();
			});
	};

	return (
		<PageContainer>
			<Toolbar>
				<ToolbarButton onClick={() => ref.current.refresh()}>
					<MaterialIcon className={'text-primary'}>
						refresh
					</MaterialIcon>
					<span>Refresh</span>
				</ToolbarButton>
				{ref.current?.itemsAvailable() && (
					<>
						<ToolbarButton onClick={() => cleanVolumes()}>
							<MaterialIcon className={'text-primary'}>
								cleaning_services
							</MaterialIcon>
							<span>Prune</span>
						</ToolbarButton>
						<ToolbarButton
							disabled={listSelection?.length === 0}
							onClick={() => setConfirmDialogVisible(true)}
						>
							<MaterialIcon className={'text-danger'}>
								delete
							</MaterialIcon>
							<span>Remove</span>
						</ToolbarButton>
					</>
				)}
			</Toolbar>
			{errorMessage && (
				<ErrorDialog
					message={errorMessage}
					show={true}
					onHide={() => setErrorMessage(null)}
				/>
			)}
			<Modal
				show={confirmDialogVisible}
				onHide={() => setConfirmDialogVisible(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>Delete Container</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Do you really want to remove the selected volumes?
				</Modal.Body>
				<Modal.Footer>
					<RippleButton
						className={'btn-secondary'}
						onClick={() => setConfirmDialogVisible(false)}
					>
						Cancel
					</RippleButton>
					<RippleButton
						className={'btn-danger'}
						onClick={() => {
							setConfirmDialogVisible(false);
							removeVolumes();
						}}
					>
						Delete
					</RippleButton>
				</Modal.Footer>
			</Modal>
			<GraphQLListView
				checkable
				onListLoaded={() => updateView()}
				onSelect={(items) => onSelect(items)}
				ref={ref}
				headers={headers}
				fields={fields}
				listField={'volumes'}
				projection={VOLUME_LIST_PROJECTION}
				fieldRenderer={{
					createdAt: (item) => {
						return dayjs(item['createdAt']).format(
							'YYYY-MM-DD HH:mm:ss'
						);
					},
					labels: (item) => {
						if (Object.keys(item['labels'] || {}).length) {
							return (
								<div className={'d-flex flex-column'}>
									{Object.keys(item['labels']).map((key) => {
										let value = null;
										if (item['labels'][key]) {
											value = `: ${item['labels'][key]}`;
										}
										return (
											<span key={uniqueId()}>
												{key}
												{value}
											</span>
										);
									})}
								</div>
							);
						}
						return null;
					}
				}}
				sort={sortVolumes}
			/>
		</PageContainer>
	);
};
