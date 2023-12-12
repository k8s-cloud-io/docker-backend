import { Fragment } from 'react';
import { Modal } from 'react-bootstrap';
import { uniqueId } from '../../../utils';
import { RippleButton } from '../../Core';

export const ContainerItemNetworkDialog = (props: {
	onClose: () => void;
	visible: boolean;
	container: any;
}) => {
	return (
		<Modal onHide={props.onClose} show={props.visible}>
			<Modal.Header closeButton>
				<Modal.Title>Container Networks</Modal.Title>
			</Modal.Header>
			<Modal.Body className={'d-flex flex-column fs-6'}>
				{Object.keys(props.container.networkSettings.networks).map(
					(networkName) => {
						return (
							<Fragment key={uniqueId()}>
								<h6>{networkName}</h6>
								<table
									className={
										'table data-table table-bordered'
									}
								>
									<tbody>
										<tr>
											<th
												className={
													'valign-middle bg-light'
												}
											>
												IP Address
											</th>
											<td className={'valign-middle'}>
												{
													props.container
														.networkSettings
														.networks[networkName][
														'iPAddress'
													]
												}
											</td>
										</tr>
										<tr>
											<th
												className={
													'valign-middle bg-light'
												}
											>
												Gateway
											</th>
											<td className={'valign-middle'}>
												{
													props.container
														.networkSettings
														.networks[networkName][
														'gateway'
													]
												}
											</td>
										</tr>
										<tr>
											<th
												className={
													'valign-middle bg-light'
												}
											>
												MAC Address
											</th>
											<td className={'valign-middle'}>
												{
													props.container
														.networkSettings
														.networks[networkName][
														'macAddress'
													]
												}
											</td>
										</tr>
									</tbody>
								</table>
							</Fragment>
						);
					}
				)}
			</Modal.Body>
			<Modal.Footer>
				<RippleButton
					className={'btn-secondary'}
					onClick={props.onClose}
				>
					cancel
				</RippleButton>
				<RippleButton className={'btn-primary'} onClick={props.onClose}>
					ok
				</RippleButton>
			</Modal.Footer>
		</Modal>
	);
};
