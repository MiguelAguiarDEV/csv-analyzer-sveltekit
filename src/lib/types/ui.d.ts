export interface ButtonProps {
	loading?: boolean;
	disabled?: boolean;
	label?: string;
	onClick: () => void;
}

export interface ResultProps {
	result?: string;
	error?: string;
}
