import { useApolloClient } from '@apollo/client';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Offcanvas } from 'react-bootstrap';
import { NETWORK_CREATE_PROJECTION } from '../../../graphql';
import { FormRow, RippleButton, TextInput } from '../../Core';

export const NetworkCreateView = ({ show, onHide, onCreated }) => {
	const apolloClient = useApolloClient();
	const nameRef: RefObject<HTMLInputElement> = useRef();
	const driverRef: RefObject<HTMLSelectElement> = useRef();
	const subnetTypeRef: RefObject<HTMLSelectElement> = useRef();
	const subnetSizeRef: RefObject<HTMLSelectElement> = useRef();
	const octet1Ref: RefObject<HTMLInputElement> = useRef();
	const octet2Ref: RefObject<HTMLInputElement> = useRef();
	const octet3Ref: RefObject<HTMLInputElement> = useRef();
	const octet4Ref: RefObject<HTMLInputElement> = useRef();
	const [subnetType, setSubnetType] = useState('auto');
	const [currentSubnet, setCurrentSubnet] = useState(null);
	const createNetwork = () => {
		const subnet = `${parseInt(octet1Ref.current?.value)}.${parseInt(
			octet2Ref.current?.value
		)}.${parseInt(octet3Ref.current?.value)}.${parseInt(
			octet4Ref.current?.value
		)}/${parseInt(subnetSizeRef.current?.value)}`;

		const variables = {
			name: nameRef?.current?.value,
			driver: driverRef.current.value,
			subnet: subnetType === 'manual' ? subnet : null
		}

		apolloClient
			.mutate({
				mutation: NETWORK_CREATE_PROJECTION,
				variables
			})
			.then(() => onCreated());
	};

	const updateCidrRange = () => {
		const octets = `${parseInt(octet1Ref.current?.value)}.${parseInt(
			octet2Ref.current?.value
		)}.${parseInt(octet3Ref.current?.value)}.${parseInt(
			octet4Ref.current?.value
		)}/${parseInt(subnetSizeRef.current?.value)}`;
		setCurrentSubnet(calculateCidrRange(octets));
	};

	const validateInteger = (event: any) => {
		let value = parseInt(event.currentTarget.value?.trim());
		if (value < 0) value = 0;
		if (value > 255) value = 255;

		if (Number.isNaN(value)) value = 0;
		event.currentTarget.value = value;
		updateCidrRange();
	};

	const intToIp4 = (int) =>
		[
			(int >>> 24) & 0xff,
			(int >>> 16) & 0xff,
			(int >>> 8) & 0xff,
			int & 0xff
		].join('.');

	const ip4ToInt = (ip) =>
		ip
			.split('.')
			.reduce((int, oct) => (int << 8) + parseInt(oct, 10), 0) >>> 0;

	const calculateCidrRange = (cidr) => {
		const [range, bits = 32] = cidr.split('/');
		const mask = ~(2 ** (32 - bits) - 1);
		return [
			intToIp4(ip4ToInt(range) & mask),
			intToIp4(ip4ToInt(range) | ~mask)
		];
	};

	const CIDR_BLOCKS = [];
	for (let i = 1; i < 33; i++) {
		CIDR_BLOCKS.push(i);
	}

	return (
		<Offcanvas placement={'end'} show={show} onHide={onHide} onShow={() => {
			setSubnetType('auto');
			setCurrentSubnet(null);
		}}>
			<Offcanvas.Header closeButton>
				<Offcanvas.Title>Create Network</Offcanvas.Title>
			</Offcanvas.Header>
			<Offcanvas.Body>
				<form>
					<FormRow label={'Name'}>
						<TextInput ref={nameRef} />
					</FormRow>
					<FormRow label={'Driver'}>
						<select
							ref={driverRef}
							className={
								'form-control form-control-sm form-select fs-6'
							}
						>
							<option value={'bridge'}>bridge</option>
							<option value={'host'}>host</option>
							<option value={'overlay'}>overlay</option>
							<option value={'macvlan'}>macvlan</option>
							<option value={'null'}>null</option>
						</select>
					</FormRow>
					<FormRow label={'Subnet'}>
						<select
							onChange={(event) => {
								const type = event.currentTarget.value;
								setSubnetType(type);
								if( type === 'manual' )
									setCurrentSubnet(calculateCidrRange('0.0.0.0/32'));
								else
									setCurrentSubnet(null);
							}}
							ref={subnetTypeRef}
							defaultValue={'auto'}
							className={
								'form-control form-control-sm form-select fs-6'
							}
						>
							<option value={'auto'}>automatic</option>
							<option value={'manual'}>manual</option>
						</select>
					</FormRow>
					{subnetType === 'manual' && (
						<div className={'d-flex flex-column'}>
							<h6>IP Range</h6>
							<FormRow label={'CIDR'}>
								<div
									className={
										'd-flex flex-row align-items-end'
									}
								>
									<TextInput
										ref={octet1Ref}
										onChange={validateInteger}
										defaultValue={0}
										maxLength={3}
										className={'me-2'}
									/>
									<span className={'d-flex me-2'}>.</span>
									<TextInput
										ref={octet2Ref}
										onChange={validateInteger}
										defaultValue={0}
										maxLength={3}
										className={'me-2'}
									/>
									<span className={'d-flex me-2'}>.</span>
									<TextInput
										ref={octet3Ref}
										onChange={validateInteger}
										defaultValue={0}
										className={'me-2'}
										maxLength={3}
									/>
									<span className={'d-flex me-2'}>.</span>
									<TextInput
										ref={octet4Ref}
										onChange={validateInteger}
										defaultValue={0}
										className={'me-2'}
										maxLength={3}
									/>
									<span className={'d-flex me-2'}>/</span>
									<select
										ref={subnetSizeRef}
										onChange={updateCidrRange}
										defaultValue={32}
										className={
											'form-control form-control-sm form-select'
										}
									>
										{CIDR_BLOCKS.map((key) => {
											return (
												<option
													key={`range-${key}`}
													value={key}
												>
													{key}
												</option>
											);
										})}
									</select>
								</div>
							</FormRow>
							{
								currentSubnet &&
								<div className={'row mb-3'}>
									<label className={'form-label'}>
										Calculated IP Range
									</label>
									<div>
										{currentSubnet[0]} - {currentSubnet[1]}
									</div>
								</div>
							}
						</div>
					)}
				</form>
				<div className={'d-flex flex-row'}>
					<span className={'flex-grow'} />
					<RippleButton
						className={'btn-primary'}
						onClick={createNetwork}
					>
						Save
					</RippleButton>
				</div>
			</Offcanvas.Body>
		</Offcanvas>
	);
};
