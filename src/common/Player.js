import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useToasts } from "react-toast-notifications";
import _map from "lodash/map";
import _each from "lodash/each";

import { HiPlusCircle } from "react-icons/hi";
import { AiTwotoneDelete } from "react-icons/ai";
import { IoIosCalculator } from "react-icons/io";

import Wealth from "common/Wealth";
import EditButton from "common/EditButton";
import { getTotalCopper, condenseWealth } from "utils/Util";

import "./Player.scss";

function withToast(Component) {
	return function WrappedComponent(props) {
		const toastFuncs = useToasts();
		return <Component {...props} {...toastFuncs} />; //BUG - "Warning: Each child in a list should have a unique "key" prop.""
	};
}

class Player extends Component {
	static propTypes = {
		playerObj: PropTypes.object.isRequired,
		optionsObj: PropTypes.object,
	};

	static defaultProps = {
		optionsObj: { 
			autoLeveling: false,
			tierSetting: 0,
			useEp: true
		}
	}

	state = {
		playerObj: this.props.playerObj,
		tempObj: JSON.parse(JSON.stringify(this.props.playerObj)),
		isEditing: false, // TRUE FOR TESTING

		// options
		autoLeveling: this.props.optionsObj.autoLeveling,
		tierSetting: this.props.optionsObj.tierSetting,
		useEp: this.props.optionsObj.useEp,
	};

	componentWillRecieveProps(newProps) {
		this.setState({
			playerObj: newProps.playerObj,
			tempObj: JSON.parse(JSON.stringify(this.props.playerObj)),
			isEditing: newProps.isEditing,
			autoLeveling: newProps.optionsObj.autoLeveling,
			tierSetting: newProps.optionsObj.tierSetting,
			useEp: newProps.optionsObj.useEp,
		});
	}

	//FUNCTIONS
	getPlayerDciStr = () => {
		var str = "";
		if (!!this.state.playerObj.player) {
			str = this.state.playerObj.player;
			if (!!this.state.playerObj.dci) {
				str = str + " (" + this.state.playerObj.dci + ")";
			}
		} else if (!!this.state.playerObj.dci) {
			str = this.state.playerObj.dci;
		}

		return str;
	};

	editInfo = (close) => {
		if (this.state.isEditing && !close) {
			this.setState({
				isEditing: false,
				playerObj: this.state.tempObj,
			});
		} else {
			this.setState({
				isEditing: !this.state.isEditing,
				tempObj: JSON.parse(JSON.stringify(this.state.playerObj)),
			});
		}
	};

	updateTempInfo = (attr, val) => {
		var newObj = this.state.tempObj;
		newObj[attr] = val;
		this.setState({ tempObj: newObj });
	};

	setTempWealth = (money, denom) => {
		let tempWealthObj = {
			...this.state.tempObj.wealth,
			[denom]: money === "" ? 0 : Math.abs(parseInt(money)),
		};
		this.updateTempInfo("wealth", tempWealthObj);
	};

	calcWealth = () => {
		let condensedObj = condenseWealth(getTotalCopper(this.state.tempObj.wealth), this.state.useEp);
		let toastMsg = JSON.stringify(condensedObj) === JSON.stringify(this.state.tempObj.wealth) ? "No change to coinage." : "Condensed coinage.";
		let toastType = JSON.stringify(condensedObj) === JSON.stringify(this.state.tempObj.wealth) ? "info" : "success";
		
		this.props.addToast(toastMsg, { appearance: toastType });

		this.updateTempInfo("wealth", condensedObj);
	};

	getTier = () => {
		if (this.state.tierSetting > 0) {
			return this.state.tierSetting
		}

		var totalLevel = 0;
		_each(this.state.playerObj.classes, (lv) => {
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

	setUseEp = (val) => {
		// convert EP to SP and add to SP
		if (!val && this.state.tempObj.wealth.ep !== 0) {
			var newWealthObj = JSON.parse(JSON.stringify(this.state.tempObj.wealth));
			let newSp = newWealthObj.ep * 5;
			newWealthObj.sp = newWealthObj.sp + newSp;
			newWealthObj.ep = 0;
			this.updateTempInfo("wealth",newWealthObj);
			this.props.addToast((newSp/5 + " ep converted into " + newSp + " sp"), { appearance: "warning" });
		}

		this.setState({useEp: val});
	}

	addNewClass = () => {
		var newClassObj = JSON.parse(JSON.stringify(this.state.tempObj.classes));
		let newClassName = "Multiclass " + (Object.keys(newClassObj).length + 1);
		newClassObj[newClassName] = 1

		this.updateTempInfo("classes",newClassObj);
	}

	//RENDERERS
	render_displayInfo = () => {
		return (
			<span className="playerBoxContent">
				<div className="infoItem">
					<h1>Character:</h1>
					<p>{this.state.playerObj.character}</p>
				</div>

				{this.state.playerObj.tier !== -1 && (
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

				{(!!this.state.playerObj.player ||
					!!this.state.playerObj.dci) && (
					<div className="infoItem">
						<h1>Player:</h1>
						<p>{this.getPlayerDciStr()}</p>
					</div>
				)}

				{!!this.state.playerObj.base && (
					<div className="infoItem">
						<h1>Base:</h1>
						<p>{this.state.playerObj.base}</p>
					</div>
				)}

				{!!this.state.playerObj.wealth && getTotalCopper(this.state.playerObj.wealth) > 0 && (
					<div className="infoItem">
						<h1>Wealth:</h1>
						<p>
							<Wealth wealthObj={this.state.playerObj.wealth} />
						</p>
					</div>
				)}

				{Object.keys(this.state.playerObj.classes).length > 0 && (
					<div className="infoItem">
						<h1>{"Class" + (Object.keys(this.state.playerObj.classes).length !== 1 ? "es:" : ':')}</h1>
						<p className="classList">
							{_map(
								this.state.playerObj.classes,
								(level, clss) => {
									return (
										<span className="class" key={clss}>
											{clss + " (" + level + ")"}
											<span className="comma">, </span>
										</span>
									);
								}
							)}
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
								value={this.state.tempObj.character}
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
									value={this.state.tempObj.player}
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
									value={this.state.tempObj.dci}
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
								value={this.state.tempObj.base}
								onChange={(e) => {
									this.updateTempInfo("base", e.target.value);
								}}
							/>
						</InputGroup>

						{/* CURRENT WEALTH */}
						<li className="group wealthWrapper splitGroupWrapper">
							<InputGroup className="wealthGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="current-wealth">
										<span className="condense">
											Current&nbsp;
										</span>
										Wealth
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="currencyInputsWrapper middleGroup">
								{_map(["cp","sp","ep","gp","pp"].reverse(), (denom, key) => {
										let conversion = [
											"platinum (1000cp)",
											"gold (100cp)",
											"ethereum (50cp)",
											"silver (10cp)",
											"copper (1cp)",
										];

										if (
											!this.state.useEp &&
											denom === "ep"
										) {
											return <></>;
										}

										return (
											<InputGroup
												key={key}
												className={"money " + denom}
											>
												<Form.Control
													className="handwritten"
													id={denom}
													type="number"
													min="0"
													value={this.state.tempObj.wealth[denom].toString().replace(/^0+/, '')}
													onChange={(e) => {this.setTempWealth(e.target.value, denom);}}
													placeholder="0"
												></Form.Control>
												<InputGroup.Append>
													<InputGroup.Text id={denom}>
														<OverlayTrigger
															placement="top"
															overlay={
																<Tooltip>{conversion[key]}</Tooltip>
															}
														>
															<span className="bookFont bold">
																{denom}
															</span>
														</OverlayTrigger>
													</InputGroup.Text>
												</InputGroup.Append>
											</InputGroup>
										);
									}
								)}
							</div>

							<InputGroup
								className="calcButtonGroup rightGroup"
								onClick={this.calcWealth.bind(this)}
							>
								<OverlayTrigger
									placement="left"
									overlay={<Tooltip>Condense Coinage</Tooltip>}
								>
									<InputGroup.Append>
										<InputGroup.Text id="wealth-calc">
											<span className="calcMoneyIcon"><IoIosCalculator /></span>
										</InputGroup.Text>
									</InputGroup.Append>
								</OverlayTrigger>
							</InputGroup>
						</li>

						{/* CLASSES AND LEVELS */}
						<li className="group classLevelWrapper splitGroupWrapper">
							<InputGroup className="playerInfoGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-name">
										Classes
										<span className="condense">
											&nbsp;/&nbsp;Levels
										</span>
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="dropdownsWrapper middleGroup">
								{_map(
									this.state.tempObj.classes, (level, clss) => {
										return (
											<InputGroup className="playerInfoGroup classDropdownGroup" key={clss}>
												{this.render_classDropDown(clss)}
												{this.render_levelDropDown(level)}
											</InputGroup>
										);
									}
								)}

								<InputGroup className="fillerGroup filler1" />
								<InputGroup className="fillerGroup filler2" />
							</div>

							<InputGroup
								className="addClassGroup rightGroup"
								onClick={this.addNewClass.bind(this)}
							>
								<OverlayTrigger placement="left" overlay={<Tooltip>Add Class</Tooltip>}>
									<InputGroup.Append>
										<InputGroup.Text id="add-class">
											<span className="plusIcon">
												<HiPlusCircle />
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</OverlayTrigger>
							</InputGroup>
						</li>

						{/* OPTIONS */}
						<li className="group optionsLevelWrapper splitGroupWrapper">
							<InputGroup className="playerInfoGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-options">Options</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="playerInfoOptions">
								{/* set leveling */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.autoLeveling ? "Auto Levels" : "Manual Levels"} alignRight>
										<Dropdown.Item href="#" eventKey="f" active={this.state.autoLeveling === false} onSelect={(e) => {this.setState({autoLeveling: false})}}>Manual</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="t" active={this.state.autoLeveling === true} onSelect={(e) => {this.setState({autoLeveling: true})}}>Auto</Dropdown.Item>
									</DropdownButton>
								</InputGroup>

								{/* set tier */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.tierSetting > 0 ? "Tier " + this.state.tierSetting : "Auto Tier"} alignRight>
										<Dropdown.Item href="#" eventKey="0" active={this.state.tierSetting === 0} onSelect={(e) => {this.setState({tierSetting: 0})}}>Auto</Dropdown.Item>
										<Dropdown.Divider />
										<Dropdown.Item href="#" eventKey="1" active={this.state.tierSetting === 1} onSelect={(e) => {this.setState({tierSetting: 1})}}>Tier 1</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="2" active={this.state.tierSetting === 2} onSelect={(e) => {this.setState({tierSetting: 2})}}>Tier 2</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="3" active={this.state.tierSetting === 3} onSelect={(e) => {this.setState({tierSetting: 3})}}>Tier 3</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="4" active={this.state.tierSetting === 4} onSelect={(e) => {this.setState({tierSetting: 4})}}>Tier 4</Dropdown.Item>
									</DropdownButton>
								</InputGroup>

								{/* set useEp */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.useEp ? "Using EP" : "Ignoring EP"} alignRight>
										<Dropdown.Item href="#" eventKey="t" active={this.state.useEp === true} onSelect={this.setUseEp.bind(this,true)}>Use EP</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="f" active={this.state.useEp === false} onSelect={this.setUseEp.bind(this,false)}>Ignore EP</Dropdown.Item>
									</DropdownButton>
								</InputGroup>
							</div>
						</li>
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
				{!Object.keys(this.state.tempObj.classes).includes("Artificier") && <Dropdown.Item href="#">Artificer</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Barbarian") && <Dropdown.Item href="#">Barbarian</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Bard") && <Dropdown.Item href="#">Bard</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Cleric") && <Dropdown.Item href="#">Cleric</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Druid") && <Dropdown.Item href="#">Druid</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Fighter") && <Dropdown.Item href="#">Fighter</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Monk") && <Dropdown.Item href="#">Monk</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Paladin") && <Dropdown.Item href="#">Paladin</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Ranger") && <Dropdown.Item href="#">Ranger</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Rogue") && <Dropdown.Item href="#">Rogue</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Sorcerer") && <Dropdown.Item href="#">Sorcerer</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Wizard") && <Dropdown.Item href="#">Wizard</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Warlock") && <Dropdown.Item href="#">Warlock</Dropdown.Item>}
				<Dropdown.Divider />
				{!Object.keys(this.state.tempObj.classes).includes("Blood Hunter") && <Dropdown.Item href="#">Blood Hunter</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Mystic") && <Dropdown.Item href="#">Mystic</Dropdown.Item>}
				{!Object.keys(this.state.tempObj.classes).includes("Others") && <Dropdown.Item href="#">Others</Dropdown.Item>}
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
				<div className={classnames("playerBox",this.state.isEditing && "editing")}>
					<Fade in={this.state.isEditing}>
						<EditButton
							left
							cancel
							onClick={this.editInfo.bind(this, true)}
							active={this.state.isEditing}
						/>
					</Fade>

					{this.render_displayInfo()}

					<EditButton
						save
						onClick={this.editInfo.bind(this, false)}
						active={this.state.isEditing}
						/>
				</div>

				{this.render_editInfo()}
			</div>
		);
	}
}

export default withToast(Player);
