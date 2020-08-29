import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import _map from "lodash/map";
import _pull from "lodash/pull";
import { FaDiceD20 } from "react-icons/fa";
import { IoIosCalculator } from "react-icons/io";

import {
	dmRewardNote,
	playerRewardNote,
	getFirstObject,
	getFirstKey,
} from "utils/Util";

import Event from "selectors/Event";
import Select from "selectors/Select";
import Option from "selectors/Option";
import Wealth from "common/Wealth";
import WealthEdit from "common/WealthEdit";
import EditButton from "common/EditButton";

import "animate.css";
import "GameLog.scss";

class GameLog extends React.Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
		statuses: PropTypes.object,
		collapse: PropTypes.bool,
		className: PropTypes.string,
		preview: PropTypes.bool,
		logUpdateHandler: PropTypes.func,
	};

	static defaultProps = {
		statuses: {},
		collapse: false,
		className: "",
		style: {},
		preview: false,
		isEditing: false,
	};

	state = {
		data: this.props.data,
		statusData: this.props.statuses,
		isCollapsed: this.props.collapse,
		isEditing: this.props.isEditing,
		rewardGroup0: [],
		// rewardGroup1: [], // currently unneeded

		tempEvent: "",
		tempDate: "",
		tempNotes: "",
		tempDmName: "",
		tempDmNumber: "",
		tempIsDm: this.props.data.dungeonMaster !== undefined ? this.props.data.dungeonMaster.isDm : "",
	};

	componentDidMount() {
		!this.props.preview && this.setTempData(this.props.statuses);
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			data: newProps.data,
			statusData: newProps.statuses,
		});
	}

	//FUNCTIONS
	toggleCollapsed = () => {
		if (!this.state.isEditing) {
			this.setState({ isCollapsed: !this.state.isCollapsed });
		}
	};

	updateEventHandler = (eventStatus, doActive) => {
		let code = this.state.data.code;
		var stats = this.state.statusData;

		if (doActive || getFirstObject(eventStatus).active) {
			// IF ACTIVE
			stats = {[code]: { ...this.state.statusData[code], ...eventStatus }};
		} else {
			//IF DISABLED
			delete stats[code][getFirstKey(eventStatus)];
		}

		this.setState({ statusData: stats }, (e) => {
			this.props.logUpdateHandler(stats);
			this.setTempData(this.state.statusData[code]);
		});
	};

	advancementHandler = (key, val) => {
		this.updateEventHandler({
			advancement: { legacy: false, active: val },
		});
	};

	selectRewardHandler = (key, val, title) => {
		var newArray = this.state[title];
		if (!val) {
			_pull(newArray, key);
		} else {
			newArray.push(key);
		}

		this.setState({ [title]: newArray },
			this.updateEventHandler({
				[title]: { legacy: false, active: true, selections: newArray },
			})
		);
	};

	optionRewardHandler = (key, title) => {
		this.updateEventHandler({
			[title]: { legacy: false, active: true, option: key },
		});
	};

	setIsEditing = (editing, save) => {
		this.setState({ isEditing: editing });

		if (editing) {
			// open
			this.setTempData(this.state.statusData[this.props.data.code]);
		} else if (save) {
			// close - save
			this.saveTempData();
		} else {
			// close - cancel
			this.setTempData(this.state.statusData[this.props.data.code]);
		}
	};

	saveTempData = () => {
		let tempStatusData = {
			notes: {
				...this.state.statusData.notes,
				player: this.state.tempNotes.trim(),
			},
			event: this.state.tempEvent.trim(),
			date: this.state.tempDate.trim(),
			dungeonMaster: {
				name: this.state.tempDmName.trim(),
				dci: this.state.tempDmNumber.trim(),
				isDm: this.state.tempIsDm,
			},
		};

		this.setState(
			{
				tempNotes: this.state.tempNotes.trim(),
				tempDmName: this.state.tempDmName.trim(),
				tempDmNumber: this.state.tempDmNumber.trim(),
				tempIsDm: this.state.tempIsDm,
				tempEvent: this.state.tempEvent.trim(),
				tempDate: this.state.tempDate.trim(),
			},
			this.updateEventHandler(tempStatusData, true)
		);
	};

	getPropOrEmpty = (obj, prop, child) => {	
		if (obj[prop] === undefined) {
			return "";
		}

		if (child === null) {
			return obj[prop];
		}

		return obj[prop][child] !== undefined ? obj[prop][child] : "";
	};

	setTempData = (statusObj) => {
		!!statusObj &&
			this.setState({
				tempEvent: this.getPropOrEmpty(statusObj,"event",null),
				tempDate: this.getPropOrEmpty(statusObj,"date",null),
				tempNotes: this.getPropOrEmpty(statusObj,"notes","player"),
				tempDmName: this.getPropOrEmpty(statusObj,"dungeonMaster","name"),
				tempDmNumber: this.getPropOrEmpty(statusObj,"dungeonMaster","dci"),
				tempIsDm: this.state.data.dungeonMaster !== undefined ? this.state.data.dungeonMaster.isDm : this.getPropOrEmpty(statusObj,"dungeonMaster","isDm"),
			});
	};

	//RENDERERS
	render_titleAndCode = (type, code, title) => {
		return (
			<div
				className={classnames(
					"titleWrapper",
					!this.props.preview && "sticky"
				)}
			>
				{!this.props.preview && (
					<>
						<Fade
							in={this.state.isEditing}
							mountOnEnter
							unmountOnExit
						>
							<EditButton
								left
								cancel
								onClick={this.setIsEditing.bind(this,false,false)}
								active
							/>
						</Fade>

						<Fade
							in={!this.state.isCollapsed}
							mountOnEnter
							unmountOnExit
						>
							<EditButton
								save
								onClick={this.setIsEditing.bind(this,!this.state.isEditing,true)}
								active={this.state.isEditing}
							/>
						</Fade>
					</>
				)}

				<h1
					className="title fauxdesto"
					onClick={this.toggleCollapsed.bind(this)}
				>
					<span className="name">
						{!this.props.preview &&
							!!this.state.data.dungeonMaster &&
							this.state.data.dungeonMaster.isDm && (
								<FaDiceD20 className="diceIcon" />
							)}
						{code !== null && (
							<span
								className="code"
								dangerouslySetInnerHTML={{__html: code.split("-").join("<span class='hyphen'>-</span>")}}
							/>
						)}
						<span className="fauxdesto italic">{title}</span>
					</span>
				</h1>
			</div>
		);
	};

	render_gameInfo = () => {
		let code = this.state.data.code;

		var date =
			this.state.statusData[code] !== undefined && this.state.statusData[code].date !== undefined
				? this.state.statusData[code].date
				: "";
		var event =
			this.state.statusData[code] !== undefined && this.state.statusData[code].event !== undefined
				? this.state.statusData[code].event
				: "";
		var dmObj =
			this.state.statusData[code] !== undefined && this.state.statusData[code].dungeonMaster !== undefined
				? {...this.state.statusData[code].dungeonMaster}
				: {...this.state.data.dungeonMaster};


		var dmStr = "";

		if (!dmObj.isDm) {
			if ("name" in dmObj && dmObj.name.length > 0) {
				dmStr = dmObj.name;
				if ("dci" in dmObj && dmObj.dci.length > 0) {
					dmStr = dmStr + " (" + dmObj.dci + ")";
				}
			} else if ("dci" in dmObj) {
				dmStr = dmObj.dci;
			}
		}

		return (
			<Container>
				<ul className="infoWrapper">
					{this.state.data.tier !== undefined && (
						<li className="tier">
							<h1>Tier:</h1>
							<p>{this.state.data.tier}</p>
							{this.state.data.record === "epic" && <p>E</p>}
						</li>
					)}
					{date !== "" && (
						<li className="date">
							<h1>Date:</h1>
							<p>{date}</p>
						</li>
					)}
					{event !== "" && (
						<li className="event">
							<h1>Event:</h1>
							<p>{event}</p>
						</li>
					)}
					{!this.props.preview && (dmStr !== "" || dmObj.isDm) && (
						<li className="dm">
							<h1>Dungeon Master:</h1>
							<p>{dmObj.isDm ? <span><FaDiceD20 /></span> : dmStr}</p>
						</li>
					)}
				</ul>
			</Container>
		);
	};

	render_advNotes = (suppressTitle) => {
		var statusNotes =
			this.state.statusData[this.state.data.code] !== undefined
				? this.state.statusData[this.state.data.code].notes
				: {};
		let allNotes = { ...this.state.data.notes, ...statusNotes };

		return (
			<Container className="notesWrapper wrapper">
				{!suppressTitle && (
					<h1 className="sectionTitle">Adventure Notes</h1>
				)}
				<div className="box">
					{"game" in allNotes && (
						<p
							className="gameNotes bookFont"
							dangerouslySetInnerHTML={{ __html: allNotes.game }}
						/>
					)}
					{"game" in allNotes &&
						"player" in allNotes &&
						allNotes.player.length > 0 && <hr />}
					{"player" in allNotes && allNotes.player.length > 0 && (
						<p
							className="playerNotes handwritten"
							dangerouslySetInnerHTML={{ __html: allNotes.player.replace(/\n\r?/g, '<br />') }}
						/>
					)}
				</div>
			</Container>
		);
	};

	render_advancement = () => {
		const { preview } = this.props;

		let isSelected =
			this.state.statusData[this.state.data.code] !== undefined &&
			this.state.statusData[this.state.data.code].advancement !== undefined
				? this.state.statusData[this.state.data.code].advancement.active
				: false;

		return (
			<Container className="advWrapper wrapper">
				<h1 className="sectionTitle">Advancement</h1>
				<div className="box">
					<Select
						label={this.state.data.advancement.label}
						type="checkbox"
						suppressReset
						isBold
						isSelected={isSelected}
						isDisabled={preview || this.state.isEditing}
						selectHandler={this.advancementHandler}
					/>
					<p
						className="bookFont footnote"
						dangerouslySetInnerHTML={{
							__html: this.state.data.advancement.footnote,
						}}
					/>
				</div>
			</Container>
		);
	};

	render_rewards = () => {
		const { preview } = this.props;

		return (
			<Container className="rewardsWrapper wrapper">
				<h1 className="sectionTitle">Rewards</h1>
				<div className="box rewardsContent">
					{_map(this.state.data.rewards, (rewardGroup, groupKey) => {
						//CLEANUP - should be type of <Event /> component
						let groupName = "rewardGroup" + groupKey;
						var option = -1;
						var selectArray = [];

						if (
							this.state.statusData[this.state.data.code] !==
								undefined &&
							this.state.statusData[this.state.data.code][
								groupName
							] !== undefined
						) {
							option = this.state.statusData[
								this.state.data.code
							][groupName].option;
							selectArray = this.state.statusData[
								this.state.data.code
							][groupName].selections;
						}

						return (
							<div key={groupKey} className="rewardGroup">
								<h1 className="bookFont bold">
									<span
										className={classnames("instructions")}
									>
										{rewardGroup.instructions}
									</span>
									{"options" in rewardGroup && (
										<div className="buttonArea" />
									)}
								</h1>

								{"options" in rewardGroup && (
									<Option
										options={rewardGroup.options}
										canBlank
										suppressReset
										isDisabled={preview || this.state.isEditing}
										selection={option}
										title={groupName}
										optionHandler={this.optionRewardHandler}
									/>
								)}

								{"selections" in rewardGroup && (
									<>
										{_map(
											rewardGroup.selections,
											(selection, selectKey) => {
												return (
													<Select
														key={selectKey}
														label={selection}
														type="checkbox"
														suppressReset
														isDisabled={preview || this.state.isEditing}
														isSelected={selectArray.includes(selectKey)}
														title={groupName}
														arrKey={selectKey}
														selectHandler={this.selectRewardHandler}
													/>
												);
											}
										)}
									</>
								)}
							</div>
						);
					})}
				</div>
			</Container>
		);
	};

	render_wealth = (wealthObj) => {
		return (
			<Container className="wealthWrapper wrapper">
				<h1 className="sectionTitle">Character Wealth</h1>

				<Container className="wealthContent box">
					<div className="header cell">Starting Gold</div>
					<div className="amount cell">
						<span className="val">
							<Wealth
								isEmpty={wealthObj === undefined}
								wealthObj={
									wealthObj === undefined
										? undefined
										: wealthObj.starting
								}
							/>
						</span>
					</div>

					<div className="header cell">
						Gold Spent (<span>-</span>)
					</div>
					<div className="amount cell">
						<span className="val">
							<Wealth
								colorless
								/*loss*/ isEmpty={wealthObj === undefined}
								wealthObj={
									wealthObj === undefined
										? undefined
										: wealthObj.spent
								}
							/>
						</span>
					</div>

					<div className="header cell">Gold Earned (+)</div>
					<div className="amount cell">
						<span className="val">
							<Wealth
								colorless
								/*gain*/ isEmpty={wealthObj === undefined}
								wealthObj={
									wealthObj === undefined
										? undefined
										: wealthObj.earned
								}
							/>
						</span>
					</div>

					<div className="header cell bottom">Ending Gold</div>
					<div className="amount cell bottom">
						<span className="val">
							<Wealth
								isEmpty={wealthObj === undefined}
								wealthObj={
									wealthObj === undefined
										? undefined
										: wealthObj.ending
								}
							/>
						</span>
					</div>
				</Container>
			</Container>
		);
	};

	render_legacy = () => {
		const { preview } = this.props;
		let footnote =
			!!this.state.data.dungeonMaster &&
			this.state.data.dungeonMaster.isDm
				? dmRewardNote
				: playerRewardNote;

		return (
			<Container className="legacyWrapper wrapper">
				<h1 className="sectionTitle">Legacy Events</h1>
				<Container className="box">
					<div className="legacyContent">
						{_map(this.state.data.legacy.events, (event, key) => {
							var statusObj = {};
							if (
								this.state.statusData[this.state.data.code] !==
									undefined &&
								this.state.statusData[this.state.data.code][
									event.title
								] !== undefined
							) {
								statusObj = this.state.statusData[
									this.state.data.code
								][event.title];
							}

							return (
								<Event
									eventObj={event}
									key={key}
									disable={preview || this.state.isEditing}
									status={statusObj}
									updateHandler={this.updateEventHandler}
								/>
							);
						})}
					</div>
					<div
						className="footnote bookFont"
						dangerouslySetInnerHTML={{ __html: footnote }}
					/>
				</Container>
			</Container>
		);
	};

	render_logData = () => {
		return (
			<div className="logDataWrapper">
				{this.render_gameInfo()}
				{this.render_advNotes(false)}

				<div className="twoCol">
					<div className="leftCol arCol">
						{this.render_advancement()}
						{this.render_rewards()}
						{this.render_wealth(this.state.data.gameWealth)}
					</div>

					<div className="rightCol arCol">{this.render_legacy()}</div>
				</div>{" "}
			</div>
		);
	};

	render_editData = () => {
		return (
			<ul className="editWrapper">
				<InputGroup as="li" className="editRow">
					<InputGroup.Prepend>
						<InputGroup.Text className="oswald">
							<span className="condense">Player&nbsp;</span>
							Notes
						</InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control
						as="textarea"
						className="handwritten"
						value={this.state.tempNotes}
						onChange={(e) => {this.setState({tempNotes: e.target.value});}}
					/>
				</InputGroup>

				<li className={classnames("editRow flexRow", this.state.tempIsDm && "disable")}>
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text className="oswald">
								DM Name
							</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							className="handwritten"
							disabled={this.state.tempIsDm}
							value={this.state.tempIsDm ? "You are the DM" : this.state.tempDmName}
							onChange={(e) => {
								this.setState({ tempDmName: e.target.value });
							}}
						/>
					</InputGroup>

					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text className="oswald">
								DM DCI #
							</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							className="handwritten"
							disabled={this.state.tempIsDm}
							value={this.state.tempIsDm ? "You are the DM" : this.state.tempDmNumber}
							onChange={(e) => {
								this.setState({ tempDmNumber: e.target.value });
							}}
						/>
					</InputGroup>
				</li>

				<li className="editRow flexRow">
					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text className="oswald">
								Event
							</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							className="handwritten"
							value={this.state.tempEvent}
							onChange={(e) => {
								this.setState({ tempEvent: e.target.value });
							}}
						/>
					</InputGroup>

					<InputGroup>
						<InputGroup.Prepend>
							<InputGroup.Text className="oswald">
								Date
							</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							className="handwritten"
							value={this.state.tempDate}
							onChange={(e) => {
								this.setState({ tempDate: e.target.value });
							}}
						/>
					</InputGroup>
				</li>

				<li className="editRow wealthRow">
					{_map({"Starting": {}, "Spent (-)": {}, "Earned (+)": {}, "Ending": {}}, (wealth,label) => {
						return (
							<InputGroup className="editRow flexRow">
								<InputGroup.Prepend className="leftGroup">
									<InputGroup.Text className="oswald">
										{label}
									</InputGroup.Text>
								</InputGroup.Prepend>

								<WealthEdit wealth={wealth} />

								<InputGroup
									className="calcButtonGroup rightGroup"
									onClick={(e) => {console.log("calc " + label);}}
								>
									<OverlayTrigger
										placement="top"
										overlay={<Tooltip>Condense Coinage</Tooltip>}
									>
										<InputGroup.Append>
											<InputGroup.Text id="wealth-calc">
												<span className="calcMoneyIcon"><IoIosCalculator /></span>
											</InputGroup.Text>
										</InputGroup.Append>
									</OverlayTrigger>
								</InputGroup>
							</InputGroup>
						)
					})}
				</li>

				<li>
					TO BE DONE: isDM, Wealth saving, Expend selected events, auto-calc ending money
					DELETE, MOVE
				</li>
			</ul>
		);
	};

	render() {
		const { style, className, preview } = this.props;

		if (["game", "epic"].includes(this.state.data.record)) {
			return (
				<Container
					fluid
					className={classnames(
						className,
						"gameBox",
						preview && "preview",
						!this.state.isCollapsed && "expanded",
						this.state.isEditing && "editing"
					)}
					style={style}
				>
					{this.render_titleAndCode(this.state.data.type,this.state.data.code,this.state.data.title
					)}

					<Collapse
						in={!this.state.isCollapsed}
						className="editCollapse"
						// timeout="1"
						unmountOnExit
						mountOnEnter
					>
						<div className="content">
							{!preview &&
								<Collapse
									in={this.state.isEditing}
									unmountOnExit
									mountOnEnter
								>
									<div className="editContent">
										{this.render_editData()}
									</div>
								</Collapse>
							}

							{this.render_logData()}
						</div>
					</Collapse>
				
				</Container>
			);
		} else if (this.state.data.record === "salvage") {
			// TO BE DONE
// 			return (
// 				<Container
// 					fluid
// 					className={classnames(
// 						className,
// 						"gameBox",
// 						"salvageBox",
// 						!this.state.isCollapsed && "expanded",
// 						preview && "preview"
// 					)}
// 					style={style}
// 				>
// 					{this.render_titleAndCode(
// 						this.state.data.type,
// 						null,
// 						this.state.data.title
// 					)}
// 
// 					<Collapse in={!this.state.isCollapsed}>
// 						<div className="content">
// 							{this.render_gameInfo()}
// 
// 							<div className="twoCol">
// 								<div className="leftCol arCol">
// 									SALVAGE
// 									<br />
// 									LEVEL UP?
// 								</div>
// 
// 								<div className="rightCol arCol">
// 									{this.render_wealth(
// 										this.state.data.gameWealth
// 									)}
// 								</div>
// 							</div>
// 
// 							{this.render_advNotes(true)}
// 						</div>
// 					</Collapse>
// 				</Container>
// 			);
		} else if (this.state.data.record === "notes") {
			// TO BE DONE
// 			return (
// 				<Container
// 					fluid
// 					className={classnames(
// 						className,
// 						"gameBox",
// 						"notesWealthBox",
// 						!this.state.isCollapsed && "expanded",
// 						preview && "preview"
// 					)}
// 					style={style}
// 				>
// 					{this.render_titleAndCode(
// 						this.state.data.type,
// 						null,
// 						"Notes / Wealth"
// 					)}
// 
// 					<Collapse in={!this.state.isCollapsed}>
// 						<div className="content">
// 							{this.render_gameInfo()}
// 
// 							<div className="twoCol">
// 								<div className="leftCol arCol">NOTES</div>
// 
// 								<div className="rightCol arCol">
// 									{this.render_wealth(
// 										this.state.data.gameWealth
// 									)}
// 								</div>
// 							</div>
// 
// 							{this.render_advNotes(true)}
// 						</div>
// 					</Collapse>
// 				</Container>
// 			);
		}

		return <> </>;
	}
}

export default GameLog;
