import React from 'react';
import GameLog from './GameLog';
import _map from "lodash/map";

import './AdvRecordLog.scss';
import chara_SamPel from "./data/SamPel.json";

class AdvRecordLog extends React.Component {
	state = {
		charData: chara_SamPel
	};

	//FUNCTIONS
	parseArray = (array) => {
		console.log(array);
		
		{_map(array, item => {
			return <p>{item}</p>
		})}
	}

	//RENDERERS
	render_pageInfo = () => {
		return (
			<div className="titleBox">
				<h1>Eberron: Oracle of War</h1>
				<h2>Adventure Records Log</h2>
			</div>
		);
	}

	render_playerInfo = (data) => {
		return (
			<div className="playerBox">
				<div>
					<h1>Player Name:</h1>
					<p>{data.player}</p>
				</div>
				<div>
					<h1>Character Name:</h1>
					<p>{data.character}</p>
				</div>
				<div>
					<h1>Classes & Levels:</h1>
					{this.parseArray(data.classes)}
				</div>
				<div>
					<h1>Current Wealth:</h1>
					{this.parseArray(data.wealth)}
				</div>
			</div>
		);
	}

	render_gameLogs = (gameList) => {
		return (
			<div className="gameList">
				{_map(gameList, gameObj => {
					return <GameLog data={gameObj} />
				})}
			</div>
		);
	}

	render() {
		console.log(this.state.charData);

	  	return (
	    	<div className="log">
	    		{this.render_pageInfo()}
	    		{this.render_playerInfo(this.state.charData)}
	    		{this.render_gameLogs(this.state.charData.games)}
	    	</div>
	  	);
	}
}

export default AdvRecordLog;
