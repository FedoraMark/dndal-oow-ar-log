import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Collapse from "react-bootstrap/Collapse";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import _map from "lodash/map";
import _each from "lodash/each";
import { BsPlusCircle, BsPlusCircleFill } from "react-icons/bs";
import { AiTwotoneDelete } from "react-icons/ai";

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

		temp_player: this.props.playerObj.player,
		temp_dci: this.props.playerObj.dci,
		temp_character: this.props.playerObj.character,
		temp_classes: this.props.playerObj.classes,
		temp_tier: this.props.playerObj.tier,
		temp_base: this.props.playerObj.base,
		temp_wealth: this.props.playerObj.wealth,
	};

	componentWillReceiveNewProps(newProps) {
		this.setState({
			player: newProps.playerObj.player,
			dci: newProps.playerObj.dci,
			character: newProps.playerObj.character,
			classes: newProps.playerObj.classes,
			tier: newProps.playerObj.tier,
			base: newProps.playerObj.base,
			wealth: newProps.playerObj.wealth,
		});
	}

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
		if (this.state.isEditing) {
			this.setState({
				isEditing: false,
				player: this.state.temp_player,
				dci: this.state.temp_dci,
				character: this.state.temp_character,
				classes: this.state.temp_classes,
				base: this.state.temp_base,
				wealth: this.state.temp_wealth,
				player: this.state.temp_player,
			});
		}

		this.setState({ isEditing: !this.state.isEditing });
	};

	updateTempInfo = (attr, val) => {
		this.setState({ ["temp_" + attr]: val });
	};

	getTier = () => {
		var totalLevel = 0;
		_each(this.state.classes, (lv) => {
			totalLevel += lv;
		});

		if (totalLevel < 1) {
			return 0;
		}
		if (totalLevel < 5) {
			return 1;
		}
		if (totalLevel < 11) {
			return 2;
		}
		if (totalLevel < 17) {
			return 3;
		}
		return 4;
	};

	//RENDERERS
	render_displayInfo = () => {
		return (
			<span className="playerBoxContent">
				<div className="infoItem">
					<h1>Character:</h1>
					<p>{this.state.character}</p>
				</div>

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
							<li className={this.getTier() > 0 ? "filled" : ""}>
								1
							</li>
							<li className={this.getTier() > 1 ? "filled" : ""}>
								2
							</li>
							<li className={this.getTier() > 2 ? "filled" : ""}>
								3
							</li>
							<li className={this.getTier() > 3 ? "filled" : ""}>
								4
							</li>
						</ul>
					</div>
				)}

				{(this.state.player !== undefined ||
					this.state.dci !== undefined) && (
					<div className="infoItem">
						<h1>Player:</h1>
						<p>{this.getPlayerDciStr()}</p>
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
					<ul className="editingFlex">
						{/* CHARACTER NAME */}
						<InputGroup as="li" className="playerInfoGroup">
							<InputGroup.Prepend>
								<InputGroup.Text id="character-name">
									Character
									<span className="condense">&nbsp;Name</span>
								</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control
								className="handwritten"
								id="charaName"
								value={this.state.temp_character}
								onChange={(e) => {
									this.updateTempInfo(
										"character",
										e.target.value
									);
								}}
								placeholder="(required)"
							/>
						</InputGroup>

						{/* PLAYER NAME AND DCI # */}
						<li className="group playerInfoWrapper">
							<InputGroup className="playerInfoGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="player-name">
										Player
										<span className="condense">
											&nbsp;Name
										</span>
									</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control
									className="handwritten"
									id="playerName"
									value={this.state.temp_player}
									onChange={(e) => {
										this.updateTempInfo(
											"player",
											e.target.value
										);
									}}
								/>
							</InputGroup>

							<InputGroup className="playerInfoGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="player-dci">
										<span className="condense">
											Player&nbsp;
										</span>
										DCI&nbsp;#
									</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control
									className="handwritten"
									id="playerDci"
									value={this.state.temp_dci}
									onChange={(e) => {
										this.updateTempInfo(
											"dci",
											e.target.value
										);
									}}
								/>
							</InputGroup>
						</li>

						{/* ASSIGNED BASE */}
						<InputGroup as="li" className="playerInfoGroup">
							<InputGroup.Prepend>
								<InputGroup.Text id="base-name">
									<span className="condense">
										Assigned&nbsp;
									</span>
									Base
								</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control
								className="handwritten"
								id="baseName"
								value={this.state.temp_base}
								onChange={(e) => {
									this.updateTempInfo("base", e.target.value);
								}}
							/>
						</InputGroup>

						{/* CURRENT WEALTH */}
						<li className="group wealthWrapper">
							<InputGroup className="wealthGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-name">
										<span className="condense">
											Current&nbsp;
										</span>
										Wealth
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="currencyInputsWrapper">
								<InputGroup className="pp">
									<Form.Control
										className="handwritten"
										id="baseName"
									></Form.Control>
									<InputGroup.Append>
										<InputGroup.Text id="pp">
											<span className="bookFont bold">
												pp
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>

								<InputGroup className="gp">
									<Form.Control
										className="handwritten"
										id="baseName"
									></Form.Control>
									<InputGroup.Append>
										<InputGroup.Text id="gp">
											<span className="bookFont bold">
												gp
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>

								<InputGroup className="ep">
									<Form.Control
										className="handwritten"
										id="baseName"
									></Form.Control>
									<InputGroup.Append>
										<InputGroup.Text id="ep">
											<span className="bookFont bold">
												ep
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>

								<InputGroup className="sp">
									<Form.Control
										className="handwritten"
										id="baseName"
									></Form.Control>
									<InputGroup.Append>
										<InputGroup.Text id="sp">
											<span className="bookFont bold">
												sp
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>

								<InputGroup className="cp">
									<Form.Control
										className="handwritten"
										id="baseName"
									></Form.Control>
									<InputGroup.Append>
										<InputGroup.Text id="cp">
											<span className="bookFont bold">
												cp
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>
							</div>
						</li>

						{/* CLASSES AND LEVELS */}
						<li className="group classLevelWrapper">
							<InputGroup className="playerInfoGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-name">
										Classes
										<span className="condense">
											&nbsp;/&nbsp;Levels
										</span>
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="dropdownsWrapper">
								{_map(
									this.state.temp_classes,
									(level, clss) => {
										return (
											<InputGroup className="playerInfoGroup">
												{this.render_classDropDown(
													clss
												)}
												{this.render_levelDropDown(
													level
												)}
											</InputGroup>
										);
									}
								)}

								<button className="addClassButton">
									<span className="overlay">
										<BsPlusCircleFill />
									</span>
									<span className="underlay">
										<BsPlusCircle />
									</span>
								</button>
							</div>
						</li>

						{/* TBD: TIER (automatic) */}
					</ul>
				</div>
			</Collapse>
		);
	};

	render_classDropDown = (selected) => {
		return (
			<DropdownButton
				as={InputGroup.Prepend}
				variant="secondary"
				title={selected}
			>
				<Dropdown.Item href="#">Artificer</Dropdown.Item>
				<Dropdown.Item href="#">Barbarian</Dropdown.Item>
				<Dropdown.Item href="#">Bard</Dropdown.Item>
				<Dropdown.Item href="#">Cleric</Dropdown.Item>
				<Dropdown.Item href="#">Druid</Dropdown.Item>
				<Dropdown.Item href="#">Fighter</Dropdown.Item>
				<Dropdown.Item href="#">Monk</Dropdown.Item>
				<Dropdown.Item href="#">Paladin</Dropdown.Item>
				<Dropdown.Item href="#">Ranger</Dropdown.Item>
				<Dropdown.Item href="#">Rogue</Dropdown.Item>
				<Dropdown.Item href="#">Sorcerer</Dropdown.Item>
				<Dropdown.Item href="#">Wizard</Dropdown.Item>
				<Dropdown.Item href="#">Warlock</Dropdown.Item>
				<Dropdown.Divider />
				<Dropdown.Item href="#">Blood Hunter</Dropdown.Item>
				<Dropdown.Item href="#">Mystic</Dropdown.Item>
				<Dropdown.Item href="#">Other</Dropdown.Item>
				<Dropdown.Divider />
				<Dropdown.Item className="remove oswald" href="#">
					<span>Remove</span>
					<AiTwotoneDelete />
				</Dropdown.Item>
			</DropdownButton>
		);
	};

	render_levelDropDown = (selected) => {
		return (
			<DropdownButton
				as={InputGroup.Append}
				variant="outline-secondary"
				title={selected}
				alignRight
				className="levelDropdown"
			>
				<Dropdown.Item href="#">1</Dropdown.Item>
				<Dropdown.Item href="#">2</Dropdown.Item>
				<Dropdown.Item href="#">3</Dropdown.Item>
				<Dropdown.Item href="#">4</Dropdown.Item>
				<Dropdown.Item href="#">5</Dropdown.Item>
				<Dropdown.Item href="#">6</Dropdown.Item>
				<Dropdown.Item href="#">7</Dropdown.Item>
				<Dropdown.Item href="#">8</Dropdown.Item>
				<Dropdown.Item href="#">9</Dropdown.Item>
				<Dropdown.Item href="#">10</Dropdown.Item>
				<Dropdown.Item href="#">11</Dropdown.Item>
				<Dropdown.Item href="#">12</Dropdown.Item>
				<Dropdown.Item href="#">13</Dropdown.Item>
				<Dropdown.Item href="#">14</Dropdown.Item>
				<Dropdown.Item href="#">15</Dropdown.Item>
				<Dropdown.Item href="#">16</Dropdown.Item>
				<Dropdown.Item href="#">17</Dropdown.Item>
				<Dropdown.Item href="#">18</Dropdown.Item>
				<Dropdown.Item href="#">19</Dropdown.Item>
				<Dropdown.Item href="#">20</Dropdown.Item>
			</DropdownButton>
		);
	};

	render() {
		return (
			<div className="editBox">
				<div
					className={classnames(
						"playerBox",
						this.state.isEditing && "editing"
					)}
				>
					<EditButton
						save
						onClick={this.editInfo.bind()}
						active={this.state.isEditing}
					/>
					{this.render_displayInfo()}
				</div>

				{this.render_editInfo()}
			</div>
		);
	}
}

export default Player;
