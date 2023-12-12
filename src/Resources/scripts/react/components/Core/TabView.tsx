import { NavLink } from 'react-router-dom';
import { uniqueId } from '../../utils';

export type TabViewItem = {
	title: string;
	target: string;
	name: string;
};

export type TabViewProps = {
	tabs: Array<TabViewItem>;
	currentTab: string;
};

export const TabView = (props: TabViewProps) => {
	return (
		<div className={'tab-view'}>
			<ul className={'nav'}>
				{props.tabs.map((tab) => {
					return (
						<li
							key={uniqueId()}
							className={`nav-item ${
								props.currentTab === tab.name ? 'active' : ''
							}`}
						>
							<NavLink
								className={'nav-link ps-0 pe-0'}
								to={tab.target}
							>
								{tab.title}
							</NavLink>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
