import { Offcanvas } from 'react-bootstrap';
import { IMAGE_PROJECTION, useGraphqlProjection } from '../../../graphql';
import { MaterialIcon, MessageView } from '../../Core';
import { ImageItemContentView } from './ImageItemContentView';

export const ImageItemView = (props: {
	item: any;
	visible: boolean;
	onClose: () => void;
	onUpdateImage?: () => void;
}) => {
	const { loading, error, data } = useGraphqlProjection({
		query: IMAGE_PROJECTION,
		variables: {
			id: props.item?.id
		},
		load: !!props.item
	});

	const getImageName = () => {
		const tags: Array<string> = data.image.repoTags || [];
		const nameRaw = tags.length ? tags[0] : '';
		let name = nameRaw.substring(0, nameRaw.indexOf(':'));

		const tagName = nameRaw?.indexOf(':')
			? nameRaw.substring(nameRaw.indexOf(':') + 1)
			: null;

		if (!name?.length) {
			const digests: Array<string> = data.image.repoDigests || [];
			if (digests.length) {
				const digest = digests[0];
				if (digest.indexOf('@')) {
					name = digest.substring(0, digest.indexOf('@'));
				}
			}
		}

		if (nameRaw.endsWith(':latest')) {
			return (
				<span className={'d-flex flex-row align-items-center'}>
					<span>
						{name} ({tagName || 'none'})
					</span>
					<MaterialIcon
						className={'refresh-icon'}
						onClick={props.onUpdateImage}
					>
						sync
					</MaterialIcon>
				</span>
			);
		}

		return `${name} (${tagName || 'none'})`;
	};

	return (
		<Offcanvas
			show={props.visible}
			onHide={props.onClose}
			placement={'end'}
		>
			<Offcanvas.Header closeButton>
				{data?.image && (
					<Offcanvas.Title
						className={'d-flex flex-row align-items-center'}
					>
						<span>{getImageName()}</span>
					</Offcanvas.Title>
				)}
				{!data?.image && !error && <Offcanvas.Title />}
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
				{data?.image && <ImageItemContentView item={data.image} />}
			</Offcanvas.Body>
		</Offcanvas>
	);
};
