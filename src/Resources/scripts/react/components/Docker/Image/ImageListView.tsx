import { ApolloError, useApolloClient } from '@apollo/client';
import useForceUpdate from '@restart/hooks/useForceUpdate';
import dayjs from 'dayjs';
import { filesize } from 'filesize';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { AppCtx } from '../../../contexts';
import {
	IMAGE_CLEAN_PROJECTION,
	IMAGE_LIST_PROJECTION,
	IMAGE_REMOVE_PROJECTION,
	IMAGE_UPDATE_PROJECTION
} from '../../../graphql';
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
import { ImageItemView } from './ImageItemView';

type DialogStates = {
	imageDetailsVisible: boolean;
	updateDialogVisible: boolean;
	errorDialogVisible: boolean;
	confirmDialogVisible: boolean;
};

export function ImageListView() {
	const headers: Array<string> = ['Name', 'Version', 'Size', 'Created At'];
	const fields: Array<string> = ['name', 'version', 'size', 'created'];
	const apolloClient = useApolloClient();
	const { setValue } = useContext(AppCtx);
	const ref = useRef(null);

	const [dialogStates, setDialogStates] = useState<DialogStates>({
		imageDetailsVisible: false,
		updateDialogVisible: false,
		errorDialogVisible: false,
		confirmDialogVisible: false
	});
	const [imageDetailsVisible, setImageDetailsVisible] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [selectedItem, setSelectedItem] = useState(null);
	const [listSelection, setListSelection] = useState([]);
	const updateViewInternal = useForceUpdate();

	const updateView = useCallback(() => {
		updateViewInternal();
	}, [updateViewInternal]);

	useEffect(() => {
		setValue('Images');
	}, []);

	const onUpdateImage = () => {
		setImageDetailsVisible(false);
		setDialogStates({
			errorDialogVisible: false,
			updateDialogVisible: true,
			confirmDialogVisible: false,
			imageDetailsVisible: false
		});
		apolloClient
			.mutate({
				mutation: IMAGE_UPDATE_PROJECTION,
				variables: {
					tag: selectedItem?.repoTags[0]
				}
			})
			.then(() => {
				setSelectedItem(null);
				setErrorMessage('');
				setDialogStates({
					errorDialogVisible: false,
					updateDialogVisible: false,
					confirmDialogVisible: false,
					imageDetailsVisible: false
				});
				ref.current.refresh();
			})
			.catch((error: ApolloExtendedError) => {
				const e = new ApolloExtendedError(error);
				setSelectedItem(null);
				setErrorMessage(e.message);
				setDialogStates({
					errorDialogVisible: true,
					updateDialogVisible: false,
					confirmDialogVisible: false,
					imageDetailsVisible: false
				});
			});
	};

	const sortImages = (items: Array<any>): Array<any> => {
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

	const cleanImages = () => {
		apolloClient
			.mutate({
				mutation: IMAGE_CLEAN_PROJECTION
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					ref.current.refresh();
				});
			});
	};

	const removeImages = () => {
		apolloClient
			.mutate({
				mutation: IMAGE_REMOVE_PROJECTION,
				variables: {
					images: listSelection.map((item) => item.id)
				}
			})
			.then(() => {
				apolloClient.resetStore().then(() => {
					setDialogStates({
						errorDialogVisible: false,
						updateDialogVisible: false,
						confirmDialogVisible: false,
						imageDetailsVisible: false
					});
					ref.current.refresh();
				});
			})
			.catch((error: ApolloError) => {
				const e = new ApolloExtendedError(error);
				setErrorMessage(e.message);
				setDialogStates({
					errorDialogVisible: true,
					updateDialogVisible: false,
					confirmDialogVisible: false,
					imageDetailsVisible: false
				});
				ref.current?.unselectAll();
			});
	};

	const onSelect = (items: Array<any>) => {
		setListSelection([...items.filter((item) => item.__internalChecked__)]);
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
						<ToolbarButton onClick={() => cleanImages()}>
							<MaterialIcon className={'text-primary'}>
								cleaning_services
							</MaterialIcon>
							<span>Prune</span>
						</ToolbarButton>
						<ToolbarButton
							disabled={listSelection?.length === 0}
							onClick={() =>
								setDialogStates({
									...dialogStates,
									confirmDialogVisible: true
								})
							}
						>
							<MaterialIcon className={'text-danger'}>
								delete
							</MaterialIcon>
							<span>Remove</span>
						</ToolbarButton>
					</>
				)}
			</Toolbar>
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
					<Modal.Title>Remove Images</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Do you really want to remove the selected images?
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
							removeImages();
						}}
					>
						Delete
					</RippleButton>
				</Modal.Footer>
			</Modal>
			<ImageItemView
				item={selectedItem}
				visible={imageDetailsVisible}
				onClose={() => {
					setSelectedItem(null);
					setImageDetailsVisible(false);
				}}
				onUpdateImage={onUpdateImage}
			/>
			<Modal show={dialogStates.updateDialogVisible} onHide={() => {}}>
				<Modal.Header>
					<Modal.Title>
						Update Image {selectedItem?.repoTags[0]}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className={'fs-6'}>
					Please wait, while image update is in progress...
				</Modal.Body>
			</Modal>
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
			/>
			<GraphQLListView
				checkable={true}
				onSelect={onSelect}
				onListLoaded={() => updateView()}
				ref={ref}
				headers={headers}
				fields={fields}
				listField={'images'}
				projection={IMAGE_LIST_PROJECTION}
				fieldRenderer={{
					name: (item) => {
						const value = item['repoTags']?.length
							? item['repoTags'][0].split(':')[0]
							: '<none>';
						return (
							<span
								className={'link'}
								onClick={() => {
									apolloClient.resetStore().then(() => {
										setSelectedItem(item);
										setImageDetailsVisible(true);
									});
								}}
							>
								{value}
							</span>
						);
					},
					version: (item) => {
						const value = item['repoTags']?.length
							? item['repoTags'][0].split(':')[1]
							: '<none>';
						return <span>{value}</span>;
					},
					created: (item) => {
						return dayjs
							.unix(item['created'])
							.format('YYYY-MM-DD HH:mm:ss');
					},
					size: (item) => {
						return filesize(item['size']);
					}
				}}
				sort={sortImages}
			/>
		</PageContainer>
	);
}
