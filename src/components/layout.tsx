import React from "react";
import Navbar from "./navbar";

type Props = {
	children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
	return (
		<div className="d-flex flex-column">
			<div id="content">
				<Navbar />
				<div className="container  mt-4">{children}</div>
			</div>
		</div>
	);
};

export default Layout;
