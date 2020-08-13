import React from 'react';
import GameLog from './GameLog';
import _map from "lodash/map";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";

import './AdvRecordLog.scss';
import chara_SamPel from "./data/SamPel.json";

class AdvRecordLog extends React.Component {
	state = {
		charData: chara_SamPel
	};
	

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
			<Container fluid className="playerBox">
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
					<p>
						{_map(data.classes, (level, clss) => {
							return(
								<span className="block" key={clss}>{clss + " (" + level + ")"}</span>
							);
						})}
					</p>
				</div>
				<div>
					<h1>Tier:</h1>
					<p>{data.tier}</p>
				</div>
				{"base" in data &&
					<div>
						<h1>Assigned Base:</h1>
						<p>{data.base}</p>
					</div>
				}
				<div>
					<h1>Current Wealth:</h1>
					<p>
						{_map(data.wealth, (amount, denom) => {
							return(
								<span className="money" key={denom}>
									<span>{amount + denom}</span><span className="comma">, </span>
								</span>
							);
						})}
					</p>
				</div>
			</Container>
		);
	}

	render_gameLogs = (gameList) => {
		return (
			<Container className="gameList">
				{_map(gameList, (gameObj, key) => {
					return <GameLog key={key} data={gameObj} />
				})}
			</Container>
		);
	}

	render() {
		console.log(this.state.charData);

	  	return (
	    	<div className="log">
	    		<Jumbotron>{this.render_pageInfo()}</Jumbotron>
	    		{this.render_playerInfo(this.state.charData)}
	    		{this.render_gameLogs(this.state.charData.games)}
	    	</div>
	  	);
	}
}

export default AdvRecordLog;
