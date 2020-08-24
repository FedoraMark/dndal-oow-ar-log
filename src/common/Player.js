import React, { Component } from "react";
import PropTypes from "prop-types";
import Collapse from "react-bootstrap/Collapse";
import _map from "lodash/map";
import classnames from "classnames";

import Wealth from "common/Wealth";
import EditButton from "common/EditButton";

import "./Player.scss";

class Player extends Component {
	static propTypes = {
		playerObj: PropTypes.object.isRequired,
	};

	state = {
		player: this.props.playerObj.player,
		dci: this.props.playerObj.dci,
		character: this.props.playerObj.character,
		classes: this.props.playerObj.classes,
		tier: this.props.playerObj.tier,
		base: this.props.playerObj.base,
		wealth: this.props.playerObj.wealth,
		isEditing: false,
	};

	//FUNCTIONS
	getPlayerDciStr = () => {
		var str = "";
		if (this.state.player !== undefined) {
			str = this.state.player;
			if (this.state.dci !== undefined) {
				str = str + " (" + this.state.dci + ")";
			}
		} else if (this.state.dci !== undefined) {
			str = this.state.dci;
		}

		return str;
	};

	editInfo = () => {
		this.setState({ isEditing: !this.state.isEditing });
	};

	render_displayInfo = () => {
		return (
			<span className="playerBoxContent">
				<div className="infoItem">
					<h1>Character:</h1>
					<p>{this.state.character}</p>
				</div>

				{(this.state.player !== undefined ||
					this.state.dci !== undefined) && (
					<div className="infoItem">
						<h1>Player:</h1>
						<p>{this.getPlayerDciStr()}</p>
					</div>
				)}

				{this.state.classes !== undefined && (
					<div className="infoItem">
						<h1>Classes:</h1>
						<p>
							{_map(this.state.classes, (level, clss) => {
								return (
									<span className="class" key={clss}>
										{clss + " (" + level + ")"}
										<span className="comma">, </span>
									</span>
								);
							})}
						</p>
					</div>
				)}

				{this.state.tier !== undefined && (
					<div className="infoItem tierItem">
						<h1>Tier:</h1>
						<ul className="tierList">
							<li className={this.state.tier > 0 ? "filled": ''}>1</li>
							<li className={this.state.tier > 1 ? "filled": ''}>2</li>
							<li className={this.state.tier > 2 ? "filled": ''}>3</li>
							<li className={this.state.tier > 3 ? "filled": ''}>4</li>
						</ul>
					</div>
				)}

				{this.state.base !== undefined && (
					<div className="infoItem">
						<h1>Base:</h1>
						<p>{this.state.base}</p>
					</div>
				)}

				{this.state.wealth !== undefined && (
					<div className="infoItem">
						<h1>Wealth:</h1>
						<p>
							<Wealth wealthObj={this.state.wealth} />
						</p>
					</div>
				)}
			</span>
		);
	};

	render_editInfo = () => {
		return (
			<Collapse in={this.state.isEditing} mountOnEnter unmountOnExit>
				<div className="editingContent">
					<div className="editingFlex">
						TO BE DONE
					</div>
				</div>
			</Collapse>
		);
	};

	//RENDERERS
	render() {
		return (
			<div className="editBox">
				<div className={classnames("playerBox", this.state.isEditing && "editing")}>
					<EditButton save onClick={this.editInfo.bind()} active={this.state.isEditing} />
					{this.render_displayInfo()}
				</div>

				{this.render_editInfo()}
			</div>
		);
	}
}

export default Player;