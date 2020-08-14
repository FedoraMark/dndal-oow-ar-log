import React from 'react';
import PropTypes from 'prop-types';
import _map from "lodash/map";

import "./Wealth.scss";

class Wealth extends React.Component {

	static propTypes = {
		wealthObj: PropTypes.object.isRequired,
	}

	state = {
		pp: this.props.wealthObj.pp === undefined ? 0 : this.props.wealthObj.pp,
		gp: this.props.wealthObj.gp === undefined ? 0 : this.props.wealthObj.gp,
		ep: this.props.wealthObj.ep === undefined ? 0 : this.props.wealthObj.ep,
		sp: this.props.wealthObj.sp === undefined ? 0 : this.props.wealthObj.sp,
		cp: this.props.wealthObj.cp === undefined ? 0 : this.props.wealthObj.cp,
	}

	render() {
		const {wealthObj} = this.props;

		if (this.state.pp === 0 && this.state.gp === 0 && this.state.ep === 0 && this.state.sp === 0 && this.state.cp === 0) {
			return (
				<span className="money">{this.state.gp}gp</span>
			);
		}

	  	return (
	    	<span className="money">
				{this.state.pp > 0 && <>{this.state.pp}pp<span className="comma">, </span></>}
				{this.state.gp > 0 && <>{this.state.gp}gp<span className="comma">, </span></>}
				{this.state.ep > 0 && <>{this.state.ep}ep<span className="comma">, </span></>}
				{this.state.sp > 0 && <>{this.state.sp}sp<span className="comma">, </span></>}
				{this.state.cp > 0 && <>{this.state.cp}cp<span className="comma">, </span></>}
			</span>
	  	);
	}
}

export default Wealth;
