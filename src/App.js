import React, { Component } from "react";
import { HashRouter, Route, Link } from "react-router-dom";
import AdvRecordLog from "AdvRecordLog";
import { ToastProvider } from "react-toast-notifications";

class App extends Component {
    render() {
        return (
            <HashRouter basename="/log">
				<Route path="/" component={Log} exact />
				<Route path="/log" component={Log} />
			</HashRouter>
        );
    }
}

const Log = () => <ToastProvider autoDismiss autoDismissTimeout="3000"><AdvRecordLog /></ToastProvider>


export default App;