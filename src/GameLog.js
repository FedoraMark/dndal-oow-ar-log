import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _map from "lodash/map";
import _pull from "lodash/pull";
import Button from 'react-bootstrap/Button'
import Collapse from "react-bootstrap/Collapse";
import Container from "react-bootstrap/Container";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Fade from "react-bootstrap/Fade";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import { AiTwotoneDelete, AiFillCloseCircle } from "react-icons/ai";
// import { BiCaretLeft, BiCaretRight } from "react-icons/bi";
import { FaDiceD20 } from "react-icons/fa";
import { FaSave } from "react-icons/fa";
import { ImMenu2 } from "react-icons/im";
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
    constructor(props) {
        super(props);
        this.deleteButton = React.createRef();
        this.moveButton = React.createRef();
        this.cancelButton = React.createRef();
        this.saveButton = React.createRef();
    }

    static propTypes = {
        data: PropTypes.object.isRequired,
        statuses: PropTypes.object,
        collapse: PropTypes.bool,
        className: PropTypes.string,
        preview: PropTypes.bool,
        logUpdateHandler: PropTypes.func,
        deleteHandler: PropTypes.func,
        wasDm: PropTypes.bool,
        wasEpic: PropTypes.bool,
    };

    static defaultProps = {
        statuses: {},
        collapse: false,
        className: "",
        style: {},
        preview: false,
        isEditing: false,
        wasDm: false,
        wasEpic: false,
        deleteHandler: (e) => {},
    };

    state = {
        data: this.props.data,
        statusData: this.props.statuses,
        isCollapsed: this.props.collapse,
        isEditing: this.props.isEditing,
        showDeleteModal: false,
        wasDm: this.props.wasDm,
        wasEpic: this.props.wasEpic,

        // currentWealthTab: 0,

        rewardGroup0: [],
        // rewardGroup1: [], // currently unneeded

        tempEvent: "",
        tempDate: "",
        tempNotes: "",
        tempDmName: "",
        tempDmNumber: "",
        tempIsDm: this.props.wasDm,
        tempIsEpic: this.props.wasEpic,
    };

    componentDidMount() {
        !this.props.preview && this.setTempData(this.props.statuses);
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            data: newProps.data,
            statusData: newProps.statuses,
            wasDm: newProps.wasDm,
            wasEpic: newProps.wasEpic
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
            stats = {
                [code]: { ...this.state.statusData[code], ...eventStatus }
            };
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

        this.setState({
                [title]: newArray
            },
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
            isForEpic: this.state.tempIsEpic,
            notes: {
                ...this.state.statusData.notes,
                player: this.state.tempNotes.trim(),
            },
            event: this.state.tempEvent.trim(),
            date: this.state.tempDate.trim(),
            dungeonMaster: {
                name: this.state.tempIsDm ? "" : this.state.tempDmName.trim(),
                dci: this.state.tempIsDm ? "" : this.state.tempDmNumber.trim(),
                isDm: this.state.tempIsDm,
            },
        };

        this.setState({
                tempNotes: this.state.tempNotes.trim(),
                tempDmName: this.state.tempIsDm ? "" : this.state.tempDmName.trim(),
                tempDmNumber: this.state.tempIsDm ? "" : this.state.tempDmNumber.trim(),
                tempEvent: this.state.tempEvent.trim(),
                tempDate: this.state.tempDate.trim(),
                wasDm: this.state.tempIsDm,
                wasEpic: this.state.tempIsEpic
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
                tempEvent: this.getPropOrEmpty(statusObj, "event", null),
                tempDate: this.getPropOrEmpty(statusObj, "date", null),
                tempNotes: this.getPropOrEmpty(statusObj, "notes", "player"),
                tempDmName: this.getPropOrEmpty(statusObj, "dungeonMaster", "name"),
                tempDmNumber: this.getPropOrEmpty(statusObj, "dungeonMaster", "dci"),
                tempIsDm: this.state.wasDm,
                tempIsEpic: this.state.wasEpic
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
						{!this.props.preview && this.state.wasDm && (
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

        let epic = !!this.state.statusData[code] && this.state.statusData[code].isForEpic !== undefined ? this.state.statusData[code].isForEpic : this.state.data.record === "epic";
        let date = !!this.state.statusData[code] ? this.state.statusData[code].date : '';
        let event = !!this.state.statusData[code] ? this.state.statusData[code].event : '';
        let dmObj = !!this.state.statusData[code] ? {...this.state.statusData[code].dungeonMaster} : {};

        var dmStr = "";
        if (!this.state.wasDm) {
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
					{!!this.state.data.tier && (
						<li className="tier">
							<h1>Tier:</h1>
							<p>{this.state.data.tier}</p>
							{(epic || (this.props.preview && this.state.data.record === "epic")) && <p>E</p>}
						</li>
					)}
					{!!date && date !== "" && (
						<li className="date">
							<h1>Date:</h1>
							<p>{date}</p>
						</li>
					)}
					{!!event && event !== "" && (
						<li className="event">
							<h1>Event:</h1>
							<p>{event}</p>
						</li>
					)}
					{!this.props.preview && (dmStr !== "" || this.state.wasDm) && (
						<li className="dm">
							<h1>Dungeon Master:</h1>
							<p>{this.state.wasDm ? <span><FaDiceD20 /></span> : dmStr}</p>
						</li>
					)}
				</ul>
			</Container>
        );
    };

    render_advNotes = (suppressTitle) => {
        var statusNotes = this.state.statusData[this.state.data.code] !== undefined
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
            this.state.statusData[this.state.data.code] !== undefined && this.state.statusData[this.state.data.code].advancement !== undefined
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
        let footnote = !!this.state.data.dungeonMaster && this.state.data.dungeonMaster.isDm
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

    //     render_tierOverride = (tier, dflt) => {
    //         if (tier !== dflt) {
    //             return <span>Tier {tier}</span>
    //         }
    // 
    //         return <span><BiCaretRight />Tier {tier}<BiCaretLeft /></span>
    //     }

    render_editData = () => {
    	console.log({tempIsEpic: this.state.tempIsEpic, wasEpic: this.state.wasEpic});

        return (
            <ul className="editWrapper">

				<li className="editRow optionsRow">
					<InputGroup className="optionsLabel">
						<InputGroup.Prepend className="oswald">
							<InputGroup.Text><span className="condense">Log&nbsp;</span>Options</InputGroup.Text>
						</InputGroup.Prepend>
					</InputGroup>

					<div className="flexRow">
						{/* set isEpic */}
						<InputGroup className="dropdownGroup">
							<DropdownButton
								variant="light"
								title={this.state.tempIsEpic ? "Epic Event" : "AL Game"}
								alignRight
							>
								<Dropdown.Item
									href="#"
									eventKey="game"
									active={!this.state.tempIsEpic}
									onSelect={(e) => {this.setState({tempIsEpic: false});}}
								>
									This was a normal AL game
								</Dropdown.Item>
								<Dropdown.Item
									href="#"
									eventKey="epic"
									active={this.state.tempIsEpic}
									onSelect={(e) => {this.setState({tempIsEpic: true});}}
								>
									This game was for an EPIC event
								</Dropdown.Item>
							</DropdownButton>
						</InputGroup>

						{/* set isDm */}
						<InputGroup className="dropdownGroup">
							<DropdownButton
								variant="light"
								title={this.state.tempIsDm ? <>Dungeon Master <FaDiceD20 /></> : "Player"}
								alignRight
							>
								<Dropdown.Item
									href="#"
									eventKey="player"
									active={!this.state.tempIsDm}
									onSelect={(e) => {this.setState({tempIsDm: false});}}
								>
									I was a PLAYER for this game
								</Dropdown.Item>
								<Dropdown.Item
									href="#"
									eventKey="dm"
									active={this.state.tempIsDm}
									onSelect={(e) => {this.setState({tempIsDm: true});}}
								>
									I was the DM for this game
								</Dropdown.Item>
							</DropdownButton>
						</InputGroup>

						{/* set tierOverride */}
						{/* <InputGroup className="dropdownGroup"> */}
						{/* 	<DropdownButton */}
						{/* 		variant="light" */}
						{/* 		title="Tier Override" */}
						{/* 		alignRight */}
						{/* 	> */}
						{/* 		{_map([1,2,3,4], (t) => { */}
						{/* 			return ( */}
						{/* 				<Dropdown.Item */}
						{/* 					href="#" */}
						{/* 					eventKey={t} */}
						{/* 					active={false} */}
						{/* 					onSelect={(e) => {}} */}
						{/* 				> */}
						{/* 					{this.render_tierOverride(t, this.state.data.tier)} */}
						{/* 				</Dropdown.Item> */}
						{/* 			); */}
						{/* 		})} */}
						{/* 	</DropdownButton> */}
						{/* </InputGroup> */}

						{/* set useEp */}
						<InputGroup className="dropdownGroup">
							<DropdownButton
								variant="light"
								title={"useEP"}
								alignRight
							>
								<Dropdown.Item
									href="#"
									eventKey="t"
									active={false}
									onSelect={(e) => {}}
								>
									Include EP
								</Dropdown.Item>
								<Dropdown.Item
									href="#"
									eventKey="f"
									active={false}
									onSelect={(e) => {}}
								>
									Exclude EP
								</Dropdown.Item>
							</DropdownButton>
						</InputGroup>
					</div>
				</li>

				<hr />

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

				<hr />

				<li className="editRow eventsRow">
					<InputGroup className="eventLabel">
						<InputGroup.Prepend className="oswald">
							<InputGroup.Text><span className="condense">Legacy&nbsp;</span>Events</InputGroup.Text>
						</InputGroup.Prepend>
					</InputGroup>

					<div className="flexRow">

						{_map(this.state.data.legacy.events, (event,i) => {
							var selection = "Unselected";
							var variant = "light"
							if (!!this.state.statusData[this.state.data.code] && !!this.state.statusData[this.state.data.code][event.title]) {
								if (!!this.state.statusData[this.state.data.code][event.title].active) {
									selection = "Selected";
									variant = "primary";
								}

								if (!!this.state.statusData[this.state.data.code][event.title].expended) {
									selection = "Expended";
									variant = "secondary";
								}
							}

							return (
								<InputGroup key={i}>
									<InputGroup.Prepend className="eventTitle">
										<InputGroup.Text className="bookFont bold">
											{event.title}
										</InputGroup.Text>
									</InputGroup.Prepend>

									<DropdownButton as={InputGroup.Append} alignRight variant={variant} title={selection} className={selection}>
										<Dropdown.Item eventKey="0" active={selection === "Unselected"}>Unselected</Dropdown.Item>
										<Dropdown.Item eventKey="1" active={selection === "Selected"}>Selected</Dropdown.Item>
										<Dropdown.Item eventKey="-1" active={selection === "Expended"}>Expended</Dropdown.Item>
									</DropdownButton>
								</InputGroup>
							);
							
						})}

					</div>
				</li>

				<hr />

				<li className="editRow wealthRow">
					{_map({"Starting": {}, "Spent (–)": {}, "Earned (+)": {}, "Ending": {}}, (wealth,label) => {
						var condenseLabel;
					    switch (label) {
					        case "Starting":
					            condenseLabel = <>S<span className="partCondense">tarting</span></>; break;
					        case "Spent (–)":
					            condenseLabel = <><span className="partCondense">Spent&nbsp;(</span>-<span className="partCondense">)</span></>; break;
					        case "Earned (+)":
					            condenseLabel = <><span className="partCondense">Earned&nbsp;(</span>+<span className="partCondense">)</span></>; break;
					        case "Ending":
					            condenseLabel = <>E<span className="partCondense">nding</span></>; break;
					        default: condenseLabel = "";
					    }
						

						return (
							<InputGroup key={label} className="editRow flexRow">
								<InputGroup.Prepend className="leftGroup">
									<InputGroup.Text className="oswald">
										{condenseLabel}
									</InputGroup.Text>
								</InputGroup.Prepend>

								<div className="wealthEditArea">
									<WealthEdit wealth={wealth} useEp={this.state.useEp} />
								</div>

								<InputGroup
									className="calcButtonGroup rightGroup"
									onClick={(e) => {console.log("calc " + label);}}
								>
									<OverlayTrigger
										placement="top"
										overlay={<Tooltip>Condense Coinage</Tooltip>}
									>
										<InputGroup.Append>
											<InputGroup.Text>
												<span className="calcMoneyIcon"><IoIosCalculator /></span>
											</InputGroup.Text>
										</InputGroup.Append>
									</OverlayTrigger>
								</InputGroup>
							</InputGroup>
						)
					})}
				</li>

				<hr />

				<li className="editRow actionsRow">
					<InputGroup className="actionLabel">
						<InputGroup.Prepend className="oswald">
							<InputGroup.Text><span className="condense">Log&nbsp;</span>Actions</InputGroup.Text>
						</InputGroup.Prepend>
					</InputGroup>

					<div className="flexRow">
						<Button 
							href="#"
							variant="danger"
							ref={this.deleteButton}
							disabled={!this.state.isEditing}
							onClick={(e) => {this.setState({showDeleteModal: true});}}
							onMouseEnter={(e) => {this.deleteButton.current.focus()}}
							onMouseUp={(e) => {this.deleteButton.current.blur()}}
						>
							Delete<span className="buttonIcon"><AiTwotoneDelete /></span>
						</Button>

						<Button
							href="#"
							variant="info"
							ref={this.moveButton}
							disabled={!this.state.isEditing}
							onClick={(e) => {console.log("MOVE BUTTON");}}
							onMouseEnter={(e) => {this.moveButton.current.focus()}}
							onMouseUp={(e) => {this.moveButton.current.blur()}}
						>
							Move<span className="buttonIcon"><ImMenu2 /></span>
						</Button>
						
						<Button
							href="#"
							variant="secondary"
							ref={this.cancelButton}
							disabled={!this.state.isEditing}
							onClick={this.setIsEditing.bind(this, false, false)}
							onMouseEnter={(e) => {this.cancelButton.current.focus()}}
							onMouseUp={(e) => {this.cancelButton.current.blur()}}
						>
							Cancel<span className="buttonIcon"><AiFillCloseCircle /></span>
						</Button>

						<Button
							href="#"
							variant="primary"
							ref={this.saveButton}
							disabled={!this.state.isEditing}
							onClick={this.setIsEditing.bind(this, false, true)}
							onMouseEnter={(e) => {this.saveButton.current.focus()}}
							onMouseUp={(e) => {this.saveButton.current.blur()}}
						>
							Save<span className="buttonIcon"><FaSave /></span>
						</Button>
					</div>
				</li>

				{/* TO BE DONE: Save Legacy and Wealth changes, hook up calcs, auto-calc ending wealth, USE EP (local), Move */}
				
			</ul>
        );
    };

    render_deleteModal = () => {
        return (
            <Modal
				className="deleteModal"
				size={"md"}
				centered
				show={this.state.showDeleteModal}
				onHide={(e) => {this.setState({showDeleteModal: false});}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Permanently delete?</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="modalBody">
						<span
							className="fauxdesto"
							dangerouslySetInnerHTML={{
								__html: this.state.data.code
									.toUpperCase()
									.split("-")
									.join("<span class='hyphen'>-</span>"),
							}}
						/>{" "}
						<span className="fauxdesto italic">{this.state.data.title}</span>
					</div>
				</Modal.Body>
				<Modal.Footer className="flexBetwixt">
					<Button
						variant="secondary"
						onClick={(e) => {this.setState({showDeleteModal: false});}}
					>
						Cancel
					</Button>
					<Button
						variant="danger"
						onClick={(e) => {this.setState({showDeleteModal: false}, this.props.deleteHandler(this.state.data.code));}}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
        );
    }

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
					{this.render_titleAndCode(this.state.data.type,this.state.data.code,this.state.data.title)}

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

					{this.render_deleteModal()}
				
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

        return < > < />;
    }
}

export default GameLog;