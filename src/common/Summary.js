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
		
		return (
			<Card className="cardWrapper">
				<Card.Body>
					<div className="infoDots">
						<OverlayTrigger placement="left" overlay={
							<Tooltip>
					          Tier {gameData.tier}
					        </Tooltip>
						}>
							<div className="dot fauxdesto">{gameData.tier}</div>
						</OverlayTrigger>

						{gameData.record.toUpperCase() === "EPIC" &&
							<OverlayTrigger placement="left" overlay={<Tooltip>Epic</Tooltip>}>
								<span className="dot fauxdesto">E</span>
							</OverlayTrigger>
						}
					</div>

					<Card.Title className="title">{gameData.title}</Card.Title>
					<Card.Subtitle className="code">
						{gameData.code}
					</Card.Subtitle>
					<Card.Text className="notes bookFont" dangerouslySetInnerHTML={{ __html: gameData.notes.game }} />
					<Card.Text className="ellipsis">...</Card.Text>
					{/* <Card.Link className="link" href="#">View Summary</Card.Link> */}
				</Card.Body>
			</Card>
		);
	}
}

export default Summary;