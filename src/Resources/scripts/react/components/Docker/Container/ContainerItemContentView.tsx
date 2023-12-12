import dayjs from 'dayjs';
import { Fragment, useState } from 'react';
import { formatUptime, uniqueId } from '../../../utils';
import { ContainerItemEnvDialog } from './ContainerItemEnvDialog';
import { ContainerItemNetworkDialog } from './ContainerItemNetworkDialog';

export const ContainerItemContentView = (props: { item: any }) => {
	const [containerEnvDialogVisible, setContainerEnvDialogVisible] =
		useState(false);
	const [containerNetworkDialogVisible, setContainerNetworkDialogVisible] =
		useState(false);

	const hasContainerPorts = () => {
		let has = 0;
		const keys = Object.keys(props.item.networkSettings.ports || {});
		if (!keys.length) return false;

		keys.forEach((key) => {
			const config = props.item.networkSettings.ports[key];
			if (config) has++;
		});

		return has > 0;
	};

	return (
		<>
			<h6>General</h6>
			<ContainerItemEnvDialog
				container={props.item}
				visible={containerEnvDialogVisible}
				onClose={() => {
					setContainerEnvDialogVisible(false);
				}}
			/>
			<ContainerItemNetworkDialog
				onClose={() => {
					setContainerNetworkDialogVisible(false);
				}}
				visible={containerNetworkDialogVisible}
				container={props.item}
			/>
			<table className={'table data-table'}>
				<tbody>
					<tr>
						<th className={'valign-middle bg-light'}>Created At</th>
						<td className={'valign-middle'}>
							{dayjs(props.item.created).format(
								'YYYY-MM-DD HH:mm:ss'
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light'}>Uptime</th>
						<td className={'valign-middle'}>
							{formatUptime(props.item.state.startedAt)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light'}>Image</th>
						<td className={'valign-middle'}>
							{props.item.config.image}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light'}>Hostname</th>
						<td className={'valign-middle'}>
							{props.item.config.hostname}
						</td>
					</tr>
					{hasContainerPorts() && (
						<tr>
							<th className={'valign-top bg-light'}>Ports</th>
							<td className={'valign-top d-flex flex-column'}>
								{Object.keys(
									props.item.networkSettings.ports
								).map((key) => {
									const parts = key.split('/');
									const config =
										props.item.networkSettings.ports[key] ||
										[];
									return (
										<Fragment key={uniqueId()}>
											{config.map((conf) => {
												return (
													<span key={uniqueId()}>
														{parts[0]} -{' '}
														{conf.hostIp}:
														{conf.hostPort} (
														{parts[1]})
													</span>
												);
											})}
										</Fragment>
									);
								})}
							</td>
						</tr>
					)}
					{Object.keys(props.item.networkSettings?.networks || {})
						.length > 0 && (
						<tr>
							<th className={'valign-top bg-light'}>Networks</th>
							<td className={'valign-top'}>
								<div className={'tag-list'}>
									{Object.keys(
										props.item.networkSettings.networks
									).map((key) => {
										return (
											<span
												key={uniqueId()}
												className={'tag'}
												onClick={() => {
													if (
														props.item.state
															.status ===
														'running'
													) {
														setContainerNetworkDialogVisible(
															true
														);
													}
												}}
											>
												{key}
											</span>
										);
									})}
								</div>
							</td>
						</tr>
					)}
					{Object.keys(props.item['config']['labels'] || {}).length >
						0 && (
						<tr>
							<th className={'valign-top bg-light'}>Labels</th>
							<td className={'valign-top'}>
								{Object.keys(
									props.item['config']['labels']
								).map((key: string) => {
									return (
										<div key={uniqueId()}>
											{key}:{' '}
											{
												props.item['config']['labels'][
													key
												]
											}
										</div>
									);
								})}
							</td>
						</tr>
					)}
					<tr>
						<th className={'valign-top bg-light'}>Environment</th>
						<td className={'valign-top'}>
							<div className={'tag-list'}>
								{props.item['config']['env'].map(
									(env: string) => {
										return (
											<span
												onClick={() =>
													setContainerEnvDialogVisible(
														true
													)
												}
												className={'tag'}
												key={uniqueId()}
											>
												{env.split('=')[0]}
											</span>
										);
									}
								)}
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</>
	);
};
