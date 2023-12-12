import { ApolloError, useApolloClient } from '@apollo/client';
import useForceUpdate from '@restart/hooks/useForceUpdate';
import { Dropdown } from 'bootstrap';
import dayjs from 'dayjs';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AppCtx } from '../../../contexts';
import {
	CONTAINER_CLEAN_PROJECTION,
	CONTAINER_LIST_PROJECTION,
	CONTAINER_REMOVE_PROJECTION,
	CONTAINER_RESTART_PROJECTION,
	CONTAINER_START_PROJECTION,
	CONTAINER_STOP_PROJECTION
} from '../../../graphql';
import { uniqueId } from '../../../utils';
import {
	ApolloExtendedError,
	ErrorDialog,
	GraphQLListView,
	MaterialIcon,
	ModalDialog,
	PageContainer,
	RippleButton,
	Toolbar,
	ToolbarButton
} from '../../Core';
import { ContainerItemView } from './ContainerItemView';

type States = {
	detailsVisible: boolean;
	errorDialogVisible: boolean;
};

type ActionType = {
	title: string;
	message: string;
};

export const ContainerListView = () => {
	const headers: Array<string> = [
		'Name',
		'Image',
		'IP Addresses',
		'Ports',
		'State',
		'Created At',
		''
	];
	const fields: Array<string> = [
		'name',
		'image',
		'ipAddress',
		'ports',
		'state',
		'created',
		'action'
	];
	const ref = useRef(null);
	const apolloClient = useApolloClient();
	const [selectedItem, setSelectedItem] = useState(null);
	const [viewDetails, setViewDetails] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [currentAction, setCurrentAction] = useState<ActionType>(null);
	const [confirmDialogVisible, setConfirmDialogVisible] = useState(null);
	const [listSelection, setListSelection] = useState([]);
	const navigate = useNavigate();
	const updateViewInternal = useForceUpdate();

	const updateView = useCallback(() => {
		updateViewInternal();
	}, [updateViewInternal]);

	const [states, setStates] = useState<States>({
		detailsVisible: false,
		errorDialogVisible: false
	});

	const { setValue } = useContext(AppCtx);
	useEffect(() => {
		setValue('Containers');

		const dropDowns = document.querySelectorAll('.dropdown');
		dropDowns.forEach((d) => {
			new Dropdown(d);
		});
	});

	const sortContainers = (items: Array<any>): Array<any> => {
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

	const startContainer = (id: string) => {
		setErrorMessage(null);
		setCurrentAction({
			title: 'Start Container',
			message: 'Please wait, while starting container'
		});
		apolloClient
			.mutate({
				mutation: CONTAINER_START_PROJECTION,
				variables: {
					id
				}
			})
			.then(() => {
				setCurrentAction(null);
				ref.current.refresh();
			})
			.catch((error: ApolloError) => {
				ref.current.refresh();
				const e = new ApolloExtendedError(error);
				setCurrentAction(null);
				setErrorMessage(e.message);
			});
	};

	const stopContainer = (id: string) => {
		setErrorMessage(null);
		setCurrentAction({
			title: 'Stop Container',
			message: 'Please wait, while stopping container'
		});
		apolloClient
			.mutate({
				mutation: CONTAINER_STOP_PROJECTION,
				variables: {
					id
				}
			})
			.then(() => {
				setCurrentAction(null);
				ref.current.refresh();
			})
			.catch((error: ApolloError) => {
				ref.current.refresh();
				const e = new ApolloExtendedError(error);
				setCurrentAction(null);
				setErrorMessage(e.message);
			});
	};

	const restartContainer = (id: string) => {
		setErrorMessage(null);
		setCurrentAction({
			title: 'Restart Container',
			message: 'Please wait, while restarting container'
		});
		apolloClient
			.mutate({
				mutation: CONTAINER_RESTART_PROJECTION,
				variables: {
					id
				}
			})
			.then(() => {
				setCurrentAction(null);
				ref.current.refresh();
			})
			.catch((error: ApolloError) => {
				const e = new ApolloExtendedError(error);
				ref.current.refresh();
				setCurrentAction(null);
				setErrorMessage(e.message);
			});
	};

	const removeContainers = () => {
		apolloClient
			.mutate({
				mutation: CONTAINER_REMOVE_PROJECTION,
				variables: {
					containers: listSelection.map((item) => item.id)
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
				setStates({
					...states,
					errorDialogVisible: true
				});
				ref.current?.unselectAll();
			});
	};

	const onSelect = (items: Array<any>) => {
		setListSelection([...items.filter((item) => item.__internalChecked__)]);
	};

	const cleanContainers = () => {
		apolloClient
			.mutate({
				mutation: CONTAINER_CLEAN_PROJECTION
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
						<ToolbarButton onClick={() => cleanContainers()}>
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
			{currentAction && (
				<ModalDialog
					visible={true}
					title={currentAction.title}
					onHide={() => setCurrentAction(null)}
				>
					{currentAction.message}
				</ModalDialog>
			)}
			<Modal
				show={confirmDialogVisible}
				onHide={() => setConfirmDialogVisible(false)}
			>
				<Modal.Header closeButton>
					<Modal.Title>Delete Container</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Do you really want to remove the selected containers?
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
							removeContainers();
						}}
					>
						Delete
					</RippleButton>
				</Modal.Footer>
			</Modal>
			<ContainerItemView
				visible={viewDetails}
				item={selectedItem}
				onClose={() => {
					setSelectedItem(null);
					setViewDetails(false);
				}}
			/>
			<GraphQLListView
				checkable
				onSelect={onSelect}
				onListLoaded={() => updateView()}
				ref={ref}
				headers={headers}
				fields={fields}
				listField={'containers'}
				projection={CONTAINER_LIST_PROJECTION}
				fieldRenderer={{
					created: (item) => {
						return dayjs
							.unix(item['created'])
							.format('YYYY-MM-DD HH:mm:ss');
					},
					name: (item) => {
						let name = item['names'][0];
						if (name.startsWith('/')) {
							name = name.substring(1);
						}
						return (
							<span
								className={'link'}
								onClick={() => {
									apolloClient.resetStore().then(() => {
										setSelectedItem(item);
										setViewDetails(true);
									});
								}}
							>
								{name}
							</span>
						);
					},
					image: (item) => {
						const nameParts = item['image'].split(':');
						if (nameParts[0].startsWith('sha256')) return '<none>';

						return nameParts[0];
					},
					ipAddress: (item) => {
						const networks = item.networkSettings.networks;
						return (
							<div className={'d-flex flex-column'}>
								{Object.keys(networks).map((network) => {
									return (
										<span key={uniqueId()}>
											{networks[network].iPAddress}
										</span>
									);
								})}
							</div>
						);
					},
					action: (item) => {
						return (
							<div key={uniqueId()} className={'dropdown'}>
								<MaterialIcon
									className={'cursor-pointer'}
									data-bs-toggle={'dropdown'}
								>
									more_vert
								</MaterialIcon>
								<ul className="dropdown-menu">
									{item.state === 'running' && (
										<>
											<li
												onClick={() =>
													restartContainer(item.id)
												}
											>
												<span className="dropdown-item">
													<MaterialIcon
														className={
															'text-primary'
														}
													>
														refresh
													</MaterialIcon>
													<span>Restart</span>
												</span>
											</li>
											<li
												onClick={() =>
													stopContainer(item.id)
												}
											>
												<span className="dropdown-item">
													<MaterialIcon
														className={
															'text-primary'
														}
													>
														stop_circle
													</MaterialIcon>
													<span>stop</span>
												</span>
											</li>
										</>
									)}
									{item.state !== 'running' && (
										<li
											onClick={() =>
												startContainer(item.id)
											}
										>
											<span className="dropdown-item">
												<MaterialIcon
													className={'text-primary'}
												>
													play_circle
												</MaterialIcon>
												<span>Start</span>
											</span>
										</li>
									)}
									<li
										onClick={() => {
											let name = item['names'][0];
											if (name.startsWith('/')) {
												name = name.substring(1);
											}
											navigate(`/containers/${name}`);
										}}
									>
										<span className="dropdown-item">
											<MaterialIcon
												className={'text-primary'}
											>
												edit
											</MaterialIcon>
											<span>Edit</span>
										</span>
									</li>
									<li
										onClick={() => {
											setListSelection([item]);
											setConfirmDialogVisible(true);
										}}
									>
										<span className="dropdown-item">
											<MaterialIcon
												className={'text-danger'}
											>
												delete
											</MaterialIcon>
											<span>Delete</span>
										</span>
									</li>
								</ul>
							</div>
						);
					},
					ports: (item) => {
						return (
							<div className={'d-flex flex-column'}>
								{item.ports?.map((port) => {
									if (!port.publicPort)
										return (
											<span key={uniqueId()}>N/A</span>
										);
									return (
										<span key={uniqueId()}>
											{`${port.privatePort}:${port.publicPort}/${port.type}`}
										</span>
									);
								})}
							</div>
						);
					}
				}}
				sort={sortContainers}
			/>
		</PageContainer>
	);
};
