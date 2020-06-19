import React, { useState } from "react";
import { SynSet } from "../types";

const Tree = ({ tree }: { tree: SynSet }) => {
	const [expanded, setExpanded] = useState(false);

	const expand = () => {
		setExpanded(true);
	};

	const collapse = () => {
		setExpanded(false);
	};

	return (
		<ul>
			<li>
				{tree.name} ({tree.size}){" "}
				{tree.children!.length > 0 && (
					<span className="expander" onClick={expanded ? collapse : expand}>
						{expanded ? "-" : "+"}
					</span>
				)}
			</li>
			{tree.children!.length > 0 && expanded && (
				<li>
					<ul>
						{tree.children?.map(child => {
							return <Tree tree={child} key={child.name} />;
						})}
					</ul>
				</li>
			)}
		</ul>
	);
};

export default Tree;
