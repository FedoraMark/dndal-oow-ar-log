import React from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { ToastProvider } from "react-toast-notifications";
import AdvRecordLog from "AdvRecordLog";

import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";

ReactDOM.render(
    <React.StrictMode>
		<Router>
			<Switch>
				<Route path="/log">
					<Log />
				</Route>
				<Route path="/">
					<Log />
				</Route>
			</Switch>
		</Router>
	</React.StrictMode>,
    document.getElementById("root")
);

// function Home() {} // TO BE DONE

function Log() {
    return (
        <ToastProvider autoDismiss autoDismissTimeout="3000">
			<AdvRecordLog />
		</ToastProvider>
    );
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();