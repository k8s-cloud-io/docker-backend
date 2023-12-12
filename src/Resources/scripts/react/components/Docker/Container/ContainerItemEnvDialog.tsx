import { Modal } from 'react-bootstrap';
import { RippleButton } from '../../Core';
import { ContainerEnvPartial } from './partials/ContainerEnvView';

export const ContainerItemEnvDialog = (props: {
	onClose: () => void;
	visible: boolean;
	container: any;
}) => {
	return (
		<Modal onHide={props.onClose} show={props.visible}>
			<Modal.Header closeButton>
				<Modal.Title>Container Environment</Modal.Title>
			</Modal.Header>
			<Modal.Body className={'fs-6'}>
				<ContainerEnvPartial env={props.container['config']['env']} />
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
