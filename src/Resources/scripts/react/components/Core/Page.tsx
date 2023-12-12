import { useContext } from 'react';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { AppCtx } from '../../contexts';
import {
	ContainerListView,
	ImageListView,
	NetworkListView,
	ServiceListView,
	VolumeListView
} from '../Docker';
import { ContainerView } from '../Docker/Container/ContainerView';
import { NavBar } from './NavBar';

export const Page = () => {
	const ctx = useContext(AppCtx);
	return (
		<div className={'container-fluid m-0 p-0 d-flex flex-column'}>
			<NavBar />
			<div
				className={
					'container-fluid d-flex flex-row align-items-center pt-2 pb-2 border-bottom'
				}
			>
				<h3 className={'m-0 p-0'}>{ctx.value}</h3>
			</div>
			<div className={'container-fluid m-0 p-0 d-flex flex-row'}>
				<BrowserRouter>
					<ul className={'nav d-flex flex-column navigation'}>
						<li className={'nav-item'}>
							<NavLink to={'/images'} className={'nav-link'}>
								Images
							</NavLink>
						</li>
						<li className={'nav-item'}>
							<NavLink to={'/containers'} className={'nav-link'}>
								Containers
							</NavLink>
						</li>
						<li className={'nav-item'}>
							<NavLink to={'/networks'} className={'nav-link'}>
								Networks
							</NavLink>
						</li>
						<li className={'nav-item'}>
							<NavLink to={'/volumes'} className={'nav-link'}>
								Volumes
							</NavLink>
						</li>
						<li className={'nav-item'}>
							<NavLink to={'/services'} className={'nav-link'}>
								Services
							</NavLink>
						</li>
					</ul>
					<Routes>
						<Route path={'/images'} element={<ImageListView />} />
						<Route
							path={'/containers/:param/general'}
							element={<ContainerView tab={'general'} />}
						/>
						<Route
							path={'/containers/:param/networks'}
							element={<ContainerView tab={'networks'} />}
						/>
						<Route
							path={'/containers/:param/environment'}
							element={<ContainerView tab={'environment'} />}
						/>
						<Route
							path={'/containers/:param/logs'}
							element={<ContainerView tab={'logs'} />}
						/>
						<Route
							path={'/containers/:param'}
							element={<ContainerView tab={'general'} />}
						/>
						<Route
							path={'/containers'}
							element={<ContainerListView />}
						/>
						<Route
							path={'/networks'}
							element={<NetworkListView />}
						/>
						<Route path={'/volumes'} element={<VolumeListView />} />
						<Route
							path={'/services'}
							element={<ServiceListView />}
						/>
					</Routes>
				</BrowserRouter>
			</div>
		</div>
	);
};
