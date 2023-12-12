import { ApolloError } from '@apollo/client';

export class ApolloExtendedError extends ApolloError {
	public name = 'ApolloExtendedError';

	constructor(opts: ApolloError) {
		super(opts);

		let message: any = this.message;
		// @ts-expect-error: child object is defined here
		if (opts.networkError?.result?.errors?.length) {
			// @ts-expect-error: child object is defined here
			message = `${opts.networkError.response.statusText}: ${opts.networkError?.result?.errors[0].message}`;
		}
		if (this.graphQLErrors?.length) {
			message = opts.graphQLErrors[0].extensions?.debugMessage;
		}

		this.message = message;
	}
}
