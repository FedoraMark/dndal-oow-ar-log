import React from 'react';
import _map from "lodash/map";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Button from 'react-bootstrap/Button';

import Player from './common/Player';
import GameLog from './GameLog';

import "animate.css";
import './AdvRecordLog.scss';

import chara_SamPel from "./data/SamPel.json";
import games_oow from "./data/oowGames.json";

const fadeInUp = "animate__animated animate__fadeInUp";

class AdvRecordLog extends React.Component {
    state = {
        charData: {games: []}
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

    render_gameLogs = () => {
    	// if (this.state.charData.games.length === 0) {
    	// 	return (
    	// 		<Container className="gameList">
    	// 			<Button className={"newButton " + fadeInUp} variant="light" size="lg" block>Add Record</Button>
    	// 		</Container>
    	// 	)
    	// }

        return (
            <Container className="gameList">
				{_map(games_oow.records, (gameObj, key) => {
					let delayTime = 200;
					return (
						<>
							<GameLog className={fadeInUp} style={{animationDelay: (delayTime*key)+"ms"}} key={key} data={gameObj} isCollapsed={true} />
				    		{key === games_oow.records.length-1 && 
				    			<Button className={"newButton " + fadeInUp} style={{animationDelay: (delayTime*(key+1))+"ms"}} variant="light" size="lg" block>Add Record</Button>
				    		}
						</>
					);
				})}
			</Container>
        );
    }

    render() {


        return (
            <div className="log">
	    		<Jumbotron>
	    			<Container>{this.render_pageInfo()}</Container>
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