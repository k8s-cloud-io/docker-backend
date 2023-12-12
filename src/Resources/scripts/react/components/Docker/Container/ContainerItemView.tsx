import { Offcanvas } from 'react-bootstrap';
import { CONTAINER_PROJECTION, useGraphqlProjection } from '../../../graphql';
import { MessageView } from '../../Core';
import { ContainerItemContentView } from './ContainerItemContentView';

export const ContainerItemView = (props: {
	item: any;
	visible: boolean;
	onClose: () => void;
}) => {
	const { loading, error, data } = useGraphqlProjection({
		query: CONTAINER_PROJECTION,
		variables: {
			id: props.item?.id
		},
		load: props.item?.id
	});

	return (
		<Offcanvas
			show={props.visible}
			onHide={props.onClose}
			placement={'end'}
		>
			<Offcanvas.Header closeButton>
				{data?.container && (
					<Offcanvas.Title
						className={'d-flex flex-row align-items-center'}
					>
						{data.container.name.startsWith('/')
							? data.container.name.substring(1)
							: data.container.name}
					</Offcanvas.Title>
				)}
				{!data?.container && !error && <Offcanvas.Title />}
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
				{data?.container && (
					<ContainerItemContentView item={data.container} />
				)}
			</Offcanvas.Body>
		</Offcanvas>
	);
};
