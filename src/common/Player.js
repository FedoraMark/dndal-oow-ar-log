import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import _map from 'lodash/map';

import Wealth from "./Wealth.js";

import "./Player.scss";

export class Player extends Component {
    static propTypes = {
        player: PropTypes.string,
        character: PropTypes.string.isRequired,
        classes: PropTypes.object,
        tier: PropTypes.number,
        base: PropTypes.string,
        wealth: PropTypes.object
    }

    static defaultProps = {
        player: null,
        classes: null,
        tier: null,
        base: null,
        wealth: null,
    }

    state = {
        player: this.props.player,
        character: this.props.character,
        classes: this.props.classes,
        tier: this.props.tier,
        base: this.props.base,
        wealth: this.props.wealth
    }

    render() {
        return (
            <Container fluid className="playerBox">
            	{this.state.player !== null &&
					<div>
						<h1>Player Name:</h1>
						<p>{this.state.player}</p>
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
						<p>{this.state.tier}</p>
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