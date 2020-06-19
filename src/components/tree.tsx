import React, { useState } from "react";
import { SynSet } from "../types";

const Item = ({ tree }: { tree: SynSet }) => {
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
							return <Item tree={child} key={child.name} />;
						})}
					</ul>
				</li>
			)}
		</ul>
	);
};

const Tree = ({ tree }: { tree: SynSet }) => {
	console.log(tree);
	return <Item tree={tree} />;
};

export default Tree;
