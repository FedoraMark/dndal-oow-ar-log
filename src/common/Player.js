import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Row from 'react-bootstrap/Row'
import _map from 'lodash/map';

import Wealth from "common/Wealth";

import "./Player.scss";

export class Player extends Component {
    static propTypes = {
        playerObj: PropTypes.object.isRequired
    }

    state = {
        player: this.props.playerObj.player,
        dci: this.props.playerObj.dci,
        character: this.props.playerObj.character,
        classes: this.props.playerObj.classes,
        tier: this.props.playerObj.tier,
        base: this.props.playerObj.base,
        wealth: this.props.playerObj.wealth
    }

    //FUNCTIONS
    getPlayerDciStr = () => {
    	var str = '';
        if (this.state.player !== undefined) {
            str = this.state.player;
            if (this.state.dci !== undefined) {
                str = str + " (" + this.state.dci + ")";
            }
        } else if (this.state.dci !== undefined) {
            str = this.state.dci;
        }

        return str;
    }

    //RENDERERS
    render() {
        return (
			<Row className="playerBox">
				<div className="infoItem">
					<h1>Character:</h1>
					<p>{this.state.character}</p>
				</div>

				{(this.state.player !== undefined || this.state.dci !== undefined) &&
					<div className="infoItem">
						<h1>Player:</h1>
						<p>{this.getPlayerDciStr()}</p>
					</div>
				}
			
				{this.state.classes !== undefined &&
					<div className="infoItem">
						<h1>Classes:</h1>
						<p>
							{_map(this.state.classes, (level, clss) => {
								return(
									<span className="class" key={clss}>{clss + " (" + level + ")"}<span className="comma">, </span></span>
								);
							})}
						</p>
					</div>
				}

				{this.state.tier !== undefined &&
					<div className="infoItem tierItem">
						<h1>Tier:</h1>
						<ul className="tierList">
							<li className={this.state.tier > 0 ? "filled": ''}>1</li>
							<li className={this.state.tier > 1 ? "filled": ''}>2</li>
							<li className={this.state.tier > 2 ? "filled": ''}>3</li>
							<li className={this.state.tier > 3 ? "filled": ''}>4</li>
						</ul>
						{/* <p>{this.state.tier}</p> */}
					</div>
				}
			
				{this.state.base !== undefined &&
					<div className="infoItem">
						<h1>Base:</h1>
						<p>{this.state.base}</p>
					</div>
				}

				{this.state.wealth !== undefined &&
					<div className="infoItem">
						<h1>Wealth:</h1>
						<p>
							<Wealth wealthObj={this.state.wealth} />
						</p>
					</div>
				}
			</Row>
        );
    }
}

export default Player;