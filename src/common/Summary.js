import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Card from 'react-bootstrap/Card';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { FaDiceD20 } from "react-icons/fa";


import GameLog from 'GameLog.js';

import "common/Summary.scss";

class Summary extends Component {
	static propTypes = {
		gameData: PropTypes.object.isRequired,
		handleAdd: PropTypes.func.isRequired,
		disabled: PropTypes.bool
	}

	static defaultProps = {
		disabled: false
	}

	state = {
		showModal: false,
		isDisabled: this.props.disabled
	}

	componentWillReceiveProps(nextProps) {
        this.setState({ isDisabled: nextProps.disabled });
    }

    // FUNCTIONS
	setShowModal = (newState) => {
		if (!this.state.disabled) {
			this.setState({showModal: newState});
		}
	}

	handleAddRecord = (asDm) => {
		this.setShowModal(false);
		var newData = this.props.gameData;
		
		if (asDm) {
			newData.dungeonMaster = {isDm: true}
		}

		this.props.handleAdd(newData);
	}

	// RENDERERS
	render() {
		const {gameData} = this.props;
		
		return (
			<Card className={classnames("cardWrapper", this.state.isDisabled ? "disabled" : "")}>
				<Card.Body onClick={this.setShowModal.bind(this,true)}>
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
					{/* <Card.Text className="notes bookFont" dangerouslySetInnerHTML={{ __html: gameData.notes.game }} /> */}
					{/* <Card.Text className="ellipsis">...</Card.Text> */}
				</Card.Body>

				<Modal size={"xl"} centered scrollable show={this.state.showModal} onHide={this.setShowModal.bind(this,false)}>
					<Modal.Header closeButton>
						<Modal.Title>Preview {gameData.type}</Modal.Title>
					</Modal.Header>
					<Modal.Body>
						<GameLog data={gameData} preview />
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={this.setShowModal.bind(this,false)}>Cancel</Button>
						<Button variant="primary" onClick={this.handleAddRecord.bind(this,true)}>Add as DM <FaDiceD20 className="modalDiceIcon" /></Button>
    					<Button variant="primary" onClick={this.handleAddRecord.bind(this,false)}>Add Record</Button>
					</Modal.Footer>
				</Modal>
			</Card>
		);
	}
}

export default Summary;