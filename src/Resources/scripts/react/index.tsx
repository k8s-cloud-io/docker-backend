import ReactDOM from 'react-dom/client';
import '../../sass/app.scss';
import { Page } from './components';
import { ApplicationContext } from './contexts';
import { ApolloProvider } from './graphql';

const Application = () => {
	return (
		<ApolloProvider>
			<ApplicationContext>
				<Page />
			</ApplicationContext>
		</ApolloProvider>
	);
};

const root = ReactDOM.createRoot(document.querySelector('#app-root'));
root.render(<Application />);
