import { Offcanvas } from 'react-bootstrap';
import { NETWORK_PROJECTION, useGraphqlProjection } from '../../../graphql';
import { MessageView } from '../../Core';
import { NetworkItemContentView } from './NetworkItemContentView';

export const NetworkItemView = (props: {
	item: string;
	visible: boolean;
	onClose: () => void;
}) => {
	const { loading, error, data } = useGraphqlProjection({
		query: NETWORK_PROJECTION,
		variables: {
			id: props.item
		},
		load: !!props.item
	});

	return (
		<Offcanvas
			show={props.visible}
			onHide={props.onClose}
			placement={'end'}
		>
			<Offcanvas.Header closeButton>
				{data?.network && (
					<Offcanvas.Title className={'text-truncate'}>
						{data?.network['name']}
					</Offcanvas.Title>
				)}
				{!data?.network && !error && <Offcanvas.Title />}
				{error && (
					<Offcanvas.Title className={'text-danger'}>
						Error
					</Offcanvas.Title>
				)}
			</Offcanvas.Header>
			<Offcanvas.Body className={'d-flex flex-column'}>
				{loading && (
					<MessageView
						message={'Please wait, while loading'}
						type={'info'}
					/>
				)}
				{error && (
					<MessageView message={error.message} type={'error'} />
				)}
				{data?.network && (
					<NetworkItemContentView item={data.network} />
				)}
			</Offcanvas.Body>
		</Offcanvas>
	);
};
