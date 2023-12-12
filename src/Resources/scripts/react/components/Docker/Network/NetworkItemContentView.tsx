import dayjs from 'dayjs';
import { uniqueId } from '../../../utils';
import { MaterialIcon } from '../../Core';

export const NetworkItemContentView = (props: { item: any }) => {
	return (
		<>
			<h6>General</h6>
			<table className={`table data-table table-bordered w-100`}>
				<tbody>
					<tr>
						<th className={'valign-middle bg-light w-50'}>ID</th>
						<td className={'valign-middle w-50'}>
							<span className={'d-inline-block text-truncate'}>
								{props.item['id']}
							</span>
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Created
						</th>
						<td className={'valign-middle'}>
							{dayjs(props.item['created']).format(
								'YYYY-MM-DD HH:mm:ss'
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							In Use
						</th>
						<td className={'valign-middle'}>
							{Object.keys(props.item['containers'] || {})
								.length > 0 ? (
								<MaterialIcon className={'text-success'}>
									done
								</MaterialIcon>
							) : (
								<MaterialIcon className={'text-light'}>
									close
								</MaterialIcon>
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Driver
						</th>
						<td className={'valign-middle'}>
							{props.item['driver']}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>Scope</th>
						<td className={'valign-middle'}>
							{props.item['scope']}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Enable IPv6
						</th>
						<td className={'valign-middle'}>
							{props.item['enableIPv6'] ? (
								<MaterialIcon className={'text-success'}>
									done
								</MaterialIcon>
							) : (
								<MaterialIcon className={'text-light'}>
									close
								</MaterialIcon>
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Internal
						</th>
						<td className={'valign-middle'}>
							{props.item['internal'] ? (
								<MaterialIcon className={'text-success'}>
									done
								</MaterialIcon>
							) : (
								<MaterialIcon className={'text-light'}>
									close
								</MaterialIcon>
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Attachable
						</th>
						<td className={'valign-middle'}>
							{props.item['attachable'] ? (
								<MaterialIcon className={'text-success'}>
									done
								</MaterialIcon>
							) : (
								<MaterialIcon className={'text-light'}>
									close
								</MaterialIcon>
							)}
						</td>
					</tr>
					<tr>
						<th className={'valign-middle bg-light w-50'}>
							Ingress
						</th>
						<td className={'valign-middle'}>
							{props.item['ingress'] ? (
								<MaterialIcon className={'text-success'}>
									done
								</MaterialIcon>
							) : (
								<MaterialIcon className={'text-light'}>
									close
								</MaterialIcon>
							)}
						</td>
					</tr>
					{Object.keys(props.item['labels'] || {})?.length > 0 && (
						<tr>
							<th className={'valign-top bg-light w-50'}>
								Labels
							</th>
							<td className={'valign-top'}>
								{Object.keys(props.item['labels']).map(
									(key: string) => {
										return (
											<div key={uniqueId()}>
												{key}:{' '}
												{props.item['labels'][key]}
											</div>
										);
									}
								)}
							</td>
						</tr>
					)}
				</tbody>
			</table>
			{(props.item['iPAM']['driver'] ||
				props.item['iPAM']['config']?.length ||
				Object.keys(props.item['iPAM']['options'] || {})?.length >
					0) && (
				<>
					<h6>IPAM Configuration</h6>
					<table className={'table data-table table-bordered w-100'}>
						<tbody>
							{props.item['iPAM']['driver'] && (
								<tr>
									<th className={'valign-middle bg-light'}>
										Driver
									</th>
									<td className={'valign-middle'}>
										{props.item['iPAM']['driver']}
									</td>
								</tr>
							)}
							{props.item['iPAM']['config']?.length > 0 && (
								<tr>
									<th className={'valign-top bg-light'}>
										Networks
									</th>
									<td className={'valign-top'}>
										<table className={'w-100'}>
											<thead>
												<tr>
													<th
														className={
															'pt-0 pb-0 bg-none'
														}
													>
														Subnet
													</th>
													<th
														className={
															'pt-0 pb-0 bg-none'
														}
													>
														Gateway
													</th>
												</tr>
											</thead>
											<tbody>
												{props.item['iPAM'][
													'config'
												].map((item) => {
													return (
														<tr key={uniqueId()}>
															<td>
																{item['subnet']}
															</td>
															<td>
																{
																	item[
																		'gateway'
																	]
																}
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</td>
								</tr>
							)}
							{Object.keys(props.item['iPAM']['options'] || {})
								.length > 0 && (
								<tr>
									<th className={'valign-top bg-light'}>
										Options
									</th>
									<td className={'valign-top'}>
										<table className={'w-100'}>
											<tbody>
												{Object.keys(
													props.item['iPAM'][
														'options'
													]
												).map((key) => {
													return (
														<tr key={uniqueId()}>
															<th>{key}</th>
														</tr>
													);
												})}
											</tbody>
										</table>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</>
			)}
			{props.item['options'] && (
				<>
					<h6>Options</h6>
					<table className={'table data-table table-bordered'}>
						<tbody>
							{Object.keys(props.item['options']).map(
								(key: string) => {
									return (
										<tr key={uniqueId()}>
											<th
												className={
													'valign-middle bg-light'
												}
											>
												{key}
											</th>
											<td className={'valign-middle'}>
												{props.item['options'][key]}
											</td>
										</tr>
									);
								}
							)}
						</tbody>
					</table>
				</>
			)}
		</>
	);
};
