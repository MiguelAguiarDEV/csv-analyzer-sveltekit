export interface GeminaiRequest {
	prompt: string;
}

export interface GeminaiResult {
	content?: string;
	error?: string;
	status?: number;
}
