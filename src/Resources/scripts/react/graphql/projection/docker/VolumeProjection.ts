import { gql } from '@apollo/client';

export const VOLUME_LIST_PROJECTION = gql`
	query volumes {
		volumes {
			driver
			mountpoint
			name
			createdAt
			scope
			labels
		}
	}
`;

export const VOLUME_CLEAN_PROJECTION = gql`
	mutation cleanVolumes {
		cleanVolumes
	}
`;

export const VOLUME_REMOVE_PROJECTION = gql`
	mutation removeVolumes($volumes: [String!]!) {
		removeVolumes(volumes: $volumes)
	}
`;
