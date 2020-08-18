import React from 'react';
import classnames from 'classnames';
import _map from "lodash/map";
import _findIndex from "lodash/findIndex";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card';

import Player from './common/Player';
import GameLog from './GameLog';
import Summary from './common/Summary';

import "animate.css";
import './AdvRecordLog.scss';

import games_oow from "./data/oowGames.json";
import chara_SamPel from "./data/SamPel.json";


const fadeInUp = "animate__animated animate__fadeInUp";
const fadeIn = "animate__animated animate__fadeIn";

class AdvRecordLog extends React.Component {
    state = {
        charData: {player: {character: "Sam Pel", tier: 1, wealth: {}}, games: []},
        showAddRecordArea: false,
        loaded: false
    };

    componentDidMount() {
    	this.setState({loaded: true});
    }

    //FUNCTIONS
    toggleAddRecordArea = () => {
    	this.setState({showAddRecordArea: !this.state.showAddRecordArea});
    }

    addRecord = (recordObj) => {
    	let newGameData = this.state.charData.games;
    	newGameData.push(recordObj)

    	this.setState({charData: {games: newGameData, ...this.state.charData}});
    	this.toggleAddRecordArea();
    }


    //RENDERERS
    render_gameLogs = () => {
        return (
            <Container className="gameList">
				{_map(this.state.charData.games, (gameObj, key) => {
					let delayTime = this.state.loaded ? 0 : 200;
					let animClass = this.state.loaded ? fadeIn : fadeInUp;

					return (
						<GameLog className={animClass} style={{animationDelay: (delayTime*key)+"ms"}} key={key} data={gameObj} isCollapsed={!this.state.loaded} />
					);
				})}
			</Container>
        );
    }

    render_newRecordArea = (btnStyle) => {
    	return (
    		<Container className="newRecordWrapper">
    			<Button className={classnames("newButton", this.state.showAddRecordArea ? "isOpen" : '')} style={btnStyle} variant="light" size="lg" block onClick={this.toggleAddRecordArea.bind(this)}>
    				{!this.state.showAddRecordArea ? "Add Record" : "Cancel" }
    			</Button>

	    		<Collapse in={this.state.showAddRecordArea} mountOnEnter unmountOnExit>
		    		<div>
		    			<ul className="addLogWrapper">
			    			{_map(games_oow.records, (game, key) => {

			    				return (
			    					<li key={key} className="addItem" id={game.code}>
			    						<Summary gameData={game} handleAdd={this.addRecord} disabled={_findIndex(this.state.charData.games, (o => {return o.code === game.code})) > -1} />
			    					</li>
			    				);
			    			})}

			    			<li className="addItem" id="newSalvage">
			    				<Card className="customItem disabled">
									<Card.Body>
										<Card.Title>Salvage Mission</Card.Title>
										<Card.Subtitle>Salvage mission log</Card.Subtitle>
									</Card.Body>
								</Card>
			    			</li>

			    			<li className="addItem" id="newNotes">
			    				<Card className="customItem disabled">
									<Card.Body>
										<Card.Title>Notes</Card.Title>
										<Card.Subtitle>Player notes</Card.Subtitle>
									</Card.Body>
								</Card>
			    			</li>

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
	    			{/* <Player playerObj={this.state.charData.player} /> */}
	    			<Player playerObj={chara_SamPel.player} />
		    	</Container>

		    	{this.render_newRecordArea()}

	    		{this.render_gameLogs()}

	    		<Jumbotron className="footer" />
	    	</div>
        );
    }
}

export default AdvRecordLog;