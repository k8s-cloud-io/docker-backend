import { gql } from '@apollo/client';

export const CONTAINER_LIST_PROJECTION = gql`
	query containers {
		containers {
			id
			names
			command
			created
			state
			image
			labels
			networkSettings
			ports {
				publicPort
				privatePort
				type
			}
		}
	}
`;

export const CONTAINER_PROJECTION = gql`
	query container($id: String!) {
		container(id: $id) {
			id
			name
			created
			state {
				status
				startedAt
			}
			networkSettings {
				networks
				ports
			}
			config {
				hostname
				env
				image
				labels
			}
		}
	}
`;

export const CONTAINER_START_PROJECTION = gql`
	mutation startContainer($id: String!) {
		startContainer(id: $id)
	}
`;
export const CONTAINER_STOP_PROJECTION = gql`
	mutation stopContainer($id: String!) {
		stopContainer(id: $id)
	}
`;
export const CONTAINER_RESTART_PROJECTION = gql`
	mutation restartContainer($id: String!) {
		restartContainer(id: $id)
	}
`;
export const CONTAINER_REMOVE_PROJECTION = gql`
	mutation removeContainers($containers: [String!]!) {
		removeContainers(containers: $containers)
	}
`;

export const CONTAINER_LOGS_PROJECTION = gql`
	query containerLogs($id: String!) {
		containerLogs(id: $id)
	}
`;

export const CONTAINER_CLEAN_PROJECTION = gql`
	mutation cleanContainers {
		cleanContainers
	}
`;
