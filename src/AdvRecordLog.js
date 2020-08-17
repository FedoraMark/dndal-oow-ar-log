import React from 'react';
import classnames from 'classnames';
import _map from "lodash/map";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';

import Player from './common/Player';
import GameLog from './GameLog';
import Summary from './common/Summary';

import "animate.css";
import './AdvRecordLog.scss';

import chara_SamPel from "./data/SamPel.json";
import games_oow from "./data/oowGames.json";

const fadeInUp = "animate__animated animate__fadeInUp";

class AdvRecordLog extends React.Component {
    state = {
        charData: {games: []},
        showAddRecordArea: false
    };


    //FUNCTIONS

    toggleAddRecordArea = () => {
    	this.setState({showAddRecordArea: !this.state.showAddRecordArea});
    }


    //RENDERERS
    render_gameLogs = () => {
    	if (this.state.charData.games.length !== 0) {
    		return (
    			<Container className="gameList">
    				{this.render_newRecordArea({})}
    			</Container>
    		)
    	}

        return (
            <Container className="gameList">
				{_map(games_oow.records, (gameObj, key) => {
					let delayTime = 200;
					return (
						<GameLog className={fadeInUp} style={{animationDelay: (delayTime*key)+"ms"}} key={key} data={gameObj} isCollapsed={true} />
					);
				})}
			</Container>
        );
    }

    render_newRecordArea = (btnStyle) => {
    	return (
    		<Container className="newRecordWrapper">
    			<Button className={classnames("newButton",fadeInUp, this.state.showAddRecordArea ? "isOpen" : '')} style={btnStyle} variant="light" size="lg" block onClick={this.toggleAddRecordArea.bind(this)}>
    				{!this.state.showAddRecordArea ? "Add Record" : "Cancel" }
    			</Button>

	    		<Collapse in={this.state.showAddRecordArea} mountOnEnter unmountOnExit>
		    		<div>
		    			<ul className="addLogWrapper">
			    			{_map(games_oow.records, (game, key) => {
			    				return (
			    					<li className="addItem" id={game.code}>
			    						<Summary gameData={game} />
			    					</li>
			    				);
			    			})}
		    			</ul>
		    		</div>
	    		</Collapse>
	    	</Container>
    	)
    }

    render() {

        return (
            <div className="log">
	    		<Jumbotron>
	    			<Container>
	    				<div className="titleBox">
							<h1>Eberron: Oracle of War</h1>
							<h2>Adventure Records Log</h2>
						</div>
	    			</Container>
	    		</Jumbotron>

	    		<Container>
	    			<Player
		    			player={chara_SamPel.player}
		    			dci={chara_SamPel.dci}
		    			character={chara_SamPel.character}
		    			classes={chara_SamPel.classes}
		    			tier={chara_SamPel.tier}
		    			base={chara_SamPel.base}
		    			wealth={chara_SamPel.wealth}
		    		/>
		    	</Container>

		    	{this.render_newRecordArea()}

	    		{this.render_gameLogs()}

	    		<Jumbotron className="footer" />
	    	</div>
        );
    }
}

export default AdvRecordLog;