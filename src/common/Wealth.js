import React from 'react';
import PropTypes from 'prop-types';
import _map from "lodash/map";

class Wealth extends React.Component {

	static propTypes = {
		wealthObj: PropTypes.object.isRequired,
	}

	state = {
		pp: 0,
		gp: 0,
		ep: 0,
		sp: 0,
		cp: 0
	}

	render() {
		const {wealthObj} = this.props;

	  	return (
	    	<span className="wealthWrapper">
				{_map(wealthObj, (amount, denom) => {
					return(
						<span className="money" key={denom}>
							<span>{amount + denom}</span><span className="comma">, </span>
						</span>
					);
				})}
			</span>
	  	);
	}

}

export default Wealth;
