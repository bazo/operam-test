import React from "react";

interface Props {
	loading?: boolean;
	complete?: number;
}

const ProgressBar = ({ loading = false, complete = 100 }: Props) => {
	return (
		<>
			{loading && (
				<div className="progress  mt-4">
					<div
						className="progress-bar progress-bar-striped progress-bar-animated"
						role="progressbar"
						style={{ width: `${complete}%` }}
					></div>
				</div>
			)}
		</>
	);
};

export default ProgressBar;
