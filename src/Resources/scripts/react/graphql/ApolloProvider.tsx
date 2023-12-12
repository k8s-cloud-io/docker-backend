import {
	ApolloClient,
	ApolloProvider as BaseProvider,
	InMemoryCache
} from '@apollo/client';
import { PropsWithChildren } from 'react';

export const ApolloProvider = (props: PropsWithChildren) => {
	const client = new ApolloClient({
		uri: '/api',
		cache: new InMemoryCache()
	});
	return <BaseProvider client={client}>{props.children}</BaseProvider>;
};
