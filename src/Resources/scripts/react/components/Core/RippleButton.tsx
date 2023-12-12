import {
	ButtonHTMLAttributes,
	PropsWithChildren,
	RefObject,
	useRef
} from 'react';
import classnames from "classnames";

export type ButtonProps = PropsWithChildren & ButtonHTMLAttributes<any>;

export const RippleButton = (props: ButtonProps) => {
	const ref: RefObject<HTMLButtonElement> = useRef();
	const className = classnames('btn btn-sm', props.className?.split(' '));

	return (
		<button
			ref={ref}
			{...props}
			className={className}
			onClick={function (evt) {
				let ripple: HTMLElement = ref.current.querySelector('.ripple');
				if (!ripple) {
					const button = evt.currentTarget;
					const scale = button.offsetWidth;
					const x = evt.pageX - button.getBoundingClientRect().left;
					const y = evt.pageY - button.getBoundingClientRect().top;
					ripple = document.createElement('span');
					ripple.style.left = `${x}px`;
					ripple.style.top = `${y}px`;
					button.appendChild(ripple);
					// @ts-expect-error: scale is used as integer value here, setProperty does not allow this
					ripple.style.setProperty('--scale', scale);

					ripple.onanimationend = () => {
						ref.current.removeChild(ripple);
						if (typeof props.onClick === 'function') {
							props.onClick(evt);
						}
					};

					ripple.classList.add('ripple');
				}
			}}
		>
			{props.children}
		</button>
	);
};
