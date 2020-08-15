import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import _map from 'lodash/map';

import Wealth from "./Wealth.js";

import "./Player.scss";

export class Player extends Component {
    static propTypes = {
        player: PropTypes.string,
        dci: PropTypes.string,
        character: PropTypes.string.isRequired,
        classes: PropTypes.object,
        tier: PropTypes.number,
        base: PropTypes.string,
        wealth: PropTypes.object
    }

    static defaultProps = {
        player: null,
        dci: null,
        classes: null,
        tier: null,
        base: null,
        wealth: null,
    }

    state = {
        player: this.props.player,
        dci: this.props.dci,
        character: this.props.character,
        classes: this.props.classes,
        tier: this.props.tier,
        base: this.props.base,
        wealth: this.props.wealth
    }

    //FUNCTIONS
    getPlayerDciStr = () => {
    	var str = '';
        if (this.state.player !== null) {
            str = this.state.player;
            if (this.state.dci !== null) {
                str = str + " (" + this.state.dci + ")";
            }
        } else if (this.state.dci !== null) {
            str = this.state.dci;
        }

        return str;
    }

    //RENDERERS
    render() {
        return (
            <Container fluid className="playerBox">
            	{(this.state.player !== null || this.state.dci !== null) &&
					<div>
						<h1>Player {this.state.player !== null ? "Name" : "DCI"}:</h1>
						<p>{this.getPlayerDciStr()}</p>
					</div>
				}

				<div>
					<h1>Character Name:</h1>
					<p>{this.state.character}</p>
				</div>

				{this.state.classes !== null &&
					<div>
						<h1>Classes & Levels:</h1>
						<p>
							{_map(this.state.classes, (level, clss) => {
								return(
									<span className="block" key={clss}>{clss + " (" + level + ")"}</span>
								);
							})}
						</p>
					</div>
				}

				{this.state.tier !== null &&
					<div>
						<h1>Tier:</h1>
						<ul className="tierList">
							<li className={this.state.tier > 0 && "filled"}>1</li>
							<li className={this.state.tier > 1 && "filled"}>2</li>
							<li className={this.state.tier > 2 && "filled"}>3</li>
							<li className={this.state.tier > 3 && "filled"}>4</li>
						</ul>
						{/* <p>{this.state.tier}</p> */}
					</div>
				}

				{this.state.base !== null &&
					<div>
						<h1>Assigned Base:</h1>
						<p>{this.state.base}</p>
					</div>
				}

				{this.state.wealth !== null &&
					<div>
						<h1>Current Wealth:</h1>
						<p>
							<Wealth wealthObj={this.state.wealth} />
						</p>
					</div>
				}
			</Container>
        );
    }
}

export default Player;