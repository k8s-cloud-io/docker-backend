import { gql } from '@apollo/client';

export const NETWORK_LIST_PROJECTION = gql`
	query networks {
		networks {
			name
			id
			scope
			created
			driver
			attachable
			internal
			labels
			ingress
			enableIPv6
			iPAM
		}
	}
`;

export const NETWORK_PROJECTION = gql`
	query network($id: String!) {
		network(id: $id) {
			name
			id
			scope
			created
			driver
			attachable
			internal
			labels
			ingress
			enableIPv6
			iPAM
			containers
		}
	}
`;

export const NETWORK_REMOVE_PROJECTION = gql`
	mutation removeNetworks($networks: [String!]!) {
		removeNetworks(networks: $networks)
	}
`;

export const NETWORK_CLEAN_PROJECTION = gql`
	mutation cleanNetworks {
		cleanNetworks
	}
`;

export const NETWORK_CREATE_PROJECTION = gql`
	mutation createNetwork($name: String!, $driver: String!, $subnet: String) {
		createNetwork(name: $name, driver: $driver, subnet: $subnet)
	}
`;
