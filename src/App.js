import React, { Component } from "react";
import { HashRouter, Route } from "react-router-dom";
import AdvRecordLog from "AdvRecordLog";
import { ToastProvider } from "react-toast-notifications";

class App extends Component {
    render() {
        return (
            <HashRouter basename={'/'}>
				<Route path="/" component={Log} exact />
			</HashRouter>
        );
    }
}

const Log = () => <ToastProvider autoDismiss autoDismissTimeout="3000"><AdvRecordLog /></ToastProvider>


export default App;