import { gql } from '@apollo/client';

export const IMAGE_LIST_PROJECTION = gql`
	query images {
		images {
			id
			size
			sharedSize
			virtualSize
			containers
			labels
			repoTags
			repoDigests
			created
		}
	}
`;

export const IMAGE_PROJECTION = gql`
	query image($id: String!) {
		image(id: $id) {
			id
			author
			comment
			size
			sharedSize
			virtualSize
			containers
			repoTags
			repoDigests
			created
			config
		}
	}
`;

export const IMAGE_UPDATE_PROJECTION = gql`
	mutation updateImage($tag: String!) {
		updateImage(tag: $tag)
	}
`;

export const IMAGE_REMOVE_PROJECTION = gql`
	mutation removeImages($images: [String!]!) {
		removeImages(images: $images)
	}
`;

export const IMAGE_CLEAN_PROJECTION = gql`
	mutation cleanImages {
		cleanImages
	}
`;
