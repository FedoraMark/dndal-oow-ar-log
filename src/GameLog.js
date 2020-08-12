import React from 'react';
import PropTypes from 'prop-types';

import './GameLog.scss';

class GameLog extends React.Component {
	static propTypes = {
		data: PropTypes.object
	}


	//RENDERERS
	render() {
		const {data} = this.props;

		console.log(data);

	  	return (
	    	<div className="gameBox">
	    		<h1 className="title">Adventure Record: <span>{data.code.split("-").join("–")}</span> {data.title}</h1>
	    	</div>
	  	)
	}
}

export default GameLog;