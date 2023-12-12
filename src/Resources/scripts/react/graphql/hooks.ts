import {
	ApolloClient,
	ApolloQueryResult,
	DocumentNode,
	FetchResult,
	useApolloClient
} from '@apollo/client';
import { useEffect, useState } from 'react';
import { ApolloExtendedError } from '../components/Core/ApolloExtendedError';

export const useGraphqlProjection = (props: {
	query?: DocumentNode;
	mutation?: DocumentNode;
	load: boolean;
	variables?: object;
	resetStore?: boolean;
}) => {
	// FIX ME: conditionally hooks are not supported in react
	const client = useApolloClient();
	const [state, setState] = useState<{
		loading: boolean;
		error: ApolloExtendedError;
		data: any;
		client: ApolloClient<object>;
	}>({
		loading: false,
		error: null,
		data: null,
		client
	});

	const setResult = (
		result: ApolloExtendedError | ApolloQueryResult<any> | FetchResult<any>
	) => {
		if (result instanceof ApolloExtendedError) {
			const error = new ApolloExtendedError(result);
			setState({
				...state,
				loading: false,
				error,
				data: null
			});
			return;
		}

		setState({
			...state,
			loading: false,
			error: null,
			data: result.data
		});
	};

	useEffect(() => {
		if (props.load) {
			setState({
				...state,
				loading: true,
				error: null,
				data: null
			});

			if (props.resetStore) {
				(async () => {
					await client.resetStore();
				})();
			}

			if (props.query) {
				client
					.query({
						query: props.query,
						variables: props.variables
					})
					.then((result) => {
						setResult(result);
					})
					.catch((e: ApolloExtendedError) => {
						setResult(e);
					});
				return;
			}

			if (props.mutation) {
				client
					.mutate({
						mutation: props.mutation,
						variables: props.variables
					})
					.then((result) => {
						setResult(result);
					})
					.catch((e: ApolloExtendedError) => {
						setResult(e);
					});
			}
		}
	}, [props.load]);

	return state;
};
