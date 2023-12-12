import { ApolloError, useApolloClient } from '@apollo/client';
import { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { AppCtx } from '../../../contexts';
import {
	CONTAINER_LOGS_PROJECTION,
	CONTAINER_PROJECTION
} from '../../../graphql';
import {
	ApolloExtendedError,
	FormRow,
	MaterialIcon,
	MessageView,
	PageContainer,
	RippleButton,
	TabView,
	TextInput,
	Toolbar,
	ToolbarButton
} from '../../Core';
import { ContainerEnvPartial } from './partials/ContainerEnvView';
import { ContainerLogsView } from './partials/ContainerLogsView';

type ViewStateType = {
	loading: boolean;
	loaded: boolean;
	data: any;
	error: string;
};

export const ContainerView = (props: { tab: string }) => {
	const { param } = useParams();
	const { setValue } = useContext(AppCtx);
	const client = useApolloClient();
	const [viewState, setViewState] = useState<ViewStateType>({
		loading: false,
		loaded: false,
		data: null,
		error: null
	});
	const [envDialogVisible, setEnvDialogVisible] = useState(false);
	const [envAddDialogVisible, setEnvAddDialogVisible] = useState(false);
	const [envItem, setEnvItem] = useState(null);
	const [saveButtonDisabled, setSaveButtonDisabled] = useState(true);
	const envKey: RefObject<HTMLInputElement> = useRef();
	const envVal: RefObject<HTMLInputElement> = useRef();

	useEffect(() => {
		setValue(`Container ${param}`);
	});

	useEffect(() => {
		refresh();
	}, [props.tab]);

	const refresh = () => {
		client.clearStore().then(() => load());
	};

	const load = () => {
		if (viewState.loading) return;
		let projection = null;
		setViewState({
			loading: false,
			loaded: false,
			data: null,
			error: null
		});

		switch (props.tab) {
			case 'general':
			case 'networks':
			case 'environment':
				setSaveButtonDisabled(true);
				projection = CONTAINER_PROJECTION;
				break;

			case 'logs':
				setSaveButtonDisabled(true);
				projection = CONTAINER_LOGS_PROJECTION;
				break;
		}

		if (!projection) {
			setViewState({
				loading: false,
				loaded: false,
				data: null,
				error: 'Unable to load container data: unknown projection'
			});
			return;
		}

		setViewState({
			loading: true,
			loaded: false,
			data: null,
			error: null
		});

		client
			.query({
				query: projection,
				variables: {
					id: param
				}
			})
			.then((result) => {
				setViewState({
					loading: false,
					loaded: true,
					data: result.data,
					error: null
				});
			})
			.catch((e: ApolloError) => {
				const error = new ApolloExtendedError(e);
				setViewState({
					loading: false,
					loaded: true,
					data: null,
					error: error.message
				});
			});
	};

	return (
		<PageContainer>
			<Toolbar>
				<ToolbarButton onClick={() => refresh()}>
					<MaterialIcon className={'text-primary'}>
						refresh
					</MaterialIcon>
					<span>Refresh</span>
				</ToolbarButton>
				<ToolbarButton disabled={saveButtonDisabled}>
					<MaterialIcon className={'text-primary'}>done</MaterialIcon>
					<span>Save</span>
				</ToolbarButton>
				{props.tab === 'environment' && (
					<ToolbarButton
						className={'ms-5'}
						onClick={() => setEnvAddDialogVisible(true)}
					>
						<MaterialIcon className={'text-primary'}>
							add_box
						</MaterialIcon>
						<span>Add Variable</span>
					</ToolbarButton>
				)}
			</Toolbar>
			<TabView
				currentTab={props.tab}
				tabs={[
					{
						title: 'General',
						name: 'general',
						target: `/containers/${param}/general`
					},
					{
						title: 'Network',
						name: 'networks',
						target: `/containers/${param}/networks`
					},
					{
						title: 'Environment',
						name: 'environment',
						target: `/containers/${param}/environment`
					},
					{
						title: 'Logs',
						name: 'logs',
						target: `/containers/${param}/logs`
					}
				]}
			></TabView>
			{viewState.loading && (
				<MessageView
					message={'Please wait, while loading...'}
					type={'info'}
				/>
			)}
			{!viewState.loading && viewState.error && (
				<MessageView message={viewState.error} type={'error'} />
			)}
			{!viewState.loading && viewState.data && (
				<>
					{envAddDialogVisible && (
						<Modal
							show={true}
							onHide={() => {
								setEnvAddDialogVisible(() => {
									setEnvItem(null);
									return false;
								});
							}}
						>
							<Modal.Header closeButton>
								<Modal.Title>
									Add Environment Variable
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<form>
									<FormRow label={'Name'}>
										<TextInput
											ref={envKey}
											onChange={() => {
												setEnvItem({
													...envItem,
													key: envKey.current.value
												});
											}}
										/>
									</FormRow>
									<FormRow label={'Value'}>
										<TextInput
											ref={envVal}
											onChange={() => {
												setEnvItem({
													...envItem,
													val: envVal.current.value
												});
											}}
										/>
									</FormRow>
								</form>
							</Modal.Body>
							<Modal.Footer>
								<RippleButton
									className={'btn-secondary'}
									onClick={() => {
										setEnvAddDialogVisible(() => {
											setEnvItem(null);
											return false;
										});
									}}
								>
									Cancel
								</RippleButton>
								<RippleButton
									className={'btn-primary'}
									onClick={() => {
										setEnvAddDialogVisible(() => {
											const env: any = [
												...viewState.data.container
													.config.env
											];
											env.push(
												`${envItem.key}=${envItem.val}`
											);

											setViewState({
												...viewState,
												data: {
													...viewState.data,
													container: {
														...viewState.data
															.container,
														config: {
															...viewState.data
																.config,
															env
														}
													}
												}
											});
											setEnvItem(null);
											setSaveButtonDisabled(false);
											return false;
										});
									}}
								>
									OK
								</RippleButton>
							</Modal.Footer>
						</Modal>
					)}
					{envDialogVisible && (
						<Modal
							show={true}
							onHide={() => {
								setEnvDialogVisible(() => {
									setEnvItem(null);
									return false;
								});
							}}
						>
							<Modal.Header closeButton>
								<Modal.Title>
									Edit Environment Variable
								</Modal.Title>
							</Modal.Header>
							<Modal.Body>
								<form>
									<FormRow label={'Name'}>
										<TextInput
											ref={envKey}
											value={envItem?.key}
											onChange={() => {
												setEnvItem({
													...envItem,
													key: envKey.current.value
												});
											}}
										/>
									</FormRow>
									<FormRow label={'Value'}>
										<TextInput
											ref={envVal}
											value={envItem?.val}
											onChange={() => {
												setEnvItem({
													...envItem,
													val: envVal.current.value
												});
											}}
										/>
									</FormRow>
								</form>
							</Modal.Body>
							<Modal.Footer>
								<RippleButton
									className={'btn-secondary'}
									onClick={() => {
										setEnvDialogVisible(() => {
											setEnvItem(null);
											return false;
										});
									}}
								>
									Cancel
								</RippleButton>
								<RippleButton
									className={'btn-primary'}
									onClick={() => {
										setEnvDialogVisible(() => {
											const env: any = [
												...viewState.data.container
													.config.env
											].map((item) => {
												if (
													item.startsWith(envItem.key)
												) {
													return `${envKey.current.value}=${envVal.current.value}`;
												}
												return item;
											});
											setViewState({
												...viewState,
												data: {
													...viewState.data,
													container: {
														...viewState.data
															.container,
														config: {
															...viewState.data
																.config,
															env
														}
													}
												}
											});
											setEnvItem(null);
											setSaveButtonDisabled(false);
											return false;
										});
									}}
								>
									OK
								</RippleButton>
							</Modal.Footer>
						</Modal>
					)}
					{viewState.data?.container &&
						props.tab === 'environment' && (
							<ContainerEnvPartial
								editable
								env={viewState.data.container['config']['env']}
								onEdit={(item) => {
									const key = item
										.substring(0, item.indexOf('='))
										.trim();
									const val = item
										.substring(item.indexOf('=') + 1)
										.trim();
									setEnvDialogVisible(() => {
										setEnvItem({ key, val });
										return true;
									});
								}}
							/>
						)}
					{viewState.data?.containerLogs && props.tab === 'logs' && (
						<ContainerLogsView
							data={viewState.data?.containerLogs}
						/>
					)}
				</>
			)}
		</PageContainer>
	);
};
