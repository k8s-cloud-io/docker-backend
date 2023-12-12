import { uniqueId } from '../../../../utils';
import { MaterialIcon } from '../../../Core';

export const ContainerEnvPartial = (props: {
	env: any;
	editable?: boolean;
	onEdit?: (item: any) => void;
	onDelete?: (item: any) => void;
}) => {
	return (
		<table className={'table data-table'}>
			<tbody>
				{props.env.map((item: any) => {
					const key = item.substring(0, item.indexOf('=')).trim();
					const val = item.substring(item.indexOf('=') + 1).trim();
					return (
						<tr key={uniqueId()}>
							<th className={'bg-light col-3'} key={uniqueId()}>
								{key}
							</th>
							<td className={'valign-middle'}>{val}</td>
							{props.editable && (
								<td>
									<MaterialIcon
										className={
											'fs-5 text-dark cursor-pointer'
										}
										onClick={() => {
											if (props.onEdit)
												props.onEdit(item);
										}}
									>
										edit
									</MaterialIcon>
								</td>
							)}
							{props.editable && (
								<td>
									<MaterialIcon
										className={
											'fs-5 text-danger cursor-pointer'
										}
										onClick={() => {
											if (props.onDelete)
												props.onDelete(item);
										}}
									>
										delete
									</MaterialIcon>
								</td>
							)}
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
