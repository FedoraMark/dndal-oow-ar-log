import React from 'react';
import _map from "lodash/map";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
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

    setShowAddRecordArea = (newState) => {
    	this.setState({showAddRecordArea: newState});
    }


    //RENDERERS
    render_gameLogs = () => {
    	if (this.state.charData.games.length === 0) {
    		return (
    			<Container className="gameList">
    				{this.render_newRecordArea({})}
    			</Container>
    		)
    	}

        return (
            <Container className="gameList">
				{_map(this.state.charData, (gameObj, key) => {
					let delayTime = 200;
					return (
						<>
							<GameLog className={fadeInUp} style={{animationDelay: (delayTime*key)+"ms"}} key={key} data={gameObj} isCollapsed={true} />
				    		{key === games_oow.records.length-1 && this.render_newRecordArea({animationDelay: (delayTime*(key+1))+"ms"})}
						</>
					);
				})}
			</Container>
        );
    }

    render_newRecordArea = (btnStyle) => {
    	return (
    		<>
    			{!this.state.showAddRecordArea && 
    				<Button className={"newButton " + fadeInUp} style={btnStyle} variant="light" size="lg" block onClick={this.setShowAddRecordArea.bind(this,true)}>Add Record</Button>
    			}

	    		<Collapse in={this.state.showAddRecordArea} mountOnEnter unmountOnExit>
		    		<Container className="addLogWrapper" as="ul">
		    			{_map(games_oow.records, (game, key) => {
		    				return (
		    					<li className="addItem" id={game.code}>
		    						<Summary gameData={game} />
		    					</li>
		    				);
		    			})}
		    		</Container>
	    		</Collapse>
	    	</>
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

	    		{this.render_gameLogs()}

	    		<Jumbotron className="footer" />
	    	</div>
        );
    }
}

export default AdvRecordLog;