import { ApolloError, useApolloClient } from '@apollo/client';
import useForceUpdate from '@restart/hooks/useForceUpdate';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { AppCtx } from '../../../contexts';
import {
	NETWORK_CLEAN_PROJECTION,
	NETWORK_LIST_PROJECTION,
	NETWORK_REMOVE_PROJECTION
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
import { NetworkCreateView } from './NetworkCreateView';
import { NetworkItemView } from './NetworkItemView';

type DialogStates = {
	errorDialogVisible: boolean;
	confirmDialogVisible: boolean;
};

export const NetworkListView = () => {
	const headers: Array<string> = ['Name', 'Driver', 'Subnet', 'Created At'];
	const fields: Array<string> = ['name', 'driver', 'subnet', 'created'];
	const apolloClient = useApolloClient();
	const ref = useRef(null);
	const [networkDetailsViewVisible, setNetworkDetailsViewVisible] =
		useState(false);
	const [networkCreateViewVisible, setNetworkCreateViewVisible] =
		useState(false);
	const [currentItem, setCurrentItem] = useState();
	const [listSelection, setListSelection] = useState([]);
	const [errorMessage, setErrorMessage] = useState(null);
	const [dialogStates, setDialogStates] = useState<DialogStates>({
		errorDialogVisible: false,
		confirmDialogVisible: false
	});
	const updateViewInternal = useForceUpdate();

	const updateView = useCallback(() => {
		updateViewInternal();
	}, [updateViewInternal]);

	const { setValue } = useContext(AppCtx);
	useEffect(() => {
		setValue('Networks');
	});

	const removeNetworks = () => {
		apolloClient
			.mutate({
				mutation: NETWORK_REMOVE_PROJECTION,
				variables: {
					networks: listSelection.map((item) => item.name)
				}
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					setDialogStates({
						errorDialogVisible: false,
						confirmDialogVisible: false
					});
					ref.current.refresh();
				});
			})
			.catch((error: ApolloError) => {
				const e = new ApolloExtendedError(error);
				setErrorMessage(e.message);
				setDialogStates({
					errorDialogVisible: true,
					confirmDialogVisible: false
				});
				ref.current?.unselectAll();
			});
	};

	const sortNetworks = (items: Array<any>): Array<any> => {
		if (items?.length) {
			return items
				.map((item) => {
					return {
						...item,
						timestamp: dayjs(item['created']).unix()
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

	const cleanNetworks = () => {
		apolloClient
			.mutate({
				mutation: NETWORK_CLEAN_PROJECTION
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					ref.current.refresh();
				});
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
						<ToolbarButton onClick={() => cleanNetworks()}>
							<MaterialIcon className={'text-primary'}>
								cleaning_services
							</MaterialIcon>
							<span>Prune</span>
						</ToolbarButton>
						<ToolbarButton
							disabled={listSelection?.length === 0}
							onClick={() => {
								setDialogStates({
									...dialogStates,
									confirmDialogVisible: true
								});
							}}
						>
							<MaterialIcon className={'text-danger'}>
								delete
							</MaterialIcon>
							<span>Remove</span>
						</ToolbarButton>
					</>
				)}
				<ToolbarButton
					onClick={() => setNetworkCreateViewVisible(true)}
				>
					<MaterialIcon className={'text-primary'}>
						add_box
					</MaterialIcon>
					<span>Add Network</span>
				</ToolbarButton>
			</Toolbar>
			<NetworkItemView
				item={currentItem}
				visible={networkDetailsViewVisible}
				onClose={() => {
					setCurrentItem(null);
					setNetworkDetailsViewVisible(false);
				}}
			/>
			<NetworkCreateView
				show={networkCreateViewVisible}
				onHide={() => setNetworkCreateViewVisible(false)}
				onCreated={() => {
					setNetworkCreateViewVisible(false);
					ref.current.refresh();
				}}
			/>
			<ErrorDialog
				show={dialogStates.errorDialogVisible}
				onHide={() => {
					setDialogStates({
						...dialogStates,
						errorDialogVisible: false
					});
					setErrorMessage('');
				}}
				message={errorMessage}
			></ErrorDialog>
			<Modal
				show={dialogStates.confirmDialogVisible}
				onHide={() =>
					setDialogStates({
						...dialogStates,
						confirmDialogVisible: false
					})
				}
			>
				<Modal.Header closeButton>
					<Modal.Title>Remove Networks</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Do you really want to remove the selected networks?
				</Modal.Body>
				<Modal.Footer>
					<RippleButton
						className={'btn-secondary'}
						onClick={() =>
							setDialogStates({
								...dialogStates,
								confirmDialogVisible: false
							})
						}
					>
						Cancel
					</RippleButton>
					<RippleButton
						className={'btn-danger'}
						onClick={() => {
							setDialogStates({
								...dialogStates,
								confirmDialogVisible: false
							});
							removeNetworks();
						}}
					>
						Delete
					</RippleButton>
				</Modal.Footer>
			</Modal>
			<GraphQLListView
				checkable
				onSelect={onSelect}
				onListLoaded={() => updateView()}
				ref={ref}
				headers={headers}
				fields={fields}
				listField={'networks'}
				projection={NETWORK_LIST_PROJECTION}
				fieldRenderer={{
					name: (item) => {
						return (
							<span
								className={'link'}
								onClick={() => {
									apolloClient.resetStore().then(() => {
										setCurrentItem(item.id);
										setNetworkDetailsViewVisible(true);
									});
								}}
							>
								{item['name']}
							</span>
						);
					},
					subnet: (item) => {
						if (!item['iPAM']['config'].length) {
							return 'N/A';
						}

						return (
							<div className={'d-flex flex-column'}>
								{item['iPAM']['config'].map((config) => {
									return (
										<span key={uniqueId()}>
											{config.subnet}
										</span>
									);
								})}
							</div>
						);
					},
					created: (item) => {
						return dayjs(item['created']).format(
							'YYYY-MM-DD HH:mm:ss'
						);
					}
				}}
				sort={sortNetworks}
			/>
		</PageContainer>
	);
};
