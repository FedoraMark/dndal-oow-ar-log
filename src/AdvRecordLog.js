import React from 'react';
import GameLog from './GameLog';
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import _map from "lodash/map";

import Player from './common/Player';
import Wealth from './common/Wealth';

import './AdvRecordLog.scss';

import chara_SamPel from "./data/SamPel.json";
import games_oow from "./data/oowGames.json";

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

    render_gameLogs = (gameList) => {
        return (
            <Container className="gameList">
				{/* {_map(this.state.charData.games, (gameObj, key) => { */}
				{/* 	return <GameLog key={key} data={gameObj} isCollapsed={true} /> */}
				{/* })} */}

				{_map(games_oow.records, (gameObj, key) => {
					return <GameLog key={key} data={gameObj} isCollapsed={key !== games_oow.records.length-1} />
				})}
			</Container>
        );
    }

    render() {
        return (
            <div className="log">
	    		<Jumbotron><Container>{this.render_pageInfo()}</Container></Jumbotron>
	    		<Container>
	    			<Player
		    			player={this.state.charData.player}
		    			dci={this.state.charData.dci}
		    			character={this.state.charData.character}
		    			classes={this.state.charData.classes}
		    			tier={this.state.charData.tier}
		    			base={this.state.charData.base}
		    			wealth={this.state.charData.wealth}
		    		/>
		    	</Container>
	    		{this.render_gameLogs(this.state.charData.games)}

	    		<Jumbotron className="footer" />
	    	</div>
        );
    }
}

export default AdvRecordLog;