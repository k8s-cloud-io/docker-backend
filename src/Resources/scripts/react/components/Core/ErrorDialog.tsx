import { MessageView } from './MessageView';
import { ModalDialog } from './ModalDialog';

export type ErrorDialogProps = {
	onHide: () => void;
	message: string;
	show: boolean;
};

export const ErrorDialog = (props: ErrorDialogProps) => {
	return (
		<ModalDialog
			visible={props.show}
			title={'An error has occurred'}
			buttons={[
				{
					label: 'OK',
					className: 'btn-danger',
					onClick: props.onHide
				}
			]}
		>
			<MessageView message={props.message} type={'error'} />
		</ModalDialog>
	);
};
