import dayjs from 'dayjs';
import { uniqueId } from '../../../../utils';

export const ContainerLogsView = (props: { data: any }) => {
	return (
		<table className={'table data-table bordered'}>
			<tbody>
				{props.data.map((log) => {
					return (
						<tr key={uniqueId()}>
							<td className={'small'}>
								{dayjs(log.t.$date).format(
									'YYYY-MM-DD HH:mm:ss'
								)}
							</td>
							<td className={'small'}>{log.msg}</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};
