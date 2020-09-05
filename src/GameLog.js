import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _each from "lodash/each";
import _find from "lodash/find";
import _isEqual from "lodash/isEqual";
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
import { useToasts } from "react-toast-notifications";

import { AiTwotoneDelete, AiFillCloseCircle, AiFillDollarCircle } from "react-icons/ai";
import { FaDiceD20, FaSave } from "react-icons/fa";
import { FiCornerDownRight } from "react-icons/fi";
import { GiPokecog, GiD4} from "react-icons/gi";
import { IoIosCalculator } from "react-icons/io";
import { RiEditCircleFill } from "react-icons/ri";

import EditButton from "common/EditButton";
import Wealth from "common/Wealth";
import WealthEdit from "common/WealthEdit";
import Event from "selectors/Event";
import Option from "selectors/Option";
import Select from "selectors/Select";
import {
	animFaster,
    heartBeat,
    dmRewardNote,
    playerRewardNote,
    getFirstObject,
    getFirstKey,
    condenseWealth,
    getTotalCopper,
    currency,
    emptyWealth,
    emptyLogWealth,
    strip,
    // salvageLevelFootnote,
    salvagePerHour,
    excludeInWealth
} from "utils/Util";

import "animate.css";
import "GameLog.scss";

const EXPENDED = -1;
const UNSELECTED = 0;
const ACTIVE = 1;

const GAME = "game";
const EPIC = "epic";
const SALVAGE = "salvage";
const NOTES = "notes";
const START = "start";

function withToast(Component) {
    return function WrappedComponent(props) {
        const toastFuncs = useToasts();
        return <Component {...props} {...toastFuncs} />;
    };
}

class GameLog extends React.Component {
    constructor(props) {
        super(props);
        this.deleteButton = React.createRef();
        this.cancelButton = React.createRef();
        this.saveButton = React.createRef();
        this.dateFieldRef = React.createRef(); 
    }

    static propTypes = {
        data: PropTypes.object.isRequired,
        statuses: PropTypes.object,
        collapse: PropTypes.bool,
        className: PropTypes.string,
        preview: PropTypes.bool,
        logUpdateHandler: PropTypes.func,
        wasDm: PropTypes.bool,
        wasEpic: PropTypes.bool,
        autoCalc: PropTypes.bool,
        startWithEdit: PropTypes.bool,
        deleteHandler: PropTypes.func,
        saveHandler: PropTypes.func,
        resetStartWithEditHandler: PropTypes.func,
    };

    static defaultProps = {
        statuses: {},
        collapse: false,
        className: "",
        style: {},
        preview: false,
        startWithEdit: false,
        wasDm: false,
        wasEpic: false,
        autoCalc: true,
        deleteHandler: () => {},
        saveHandler: () => {},
        resetStartWithEditHandler: () => {},
    };

    state = {
        data: this.props.data,
        statusData: this.props.statuses,
        isCollapsed: this.props.collapse,
        isEditing: this.props.startWithEdit,
        showDeleteModal: false,
        loaded: true,
        wasDm: this.props.wasDm,
        wasEpic: this.props.wasEpic,
        autoCalc: this.props.autoCalc,
        negativeEndingGold: false,
        isDeleting: false,
        tier: this.props.data.tier,
        titleOverride: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].titleOverride 
            ? this.props.statuses[this.props.data.code].titleOverride 
            : this.props.data.title, // should just save to DATA

        rewardGroup0: [],
        // rewardGroup1: [], // currently unneeded

        tempEvent: "",
        tempDate: "",
        tempNotes: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].notes && !!this.props.statuses[this.props.data.code].notes.player 
        	? this.props.statuses[this.props.data.code].notes.player 
        	: "",
        tempDmName: "",
        tempDmNumber: "",
        tempTier: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].tier 
            ? this.props.statuses[this.props.data.code].tier 
            : this.props.data.tier,
        tempIsDm: this.props.wasDm,
        tempIsEpic: this.props.wasEpic,
        tempAutoCalc: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].autoCalc 
        	? this.props.statuses[this.props.data.code].autoCalc
        	: this.props.autoCalc,
        tempWealth: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].wealth 
        ? {...this.props.statuses[this.props.data.code].wealth} 
        : {...emptyLogWealth},
        tempTitle: !!this.props.statuses[this.props.data.code] && !!this.props.statuses[this.props.data.code].titleOverride 
        ? this.props.statuses[this.props.data.code].titleOverride 
        : this.props.data.title, // should just save to DATA
    };

    componentDidMount() {
        if (!!this.dateFieldRef.current) {
        	this.dateFieldRef.current.defaultValue = "";
        }

        if (!this.props.preview) {
        	this.setTempData(this.props.statuses[this.props.data.code]);
        	this.saveTempData();
        }

        this.props.resetStartWithEditHandler();
    }

    componentWillReceiveProps(newProps) {
    	let statObj = newProps.statuses[newProps.data.code];

        this.setState({
            data: newProps.data,
            statusData: newProps.statuses,
            wasDm: newProps.wasDm,
            wasEpic: newProps.wasEpic,
            autoCalc: this.getPropOrEmpty(statObj,"autoCalc",null) !== "" ? statObj.autoCalc : this.state.autoCalc,
            tier: this.getPropOrEmpty(statObj,"tier",null) ? statObj.tier : this.state.data.tier,
            titleOverride: this.getPropOrEmpty(statObj,"titleOverride",null)  ? statObj.titleOverride  : this.state.titleOverride,
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

    salvageHandler = (key, val) => {
    	this.updateEventHandler({
    		missionComplete: { legacy: false, complete: val}
    	}, true);
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
        if (editing) {
            // open
            this.setTempData(this.state.statusData[this.state.data.code]);
        } else if (save) {
            // close - save
            this.saveTempData();
        } else {
            // close - cancel
            this.setTempData(this.state.statusData[this.state.data.code]);
        }

		this.state.tempAutoCalc && this.calcEndingWealth(this.state.tempWealth,true);
        this.setState({ isEditing: editing });
    };

    saveTempData = () => {
        var tempStatusData = {
            isForEpic: this.state.tempIsEpic,
            notes: {
                ...this.state.statusData.notes,
                player: !!this.state.tempNotes ? strip(this.state.tempNotes.trim()) : "",
            },
            event: this.state.tempEvent.trim(),
            date: this.state.tempDate.trim(),
            dungeonMaster: {
                name: this.state.tempIsDm ? "" : this.state.tempDmName.trim(),
                dci: this.state.tempIsDm ? "" : this.state.tempDmNumber.trim(),
                isDm: this.state.tempIsDm,
            },
            wealth: this.state.tempWealth,
            tier: this.state.tempTier,
            autoCalc: this.state.tempAutoCalc,
        };

        if ([NOTES, START, SALVAGE].includes(this.state.data.record)) {
        	tempStatusData.titleOverride = this.state.tempTitle.trim() === "" ? this.state.data.code : this.state.tempTitle.trim();
        }

        this.setState({
                tempNotes: !!this.state.tempNotes ? strip(this.state.tempNotes.trim()) : "",
                tempDmName: this.state.tempIsDm ? "" : this.state.tempDmName.trim(),
                tempDmNumber: this.state.tempIsDm ? "" : this.state.tempDmNumber.trim(),
                tempEvent: this.state.tempEvent.trim(),
                tempDate: this.state.tempDate.trim(),
                tempTitle: this.state.tempTitle.trim() === "" ? this.state.data.code : this.state.tempTitle.trim(),
            },
            this.updateEventHandler(tempStatusData, true)
        );
    };

    getPropOrEmpty = (obj, prop, child) => {
        if (!obj) { return ""; }

        if (typeof obj[prop] === "boolean") { return obj[prop]; } // return boolean prop due to !! functionalty

        if (!obj[prop]) { return ""; }

        if (child === null) { return obj[prop]; }

        return !!obj[prop][child] ? obj[prop][child] : "";
    };

    setTempData = (statusObj) => {
    	let wealthCheck = this.getPropOrEmpty(statusObj, "wealth", null);

        !!statusObj &&
            this.setState({
				// tempIsDm: this.state.wasDm,
				// tempIsEpic: this.state.wasEpic,
				// tempAutoCalc: this.state.autoCalc,
                tempWealth: wealthCheck === "" ? {...emptyLogWealth} : wealthCheck,
                tempTier: this.getPropOrEmpty(statusObj, "tier", null),
                tempEvent: this.getPropOrEmpty(statusObj, "event", null),
                tempDate: this.getPropOrEmpty(statusObj, "date", null),
                tempTitle: this.getPropOrEmpty(statusObj, "titleOverride", null),
                tempNotes: strip(this.getPropOrEmpty(statusObj, "notes", "player")),
                tempDmName: this.getPropOrEmpty(statusObj, "dungeonMaster", "name"),
                tempDmNumber: this.getPropOrEmpty(statusObj, "dungeonMaster", "dci"),
            });
    };

    setEvent = (eTitle, eState) => {
	    var existingData = !!this.state.statusData[this.state.data.code] && !!this.state.statusData[this.state.data.code][eTitle]
	    	? { ...this.state.statusData[this.state.data.code][eTitle] }
	    	: {};

	    switch (eState) {
	        case UNSELECTED:
	            existingData[eTitle] = {
	                ...existingData,
	                legacy: false,
	                active: false,
	                expended: false,
	                selections: [],
	                option: -1,
	            };
	            break;
	        case ACTIVE:
	            existingData[eTitle] = {
	                ...existingData,
	                legacy: true,
	                active: true,
	                expended: false,
	            };
	            break;
	        case EXPENDED:
	            existingData[eTitle] = {
	                ...existingData,
	                legacy: true,
	                active: true,
	                expended: true,
	            };
	            break;
	        default:
	            console.warn( "WARNING: Invalid state (" + eState + ") for event " + eTitle + " in " + this.state.data.code );
	            return;
	    }

	    this.props.addToast(("Updated " + eTitle.toUpperCase()), { appearance: "info" });
	    this.updateEventHandler(existingData, true);
	};

	updateWealthHandler = (wealthTypeObj, type) => {
		var newTempWealth = {...this.state.tempWealth};
		newTempWealth[type] = wealthTypeObj;

		if (this.state.tempAutoCalc && this.state.data.record !== START) {
			newTempWealth = {...newTempWealth, ending: this.calcEndingWealth(newTempWealth)};
		}

		this.setState({tempWealth: newTempWealth});
	}

	condenseCoinage = (type) => {
		var newCoinage =  condenseWealth(getTotalCopper(this.state.tempWealth[type]),true);

		if (_isEqual(newCoinage,this.state.tempWealth[type]) || (getTotalCopper(newCoinage) === 0 && getTotalCopper(this.state.tempWealth[type]) === 0)) {
			this.props.addToast(("No change to coinage in " + type.toUpperCase()), { appearance: "info" });
		} else {
			this.updateWealthHandler(newCoinage,type);
			this.props.addToast(("Coinage condensed in " + type.toUpperCase()), { appearance: "success" });
		}
	}

	calcEndingWealth = (fullWealthObj,suppressToast = false) => {
	    var endingWealthObj = { ...emptyWealth };

	    // calculate each column and save to opject
	    if (!!fullWealthObj) {
		    _each(currency, (p) => {
		        var starting = !!fullWealthObj["starting"] ? fullWealthObj["starting"][p] : 0;
		        var spent = !!fullWealthObj["spent"] ? fullWealthObj["spent"][p] : 0;
		        var earned = !!fullWealthObj["earned"] ? fullWealthObj["earned"][p] : 0;

		        starting = !!starting ? starting : 0;
		        spent = !!spent ? spent : 0;
		        earned = !!earned ? earned : 0;

		        endingWealthObj[p] = starting - spent + earned;
		    });
		}

	    let valDigits = {cp: 10, sp: 5, ep: 2, gp: 10};

	    // remove negatives up to PP
	    _each(currency, (p,i) => {
	        while(endingWealthObj[p] < 0 && i < 4) {
	            let nextP = currency[i+1];

	            endingWealthObj[nextP]--;
	            endingWealthObj[p] += valDigits[p];
	        }
	    })

	    if (endingWealthObj.pp < 0) {
	        !suppressToast && !this.state.negativeEndingGold && this.props.addToast("Ending Gold results in negative value", { appearance: "error" });
	        this.setState({negativeEndingGold: true});
	        return {...emptyWealth};
	    } else if (this.state.negativeEndingGold) {
	    	!suppressToast && this.props.addToast("You are no longer in debt", { appearance: "success" });
	    	this.setState({negativeEndingGold: false});
	    }

	    return endingWealthObj;
	};

	fauxdestoHyphenFix = (str) => {
		return str.split("-").join("<span class='hyphen'>-</span>");
	}

    //RENDERERS
    render_titleAndCode = (code, title, suppressCode) => {
        const { preview } = this.props;

        var leftIcon;

        switch(this.props.data.record) {
            case SALVAGE:
                leftIcon = <GiPokecog className="titleIcon leftIcon" />
                break;
            case GAME:
            case EPIC:
                leftIcon = <GiD4 className="titleIcon leftIcon" />
                break;
            case NOTES:
                leftIcon = <RiEditCircleFill className="titleIcon leftIcon" />
                break;
            case START:
                leftIcon = <AiFillDollarCircle className="titleIcon leftIcon" />
                break;
            default:
                leftIcon = <></>;
        }

        return (
            <div
				className={classnames(
					"titleWrapper",
					!preview && "sticky",
					this.state.isDeleting && "deleting"
				)}
			>
				{!preview && (
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
                                hide={!this.state.isEditing}
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
                        {!preview && leftIcon}

						<div className="titleText">
							{!suppressCode && !!code && (
								<span
									className="code"
									dangerouslySetInnerHTML={{__html: this.fauxdestoHyphenFix(code)}}
								/>
							)}
							<span 
								className={classnames("fauxdesto title", [GAME, EPIC, SALVAGE].includes(this.state.data.record) && "italic")} 
								dangerouslySetInnerHTML={{__html: this.fauxdestoHyphenFix(title)}} 
							/>
						</div>

						{!preview && this.state.wasDm && <FaDiceD20 className="titleIcon rightIcon" />}
					</span>
				</h1>
			</div>
        );
    };

    render_gameInfo = () => {
        let code = this.state.data.code;

        let epic = !!this.state.statusData[code] && !!this.state.statusData[code].isForEpic ? this.state.statusData[code].isForEpic : this.state.data.record === "epic";
        let date = !!this.state.statusData[code] ? this.state.statusData[code].date : '';
        let event = !!this.state.statusData[code] ? this.state.statusData[code].event : '';
        let dmObj = !!this.state.statusData[code] ? {...this.state.statusData[code].dungeonMaster} : {};

        let showTier = this.props.preview ? this.state.tempTier : this.state.tier;

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
					{showTier > 0 && (
						<li className="tier">
							<h1>Tier:</h1>

							<OverlayTrigger
								placement="top"
								overlay={<Tooltip>Tier {showTier}</Tooltip>}
							>
								<p>{showTier}</p>
							</OverlayTrigger>

							{(epic || (this.props.preview && this.state.data.record === EPIC)) && 
								<OverlayTrigger
									placement="top"
									overlay={<Tooltip>Epic</Tooltip>}
								>
									<p className="fauxdesto">E</p>
								</OverlayTrigger>
							}
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

        var allNotes = {...this.state.data.notes};
        if (!!this.state.statusData[this.state.data.code] && this.state.statusData[this.state.data.code].notes) {
        	_each({...this.state.statusData[this.state.data.code].notes}, (note,type) => {
        			allNotes[type] = note;
        	});        	
        }

        if (Object.keys(allNotes).length === 0) {
        	return <></>;
        }

    	let aNote = _find(allNotes, (n) => {
    		return n.trim() !== "";
    	});

        if (!aNote) {
        	return <></>;
        }

        return (
            <Container className="notesWrapper wrapper">
				{!suppressTitle && (
					<h1 className="sectionTitle">{this.state.data.record === SALVAGE ? "Mission" : "Adventure"} Notes</h1>
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

    render_advancement = (isSalvageMission) => {
        const { preview } = this.props;

        let isSelected = !!this.state.statusData[this.state.data.code] && !!this.state.statusData[this.state.data.code].advancement
            ? this.state.statusData[this.state.data.code].advancement.active 
            : false;

        let missionComplete = !!this.state.statusData[this.state.data.code] && !!this.state.statusData[this.state.data.code].missionComplete
            ? this.state.statusData[this.state.data.code].missionComplete.complete 
            : false;

        let hoursPlayed = !!this.state.statusData[this.state.data.code] && !!this.state.statusData[this.state.data.code].salvageHours
            ? this.state.statusData[this.state.data.code].salvageHours.hours 
            : 0;

        let salvageRate = missionComplete ? salvagePerHour[this.state.tier-1] : salvagePerHour[this.state.tier-1]/2;

        var totalPlayed = isNaN(salvageRate) && isNaN(salvageRate) ? 0 : hoursPlayed * salvageRate;

        return (
            <Container className="advWrapper wrapper">
				<h1 className="sectionTitle">Advancement{isSalvageMission && " & Salvage"}</h1>
				<div className="box">
					<span className="salvageContent">
						<span className="salvageAdv">
							{isSalvageMission &&
								<Select
									label="Successfully Completed Mission"
									type="checkbox"
									isBold
									isSelected={missionComplete}
									isDisabled={preview || this.state.isEditing}
									selectHandler={this.salvageHandler}
								/>
							}

							<Select
								label={isSalvageMission ? "Character&nbsp;Advancement (Level&nbsp;Up?)" : this.state.data.advancement.label}
								type="checkbox"
								isBold
								indent={isSalvageMission}
								isSelected={isSelected}
								isDisabled={preview || this.state.isEditing || (isSalvageMission && !missionComplete)}
								selectHandler={this.advancementHandler}
							/>
						</span>

						{isSalvageMission &&
							<div className="salvageRow">
								<InputGroup>
									<InputGroup.Prepend>
										<InputGroup.Text className={classnames("bookFont bold")}>
											<FiCornerDownRight />&nbsp;Salvage Earned&nbsp;
											<span key={salvageRate} className={classnames(animFaster, heartBeat)} style={{animationDuration: this.state.loaded ? ".5s" : "1ms"}}>
												({salvageRate}/hr)
											</span>
										</InputGroup.Text>
									</InputGroup.Prepend>
									<InputGroup.Append>
										<InputGroup.Text className={classnames("bookFont bold")}>
											{totalPlayed}
										</InputGroup.Text>
									</InputGroup.Append>
								</InputGroup>

								<InputGroup>
									<InputGroup.Prepend>
										<InputGroup.Text className="bookFont bold">Hours Played (to max)</InputGroup.Text>
									</InputGroup.Prepend>
									<InputGroup.Append>
										<Form.Control
											className="handwritten textBoxCenter"
											type="number"
											pattern="[0-9]*"
											min="0"
											max="24"
											value={hoursPlayed}
											onKeyDown={(e) => {excludeInWealth.includes(e.key) && e.preventDefault();}}
											onChange={(e) => {
												var limit = e.target.value > 24 ? 24 : e.target.value;
												this.updateEventHandler({salvageHours: {hours: limit}},true);
											}}
										/>
									</InputGroup.Append>
								</InputGroup>
							</div>
						}
					</span>

					{/* {isSalvageMission && <hr />} */}

					{!isSalvageMission && 
						<p
							className="bookFont footnote"
							dangerouslySetInnerHTML={{ __html: this.state.data.advancement.footnote }}
							// dangerouslySetInnerHTML={{ __html: (isSalvageMission ? salvageLevelFootnote : this.state.data.advancement.footnote) }}
						/>
					}
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

    render_wealth = (suppressTitle = false) => {
    	let wealthObj = !!this.state.statusData && !!this.state.statusData[this.state.data.code] ? {...this.state.statusData[this.state.data.code].wealth} : null;

        return (
            <Container className="wealthWrapper wrapper">
				{!suppressTitle && <h1 className="sectionTitle">Character Wealth</h1>}

				<Container className="wealthContent box">
					<div className="header cell">Starting Gold</div>
					<div className="amount cell">
						<span className="val">
							<Wealth
								isEmpty={wealthObj === null}
								wealthObj={ wealthObj === null ? {} : wealthObj.starting }
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
								isEmpty={wealthObj === null}
								wealthObj={ wealthObj === null ? {} : wealthObj.spent }
							/>
						</span>
					</div>

					<div className="header cell">Gold Earned (+)</div>
					<div className="amount cell">
						<span className="val">
							<Wealth
								colorless
								isEmpty={wealthObj === null}
								wealthObj={ wealthObj === null ? {} : wealthObj.earned }
							/>
						</span>
					</div>

					<div className="header cell bottom">Ending Gold</div>
					<div className="amount cell bottom">
						<span className="val">
							<Wealth
								isEmpty={wealthObj === null}
								wealthObj={ wealthObj === null ? {} : wealthObj.ending }
								error={this.state.negativeEndingGold}
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
						{this.render_advancement(false)}
						{this.render_rewards()}
						{this.render_wealth()}
					</div>

					<div className="rightCol arCol">{this.render_legacy()}</div>
				</div>
			</div>
        );
    };

    render_editLogData = () => {
        return (
            <ul className="editWrapper">

            	{/* OPTIONS */}
				{this.render_editOptionsRow()}

				<hr />

				{/* PLAYER NOTES */}
				{this.render_editPlayerNotes()}

				{/* DUNGEON MASTER GROUP */}
				{this.render_editDmGroup()}

				{/* EVENT AND DATE GROUP */}
				{this.render_eventDateGroup()}

				<hr />

				{/* LEGACY EVENTS */}
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
									selection = "Active";
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
										<Dropdown.Item 
											eventKey={UNSELECTED} 
											active={selection === "Unselected"} 
											onSelect={this.setEvent.bind(this,event.title,UNSELECTED)}
										>
											Unselected
										</Dropdown.Item>
										<Dropdown.Item 
											eventKey={ACTIVE} 
											active={selection === "Active"} 
											onSelect={this.setEvent.bind(this,event.title,ACTIVE)}
										>
											Active
										</Dropdown.Item>
										<Dropdown.Item 
											eventKey={EXPENDED} 
											active={selection === "Expended"} 
											onSelect={this.setEvent.bind(this,event.title,EXPENDED)}
										>
											Expended
										</Dropdown.Item>
									</DropdownButton>
								</InputGroup>
							);
							
						})}

					</div>
				</li>

				<hr />

				{/* WEALTH */}
				{this.render_editWealthRow()}

				<hr />

				{/* ACTIONS */}
				{this.render_editActionsRow()}
				
			</ul>
        );
    };

    render_editSalvageData = () => {
    	return (
            <ul className="editWrapper">
            	{/* OPTIONS */}
				{this.render_editOptionsRow()}

				<hr />

				{/* CODE AND TITLE GROUP */}
				{this.render_editCodeAndTitleGroup()}

				{/* PLAYER NOTES */}
            	{this.render_editPlayerNotes()}

				{/* DUNGEON MASTER GROUP */}
				{this.render_editDmGroup()}

				{/* EVENT AND DATE GROUP */}
				{this.render_eventDateGroup()}

				<hr />

				{/* WEALTH */}
				{this.render_editWealthRow()}

				<hr />

            	{/* ACTIONS */}
				{this.render_editActionsRow()}
            </ul>
        );
    }

    render_editNotesData = () => {
    	return (
            <ul className="editWrapper notes">
            	{/* NOTES OPTIONS */}
            	{this.state.data.record === NOTES && 
            		<>
            			{this.render_editOptionsRow()}
            			<hr />
            		</>
            	}

            	{/* CODE AND TITLE GROUP */}
				{this.render_editCodeAndTitleGroup()}

				{/* PLAYER NOTES */}
            	{this.render_editPlayerNotes()}

            	<hr />

            	{/* NOTES WEALTH */}
            	{this.render_editWealthRow(this.state.data.record === START)}

            	<hr />

            	{/* ACTIONS */}
				{this.render_editActionsRow(this.state.data.record === START)}
            </ul>
        );
    }

    render_eventDateGroup = () => {
    	return (
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
						type="date"
						value={this.state.tempDate}
						ref={this.dateFieldRef}
						onChange={(e) => {
							this.setState({ tempDate: e.target.value });
							
							const target = e.target
							setTimeout(()=>{
						      target.defaultValue = "";
						    }, 100);

						}}
					/>
				</InputGroup>
			</li>
		);
    }

    render_editCodeAndTitleGroup = () => {
    	return (
    		<li className="editRow flexRow">
				<InputGroup>
					<InputGroup.Prepend>
						<InputGroup.Text className="oswald">
							Title
						</InputGroup.Text>
					</InputGroup.Prepend>
					<Form.Control
						className="handwritten"
						placeholder={this.state.data.code}
						value={this.state.tempTitle}
						onChange={(e) => {this.setState({ tempTitle: e.target.value });}}
					/>
				</InputGroup>

				<OverlayTrigger
					placement="top"
					overlay={<Tooltip>Unique Idenifier</Tooltip>}
				>
					<InputGroup>
					
						<InputGroup.Prepend>
							<InputGroup.Text className="oswald">
								Code
							</InputGroup.Text>
						</InputGroup.Prepend>
						<Form.Control
							className="handwritten"
							value={this.state.data.code}
							disabled
						/>
					</InputGroup>
				</OverlayTrigger>
			</li>
		);
    }

    render_editDmGroup = () => {
    	return (
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
    	);
    }

    render_editWealthRow = (isStartingLog = false) => {
    	let labelArr = isStartingLog ? {"firstStart": {}} : {"Starting ": {}, "Spent (–)": {}, "Earned (+)": {}, "Ending ": {}};
    	return (
    		<li className="editRow wealthRow">
				{_map(labelArr, (wealth,label) => { // leave spaces
					
					var condenseLabel;
				    switch (label) {
				    	case "firstStart": 
				    		condenseLabel = <><span className="partCondense">Wealth</span><span className="_partCondense">$</span></>; break;
				        case "Starting ": // leave space
				            condenseLabel = <>S<span className="partCondense">tarting</span></>; break;
				        case "Spent (–)":
				            condenseLabel = <><span className="partCondense">Spent&nbsp;(</span>-<span className="partCondense">)</span></>; break;
				        case "Earned (+)":
				            condenseLabel = <><span className="partCondense">Earned&nbsp;(</span>+<span className="partCondense">)</span></>; break;
				        case "Ending ": // leave space
				            condenseLabel = <>E<span className="partCondense">nding</span></>; break;
				        default: condenseLabel = "";
			    	}

			    	let displayLabel = label.toLowerCase().substr(0,label.indexOf(" "));
    				let error = !isStartingLog && this.state.tempAutoCalc && displayLabel === "ending" && this.state.negativeEndingGold;

			    	return (
			    		<InputGroup key={label} className={classnames("editRow flexRow", error && "error")}>
							<InputGroup.Prepend className="leftGroup">
								<InputGroup.Text className="oswald">
									{condenseLabel}
								</InputGroup.Text>
							</InputGroup.Prepend>

							<div className="wealthEditArea">
								<WealthEdit 
									fullWealth={this.state.tempWealth} 
									useEp={this.state.useEp} 
									type={displayLabel} 
									updateHandler={this.updateWealthHandler}
									disabled={!isStartingLog && this.state.tempAutoCalc && displayLabel === "ending"}
									error={error}
									isStart={isStartingLog}
								/>
							</div>

							<InputGroup
								className={classnames("calcButtonGroup rightGroup",!isStartingLog && this.state.tempAutoCalc && displayLabel === "ending" && "disabled")}
								onClick={this.condenseCoinage.bind(this, isStartingLog ? "ending" : displayLabel)}
							>
								<OverlayTrigger
									placement="top-end"
									overlay={<Tooltip>Condense{isStartingLog ? " " : " " + displayLabel.charAt(0).toUpperCase() + displayLabel.slice(1)} Coinage</Tooltip>}
								>
									<InputGroup.Append className="toBeButton">
										<InputGroup.Text>
											<span className="calcMoneyIcon"><IoIosCalculator /></span>
										</InputGroup.Text>
									</InputGroup.Append>
								</OverlayTrigger>
							</InputGroup>
						</InputGroup>
			    	);
			    })}
		    </li>
		);
    }

    render_editOptionsRow = () => {
	    return (	
	    	<li className="editRow optionsRow">
				<InputGroup className="optionsLabel">
					<InputGroup.Prepend className="oswald">
						<InputGroup.Text><span className="condense">Log&nbsp;</span>Options</InputGroup.Text>
					</InputGroup.Prepend>
				</InputGroup>

				<div className="flexRow">
					{/* set tier */}
					{[SALVAGE].includes(this.state.data.record) &&
						<InputGroup className="dropdownGroup">
							<DropdownButton
								variant="light"
								title={this.state.tempTier > 0 ? "Tier " + this.state.tempTier : "No Tier Set"}
								alignRight
							>
								{_map([1,2,3,4], (t) => {
									return (
										<Dropdown.Item
											href="#"
											key={t}
											eventKey={t}
											active={this.state.tempTier === t}
											onSelect={(e) => {this.setState({tempTier: t});}}
										>
											Tier {t}
										</Dropdown.Item>
									);
								})}
							</DropdownButton>
						</InputGroup>
					}

					{/* set isEpic */}
					{[GAME, EPIC, SALVAGE].includes(this.state.data.record) &&
						<InputGroup className="dropdownGroup">
							<DropdownButton
								variant="light"
								title={this.state.tempIsEpic ? <>Epic Event <span className="dotE fauxdesto">E</span></> : "AL Game"}
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
					}

					{/* set isDm */}
					{[GAME, EPIC, SALVAGE].includes(this.state.data.record) &&
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
					}

					{/* set autoCalc */}
					<InputGroup className="dropdownGroup">
						<DropdownButton
							variant="light"
							title={this.state.tempAutoCalc ? "Auto Calculate Gold" : "Manually Enter Gold"}
							alignRight
						>
							<Dropdown.Item
								href="#"
								eventKey="auto"
								active={this.state.tempAutoCalc}
								onSelect={(e) => {this.setState({tempAutoCalc: true});}}
							>
								Auto<span className="condense"> Calculate</span> Ending Gold
							</Dropdown.Item>
							<Dropdown.Item
								href="#"
								eventKey="manu"
								active={!this.state.tempAutoCalc}
								onSelect={(e) => {this.setState({tempAutoCalc: false});}}
							>
								Manual<span className="condense">ly Enter</span> Ending Gold
							</Dropdown.Item>
						</DropdownButton>
					</InputGroup>
				</div>
			</li>
		);
    }

    render_editPlayerNotes = () => {
    	return (
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
    	);
    }

    render_editActionsRow = (suppressMove = false) => {
    	return (
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
		);
    }

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
						{[GAME, EPIC].includes(this.state.data.record) && 
							<>
								<div
									className="fauxdesto nowrap"
									dangerouslySetInnerHTML={{__html: this.fauxdestoHyphenFix(this.state.data.code.toUpperCase()) }}
								/>
								{" "} {/* THIS SPACE ON PURPOSE */}
							</>
						}
						<div 
							className={classnames("fauxdesto", [GAME, EPIC, SALVAGE].includes(this.state.data.record) && "italic")} 
							style={{fontSize: "2.8rem", lineHeight: "1", marginTop: [GAME, EPIC].includes(this.state.data.record) ? "-.5rem" : "0"}}
							dangerouslySetInnerHTML={{__html: this.fauxdestoHyphenFix( [GAME, EPIC].includes(this.state.data.record) ? this.state.data.title : this.state.tempTitle) }}
						/>
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
						onClick={(e) => {this.setState({showDeleteModal: false, isDeleting: true}, this.props.deleteHandler(this.state.data.code));}}
					>
						Delete
					</Button>
				</Modal.Footer>
			</Modal>
        );
    }

    // ***** MAIN RENDER *****
    render() {
        const { style, className, preview } = this.props;
        let code = this.state.data.code;
        let title = this.state.titleOverride;

        let wealthObj = !!this.state.statusData && !!this.state.statusData[this.state.data.code] 
        	? {...this.state.statusData[this.state.data.code].wealth}
        	: null ;


        if ([GAME, EPIC].includes(this.state.data.record)) {
        	// GAME AND EPIC LOG
            return (
                <Container
					fluid
					className={classnames(
						className,
						"gameBox",
						!this.state.isCollapsed && "expanded",
						this.state.isEditing && "editing",
						preview && "preview",
					)}
					style={style}
				>
					{!this.props.preview && <div className={classnames("stickyCover", this.state.isDeleting && "deleting")} />}

					{this.render_titleAndCode(code,title,false)}

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
										{this.render_editLogData()}
									</div>
								</Collapse>
							}

							{this.render_logData()}
						</div>
					</Collapse>

					{this.render_deleteModal()}
				
				</Container>
            );
        } else if (this.state.data.record === SALVAGE) {
        	// SALVAGE MISSION LOG
			return (
				<Container
					fluid
					className={classnames(
						className,
						"gameBox",
						"salvageBox",
						!this.state.isCollapsed && "expanded",
						this.state.isEditing && "editing",
						preview && "preview",
					)}
					style={style}
				>

					{!this.props.preview && <div className={classnames("stickyCover", this.state.isDeleting && "deleting")} />}

					{this.render_titleAndCode(null,title)}

					<Collapse
						in={!this.state.isCollapsed}
						className="editCollapse"
						// timeout="1"
						unmountOnExit
						mountOnEnter
                        onEntered={() => {this.setState({loaded: true});}}
                        onExit={() => {this.setState({loaded: false});}}
					>
						<div className="content">
							<Collapse
								in={this.state.isEditing}
								unmountOnExit
								mountOnEnter
							>
								<div className="editContent">
									{this.render_editSalvageData()}
								</div>
							</Collapse>

							<div className="logDataWrapper salvageInfoWrapper">
								{this.render_gameInfo()}
								{this.render_advNotes(false)}

								<div className="twoCol">
									<div className="leftCol arCol">
										{this.render_advancement(true)}
									</div>

									<div className="rightCol arCol">
										{this.render_wealth()}
									</div>
								</div>
							</div>

						</div>
					</Collapse>

					{this.render_deleteModal()}
				</Container>
			);
        } else if ([NOTES, START].includes(this.state.data.record)) {
        	// NOTES AND START LOG
			return (
				<Container
					fluid
					className={classnames(
						className,
						"gameBox",
						"notesWealthBox",
						!this.state.isCollapsed && "expanded",
						this.state.isEditing && "editing",
						preview && "preview",
					)}
					style={style}
				>

					{!this.props.preview && <div className={classnames("stickyCover", this.state.isDeleting && "deleting")} />}

					{this.render_titleAndCode(code,title,true)}

					<Collapse
						in={!this.state.isCollapsed}
						className="editCollapse"
						// timeout="1"
						unmountOnExit
						mountOnEnter
					>
						<div className="content">
							<Collapse
								in={this.state.isEditing}
								unmountOnExit
								mountOnEnter
							>
								<div className="editContent">
									{this.render_editNotesData()}
								</div>
							</Collapse>

							<div className="logDataWrapper">
								<div className={classnames("twoCol notesLog", this.state.data.record === START && "startLog")}>
									{!!this.state.tempNotes !== "" &&
                                        <div className="rightCol arCol">
                                            {this.render_advNotes(true)}
                                        </div>
                                    }

                                    <div className="leftCol arCol">
										{this.state.data.record === NOTES ? this.render_wealth(true) :
											<Container className="wealthWrapper wrapper">
												<Container className="wealthContent startingOnly box">
													<div className="header cell bottom">Starting Wealth</div>
													<div className="amount cell bottom">
														<span className="val">
															<Wealth
																isEmpty={wealthObj === null}
																wealthObj={ wealthObj === null ? {} : wealthObj.ending }
																error={this.state.negativeEndingGold}
															/>
														</span>
													</div>
												</Container>
											</Container>
										}
									</div>
								</div>
							</div>
							

						</div>
					</Collapse>

					{this.render_deleteModal()}
				</Container>
			);
        }

        return <></>;
    }
}

export default withToast(GameLog);