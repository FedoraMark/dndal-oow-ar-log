import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Card from 'react-bootstrap/Card';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

import "./Summary.scss";

class Summary extends Component {
	static propTypes = {
		gameData: PropTypes.object.isRequired
	}

	render() {
		const {gameData} = this.props;

		let epic = gameData.record.toUpperCase() === "EPIC" ? " (epic)" : '';
		
		return (
			<Card className="cardWrapper">
				<Card.Body>
					<OverlayTrigger placement="left" overlay={
						<Tooltip>
				          Tier {gameData.tier}
				        </Tooltip>
					}>
						<div className="tier fauxdesto">{gameData.tier}</div>
					</OverlayTrigger>

					<Card.Title className="title">{gameData.title}</Card.Title>
					<Card.Subtitle className="code">{gameData.code}{epic}</Card.Subtitle>
					<Card.Text className="notes bookFont" dangerouslySetInnerHTML={{ __html: gameData.notes.game }} />
					<Card.Text className="ellipsis">...</Card.Text>
					<Card.Link href="#">Add Record</Card.Link>
					<Card.Link href="#">View Summary</Card.Link>
				</Card.Body>
			</Card>
		);
	}
}

export default Summary;