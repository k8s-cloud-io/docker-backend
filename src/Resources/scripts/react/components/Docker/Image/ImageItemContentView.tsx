import dayjs from 'dayjs';
import { Fragment } from 'react';
import { uniqueId } from '../../../utils';

export const ImageItemContentView = (props: { item: any }) => {
	return (
		<>
			<h6>General</h6>
			{props.item['comment'] && <small>{props.item['comment']}</small>}
			<table className={`table data-table table-bordered`}>
				<tbody>
					<tr>
						<th className={'valign-middle bg-light'}>Created</th>
						<td className={'valign-middle'}>
							{dayjs(props.item['created']).format(
								'YYYY-MM-DD HH:mm:ss'
							)}
						</td>
					</tr>
					{props.item['author'] && (
						<tr>
							<th className={'valign-middle bg-light'}>Author</th>
							<td className={'valign-middle'}>
								{props.item['author'] || 'unknown'}
							</td>
						</tr>
					)}
					<tr>
						<th className={'valign-top bg-light'}>Exposed Ports</th>
						<td className={'valign-top'}>
							{Object.keys(
								props.item['config']['exposedPorts'] || {}
							).map((key) => {
								const conf = key.split(/\//);
								return (
									<div key={uniqueId()}>
										{conf[0]} ({conf[1]})
									</div>
								);
							})}
						</td>
					</tr>
					<tr>
						<th className={'valign-top bg-light'}>Environment</th>
						<td className={'valign-top'}>
							{props.item['config']['env'].map((env: string) => {
								return <div key={uniqueId()}>{env}</div>;
							})}
						</td>
					</tr>
					<tr>
						<th className={'valign-top bg-light'}>CMD</th>
						<td className={'valign-top'}>
							{props.item['config']['cmd'].map(
								(item: string, index: number) => {
									if (
										index <
										props.item['config']['cmd'].length - 1
									) {
										return (
											<Fragment key={uniqueId()}>
												<span>{item}</span>
												<br />
											</Fragment>
										);
									} else {
										return (
											<span key={uniqueId()}>{item}</span>
										);
									}
								}
							)}
						</td>
					</tr>
					{props.item['config']['entrypoint']?.length > 0 && (
						<tr>
							<th className={'valign-top bg-light'}>
								EntryPoint
							</th>
							<td className={'valign-top'}>
								{props.item['config']['entrypoint'].map(
									(key: string) => {
										return (
											<div key={uniqueId()}>{key}</div>
										);
									}
								)}
							</td>
						</tr>
					)}
					{Object.keys(props.item['config']['volumes'] || {}).length >
						0 && (
						<tr>
							<th className={'valign-top bg-light'}>Volumes</th>
							<td className={'valign-top'}>
								{Object.keys(
									props.item['config']['volumes']
								).map((key: string) => {
									return <div key={uniqueId()}>{key}</div>;
								})}
							</td>
						</tr>
					)}
					{Object.keys(props.item['config']['labels'] || {}).length >
						0 && (
						<tr>
							<th className={'valign-top bg-light'}>Labels</th>
							<td className={'valign-top'}>
								{Object.keys(
									props.item['config']['labels']
								).map((key: string) => {
									return (
										<div key={uniqueId()}>
											{key}:{' '}
											{
												props.item['config']['labels'][
													key
												]
											}
										</div>
									);
								})}
							</td>
						</tr>
					)}
				</tbody>
			</table>
			{props.item['config']['healthCheck'] && (
				<div className={'d-flex flex-column'}>
					<h6>Healthcheck Configuration</h6>
					<table className={'table data-table table-bordered'}>
						<tbody>
							<tr>
								<th className={'valign-middle'}>Test</th>
								<td className={'valign-middle'}>
									{props.item['healthCheck']['test'].map(
										(key) => {
											return <div>{key}</div>;
										}
									)}
								</td>
							</tr>
							<tr>
								<th className={'valign-middle'}>Interval</th>
								<td className={'valign-middle'}>
									{props.item['healthCheck']['interval']}
								</td>
							</tr>
							<tr>
								<th className={'valign-middle'}>Timeout</th>
								<td className={'valign-middle'}>
									{props.item['healthCheck']['timeout']}
								</td>
							</tr>
							<tr>
								<th className={'valign-middle'}>Retries</th>
								<td className={'valign-middle'}>
									{props.item['healthCheck']['retries']}
								</td>
							</tr>
							<tr>
								<th className={'valign-middle'}>
									Start Period
								</th>
								<td className={'valign-middle'}>
									{props.item['healthCheck']['startPeriod']}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			)}
		</>
	);
};
