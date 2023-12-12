import React, { PropsWithChildren, useState } from 'react';

export const AppCtx = React.createContext({
	value: null,
	setValue: (_value) => {}
});

export const ApplicationContext = (props: PropsWithChildren) => {
	const [value, setValue] = useState();
	return (
		<AppCtx.Provider value={{ value, setValue }}>
			{props.children}
		</AppCtx.Provider>
	);
};
