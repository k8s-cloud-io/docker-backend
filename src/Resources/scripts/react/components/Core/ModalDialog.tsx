import { PropsWithChildren } from 'react';
import { Modal } from 'react-bootstrap';
import { RippleButton } from './RippleButton';

export type ModalDialogButton = {
	label: string;
	className?: string;
	onClick?: () => void;
};

export type ModalDialogProps = {
	onHide?: () => void;
	visible: boolean;
	closeButton?: boolean;
	title: string;
	buttons?: [ModalDialogButton];
} & PropsWithChildren;

export const ModalDialog = (props: ModalDialogProps) => {
	return (
		<Modal onHide={props.onHide} show={props.visible}>
			<Modal.Header closeButton={props.closeButton}>
				<Modal.Title>{props.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>{props.children}</Modal.Body>
			<Modal.Footer>
				{props.buttons &&
					props.buttons.map((config) => {
						return (
							<RippleButton
								className={config.className}
								onClick={config.onClick}
							>
								{config.label}
							</RippleButton>
						);
					})}
			</Modal.Footer>
		</Modal>
	);
};
