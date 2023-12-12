import { gql } from '@apollo/client';

export const SERVICE_LIST_PROJECTION = gql`
	query services {
		services {
			id
			createdAt
			updatedAt
			version {
				id
			}
			spec {
				name
			}
		}
	}
`;
