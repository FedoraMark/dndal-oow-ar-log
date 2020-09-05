import React from "react";
import classnames from "classnames";
import SideNav, { NavItem, NavIcon, NavText } from "@trendmicro/react-sidenav";
import arrayMove from "array-move";
import downloadjs from "downloadjs";
import _each from "lodash/each";
import _filter from "lodash/filter";
import _find from "lodash/find";
import _findIndex from "lodash/findIndex";
import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Container from "react-bootstrap/Container";
import Fade from "react-bootstrap/Fade";
import Form from "react-bootstrap/Form";
import Jumbotron from "react-bootstrap/Jumbotron";
import Modal from "react-bootstrap/Modal";
import ClickOutside from "react-click-outside";
import { useToasts } from "react-toast-notifications";

import { AiFillDollarCircle } from "react-icons/ai";
import { BiImport, BiExport, BiReset } from "react-icons/bi";
// import { FaDiceD20 } from "react-icons/fa";
import { GiPokecog, GiD4} from "react-icons/gi";
import { GrSettingsOption } from "react-icons/gr";
import { ImMenu } from "react-icons/im";
import { RiEditCircleFill } from "react-icons/ri";

import EditButton from "common/EditButton";
import Player from "common/Player";
import Summary from "common/Summary";
import GameLog from "GameLog";
import {
	fadeInUp,
	fadeIn,
	getFirstObject,
	getFirstKey,
	emptyWealth,
	emptyLogWealth,
	startingWealthLog,
	startingWealthStatus,
	getTier,
} from "utils/Util";

import "AdvRecordLog.scss";
import "animate.css";
import "@trendmicro/react-sidenav/dist/react-sidenav.css";

import games_oow from "./data/oowGames.json";
// import chara_SamPel from "./data/SamPel.json";

const GAME = "game";
const EPIC = "epic";
const SALVAGE = "salvage";
const NOTES = "notes";
const START = "start";

const GENERIC_CLASS = {Player: 1};

const resetTime = 250; //ms

function withToast(Component) {
    return function WrappedComponent(props) {
        const toastFuncs = useToasts();
        return <Component {...props} {...toastFuncs} />;
    };
}

class AdvRecordLog extends React.Component {
	constructor(props) {
        super(props);
        this.inputRef = React.createRef();
    }

	state = {
		charData: {},
	    optionsData: {},
	    gameData: [],
	    statusData: [],

	    gameDataReorder: [],
	    statusDataReorder: [],
	    
	    showAddRecordArea: false,
	    loaded: false,
	    isSidebarOpen: false,
	    eventArr: [],
	    deleteCode: "",
	    openEditorCode: "",
	    showReorderModal: false,
	    finishedMoving: false,
	    showOptionsModal: false,
	    changingData: false,
	};

	componentDidMount() {
		this.resetData(true,true);
		this.setState({ loaded: true });
	}

	//FUNCTIONS
	savePlayerDataHandler = (playerObj, optionsObj) => {
		this.setState({charData: playerObj, optionsData: optionsObj});
	}

	toggleAddRecordArea = () => {
		this.setState({ showAddRecordArea: !this.state.showAddRecordArea });
	};

	addStartingWealthRecord = (e) => {
		e.stopPropagation(); //prevent addRecord() from being fired

		var newGameData = [...this.state.gameData];
		newGameData.unshift({...startingWealthLog})

		var newStatusData = [...this.state.statusData];
		newStatusData.unshift({...startingWealthStatus})

		this.setState({
			openEditorCode: startingWealthStatus.code,
			gameData: newGameData,
			statusData: newStatusData,
		});
		this.toggleAddRecordArea();
	};

	addRecord = (recordObj, openEditor, record) => {
		var newLogData = {...recordObj};
		var newLogStatus = {[recordObj.code]: {wealth: this.getPrevEndingWealth()}};
		var newEditorCode = openEditor ? recordObj.code : -1;
		var newCode = recordObj.code;

		// NOTES and salvage logs
		if ([NOTES, SALVAGE].includes(record)) {
			newCode = record + "_" + Math.random().toString(36).substr(2, 9);;
			let displayType = record === NOTES ? "Wealth and Notes" : "Salvage Mission";

			newLogData = {
				record: record,
				type: displayType,
				title: displayType + " Log",
				code: newCode,
				tier: this.getInfoTier(),
			};
			newLogStatus = {
				[newCode]: {
					notes: {
						player:
							record === NOTES
								? "Wealth changes and notes for between sessions."
								: "Salvage mission notes.",
					},
					tier: this.getInfoTier(),
					titleOverride: displayType + " Log",
					wealth: this.getPrevEndingWealth(),
				},
			};
			newEditorCode = newCode
		}

		var newGameData = [...this.state.gameData];
		newGameData.push(newLogData);

		var newStatusData = [...this.state.statusData];
		newStatusData.push(newLogStatus);

		this.setState({ openEditorCode: newEditorCode, gameData: newGameData, statusData: newStatusData});
		this.toggleAddRecordArea();
	};

	getInfoTier = () => {
		if (this.state.charData.tier !== 0) { return this.state.charData.tier};

		var totalLevels = 0;
		_each(this.state.charData.classes, (lv) => {
			totalLevels += lv;
		})

		return getTier(totalLevels);
	}

	getPrevEndingWealth = () => {
		var startingWealth = {...emptyLogWealth};

		if (this.state.gameData.length > 0) {
			let prevLogObj = getFirstObject(_find(this.state.statusData, (s,c) => {
				return getFirstKey(s) === this.state.gameData[this.state.gameData.length-1].code;
			}));

			if (!!prevLogObj.wealth && !!prevLogObj.wealth.ending && !!Object.keys(prevLogObj.wealth.ending).length > 0) {
				startingWealth.starting = prevLogObj.wealth.ending;
				startingWealth.ending = prevLogObj.wealth.ending; // auto calc ending
			}
		}

		return startingWealth;
	}

	toggleExpendedEvent = (code, title) => {		
		var newStatusData = [...this.state.statusData];
		let index = _findIndex(newStatusData, (e) => {
			return getFirstKey(e) === code;
		});

		newStatusData[index][code][title].expended = newStatusData[index][code][title].expended === true ? false : true;

		this.setState({statusData: newStatusData});
	}

	updateLogStatus = (logStatusObj) => {
		let statusArr = [...this.state.statusData];

		let changeIndex = _findIndex(statusArr, (o) => {
			return getFirstKey(o) === getFirstKey(logStatusObj);
		});

		if (changeIndex === -1) {
			statusArr.push(logStatusObj);
		} else {
			statusArr[changeIndex] = logStatusObj;
		}


		this.setState({ statusData: statusArr });
	};

	// get detailed status info for given code and event title
	getStatusInfo = (code, title) => {

		let statusInfo = _find(this.state.statusData, (o) => {
			return getFirstKey(o) === code;
		})[code][title];

		let recordData = _find(games_oow.records, (r) => {
			return r.code === code;
		});

		let eventData = _find(recordData.legacy.events, (e) => {
			return e.title === title;
		});

		//description, title, checkboxes, radios, table
		var eventDetails = {};
		if (statusInfo.active && statusInfo.legacy) {
			let expendedBool = statusInfo.expended !== undefined ? statusInfo.expended : false; // TEMPORARY

			eventDetails = {title: title, code: code, description: eventData.description, option: null, selections: [], expended: expendedBool}

			if (statusInfo.option !== undefined && statusInfo.option !== -1) {
				if (eventData.radios) {
					eventDetails.option = eventData.radios[statusInfo.option];
				} else if (eventData.table) {
					eventDetails.option = eventData.table[statusInfo.option];
				}
			}

			if (statusInfo.selections && statusInfo.selections.length > 0) {
				eventDetails.selections = [];
				statusInfo.selections.forEach((s) => {
					eventDetails.selections.push(eventData.checkboxes[s])
				});
				eventDetails.selections.sort();
			}
		}

		return eventDetails; 
	};

	setSidebarInfo = (getActiveLength) => {
		var eventArr = [];

		this.state.statusData.forEach((log) => {
			_map(getFirstObject(log), (event, title) => {
				if (!!event && event.legacy) {
					eventArr.push({title: title, code: getFirstKey(log), event: event});
				}
			})
		});

		// return current length of active only
		if (getActiveLength) {
			return _filter(eventArr, (a) => {
				return a.event.expended !== true;
			}).length;
		}

		eventArr = _sortBy(
		    _sortBy(eventArr, (o) => {
		        return o.title.toUpperCase();
		    }),
		    (o) => {
		        return o.event.expended === true;
		    }
		);

		this.setState({eventArr: eventArr});
	}

	handleDelete = (code) => {
		this.setState({deleteCode: code});
	}

	removeLog = (code) => {
		let index = this.state.gameData.findIndex((c) => {
			return c.code === code
		});

		if (index < 0) {
			return console.error("WARNING: Code " + code + " not found in game list!");
		}

		var newGameData = [...this.state.gameData];
		var newStatusData = [...this.state.statusData];

		let statusObj = getFirstObject(_find(newStatusData, (s) => {
			return getFirstKey(s) === code;
		}));
		let displayTitle = [GAME,EPIC].includes(newGameData[index].record) ? (code.toUpperCase() + " ") : "";
		displayTitle += ![GAME,EPIC].includes(newGameData[index].record) && !!statusObj && !!statusObj.titleOverride ? statusObj.titleOverride : newGameData[index].title;
		
		newGameData.splice(index, 1);
		newStatusData.splice(index, 1);						

		this.setState({deleteCode: "", gameData: newGameData, statusData: newStatusData});
		this.props.addToast(("Deleted record " + displayTitle), { appearance: "error" })
	}

	resetStartWithEditHandler = () => {
		this.setState({openEditorCode: -1});
	}

	getTotalLoggedLevels = () => {
		var levelCount = 0;

		_map(this.state.statusData, (status,index) => {
			if (!!getFirstObject(status).advancement && getFirstObject(status).advancement.active) {
				levelCount++;
			}
		});

		return levelCount;
	}

	getlatestWealth = () => {
		let data = [...this.state.statusData].reverse();

		// latest wealth must be a log with an "ending" object, otherwise it will be ignored
		// - this means it will not immediately update when a new, unediting log is added
		for (var i = 0; i < this.state.statusData.length; i++) {
			if (!!getFirstObject(data[i]).wealth && !!getFirstObject(data[i]).wealth.ending) {
				// return latest wealth object with ending wealth
				return {...emptyWealth, ...getFirstObject(data[i]).wealth.ending};
			}
		}

		return {...emptyWealth};
	}

	moveModalSetup = (code) => {
		this.setState({
			showReorderModal: true, 
			gameDataReorder: [...this.state.gameData].reverse(), 
			statusDataReorder: [...this.state.statusData].reverse() }
		);
	}

	// DRAG DROP
	onDragEnd = (drop) => {
		if (!drop.destination) {
			return;
		}

		var newGameList = arrayMove([...this.state.gameDataReorder],drop.source.index,drop.destination.index);
		var newStatusList = arrayMove([...this.state.statusDataReorder],drop.source.index,drop.destination.index);

		this.setState({gameDataReorder: newGameList, statusDataReorder: newStatusList });
	};

	// SAVE AND LOAD
	exportData = () => {
		// boy I really badly organized this data ...
		let jsonData = {
			player: { ...this.state.charData },
			options: {...this.state.optionsData},
			games: [...this.state.gameData],
			statuses: [...this.state.statusData],
		};

		let fileName = jsonData.player.character.trim() !== "" ? jsonData.player.character.trim() : "unnamed";

		downloadjs(JSON.stringify(jsonData), fileName + "_oowar-log.json", "application/json");

		this.setState({showOptionsModal: false});
	}

	importData = (e) => {

	    // TBD: CONFIRMATION

	    let fileData = (e.target.files[0]);

	    let reader = new FileReader();
	    reader.readAsText(fileData);

	    //TBD: VALIDATIONS

	    this.setState({ showOptionsModal: false });

	    reader.onload = () => {
	        let jsonResult = JSON.parse(reader.result);
	        this.props.addToast("Logs successfully loaded from " + fileData.name, { appearance: "warning" })

	        this.setData(jsonResult.player, jsonResult.options, jsonResult.games, jsonResult.statuses);
	    };

	    reader.onerror = () => {
	        this.setState({ changingData: false });
	        this.props.addToast("Failed to read file " + fileData.name, { appearance: "error" })
	    };
	}

	resetData = (suppressWarning, suppressToast) => {
		this.setData(
			{
		        "player": "",
		        "dci": "",
		        "character": "Sam Pel",
		        "classes": GENERIC_CLASS,
		        "tier": 0,
		        "base": "",
		        "wealth": emptyWealth
		    },
		    {
		    	autoLeveling: getFirstKey(GENERIC_CLASS),
				tierSetting: 0,
				autoWealth: true,
				// useEp: true,
		    },
		    [{...startingWealthLog}],
		    [startingWealthStatus],
		);

		if (!suppressToast) {
			this.props.addToast("Logs have been reset", { appearance: "warning" })
		}

		this.setState({showOptionsModal: false});
	}

	setData = (char,opt,game,status) => {
		this.setState({ changingData: true });

		setTimeout(() => {
            this.setState({
                charData: char,
                optionsData: opt,
                gameData: game,
                statusData: status,
                changingData: false,
            });
        }, resetTime);
	}

	//RENDERERS
	render_gameLogs = (gamesObj) => {
		return (
			<Container className="gameList">
				{_map(gamesObj, (logData, key) => {
					let delayTime = this.state.loaded ? 0 : 200;
					let animClass = this.state.loaded ? fadeIn : fadeInUp;
					animClass = this.state.finishedMoving ? "" : animClass;

					let wasEpic = !!this.state.statusData[key] && !!this.state.statusData[key][logData.code] && !!this.state.statusData[key][logData.code].isForEpic
						? this.state.statusData[key][logData.code].isForEpic === true
						: logData.isForEpic;

					let wasDm   = !!this.state.statusData[key] && !!this.state.statusData[key][logData.code] && !!this.state.statusData[key][logData.code].dungeonMaster
						? this.state.statusData[key][logData.code].dungeonMaster.isDm
						: {...logData.dungeonMaster}.isDm;

					return (
						<Collapse
							key={logData.code}
							in={logData.code !== this.state.deleteCode}
							mountOnEnter
							unmountOnExit
							onExited={this.removeLog.bind(this,logData.code)}
						>
							<GameLog
								className={animClass}
								style={{ animationDelay: delayTime * key + "ms"}}
								data={logData}
								statuses={this.state.statusData[key]}
								collapse={!this.state.loaded && Object.keys(this.state.gameData).length !== 1}
								logUpdateHandler={this.updateLogStatus}
								deleteHandler={this.handleDelete}
								wasDm={wasDm}
								wasEpic={wasEpic}
								startWithEdit={this.state.openEditorCode === logData.code}
								resetStartWithEditHandler={this.resetStartWithEditHandler}
							/>
						</Collapse>
					);
				})}
			</Container>
		);
	};

	render_newRecordArea = () => {
		var first = _find(this.state.gameDataReorder, (log) => {
			return log.record === START;
		})

		return (
			<Container className="newRecordWrapper">
				<Fade
					in={Object.keys(this.state.gameData).length > 2 || (Object.keys(this.state.gameData).length > 1 && !!first)}
					mountOnEnter
					unmountOnExit
				>
					<EditButton
						move
						right
						className="moveButton"
						onClick={this.moveModalSetup.bind(this)}
					/>
				</Fade>

				<Button
					className={classnames(
						"newButton",
						"oswald",
						this.state.showAddRecordArea ? "isOpen" : ""
					)}
					variant="light"
					size="lg"
					block
					onClick={this.toggleAddRecordArea.bind(this)}
				>
					{!this.state.showAddRecordArea ? "Add Record" : "Cancel"}
				</Button>

				<Collapse
					in={this.state.showAddRecordArea}
					mountOnEnter
					unmountOnExit
				>
					<div>
						<ul className="addLogWrapper">

							{/* notes and wealth log */}
							<li className="addItem" id="newNotes">
								<Card 
									className="customItem"
									onClick={this.addRecord.bind(this,{},true,NOTES)}
								>
									<Card.Body>
										<RiEditCircleFill className="cardIcon" />
										<Card.Title>Notes / Wealth</Card.Title>
										<Card.Subtitle>
											Notes and wealth changes
										</Card.Subtitle>
										<Collapse in={_findIndex(this.state.gameData, (log) => {return log.record === START;}) === -1}
											className="addAsStartLink" >
											<Card.Link>
												<Badge
													pill
													onClick={this.addStartingWealthRecord.bind(this)}
												>
													Add as starting wealth
												</Badge>
											</Card.Link>
										</Collapse>
									</Card.Body>
								</Card>
							</li>

							{/* salvage log */}
							<li className="addItem" id="newSalvage">
								<Card 
									 className="customItem"
									 onClick={this.addRecord.bind(this,{},true,SALVAGE)}
								>
									<Card.Body>
										<GiPokecog className="cardIcon" />
										<Card.Title>Salvage Mission</Card.Title>
										<Card.Subtitle>
											Salvage mission log
										</Card.Subtitle>
									</Card.Body>
								</Card>
							</li>

							{/* games logs */}
							{_map(games_oow.records, (game, key) => {
								return (
									<li
										key={key}
										className="addItem"
										id={game.code}
									>
										<Summary
											gameData={game}
											handleAdd={this.addRecord}
											disabled={_findIndex(this.state.gameData,(o) => {return ( o.code === game.code);}) > -1}
										/>
									</li>
								);
							})}
						</ul>
					</div>
				</Collapse>
			</Container>
		);
	};

	render_activeEventSideBar = () => {
		let eventLength = this.setSidebarInfo(true);
		let messagePlural = eventLength === 1 ? "event" : "events";
		let messageText = eventLength === 0 ? "No active legacy events" :  eventLength + " active legacy " + messagePlural;

		return (
			<ClickOutside onClickOutside={() => {this.setState({ isSidebarOpen: false });}}>
				<SideNav
					expanded={this.state.isSidebarOpen}
					onToggle={(e) => { this.setSidebarInfo(false); this.setState({isSidebarOpen: e});} }
					className={classnames("activeBarWrapper", this.state.isSidebarOpen && "openBar")}
				>
					<SideNav.Toggle className="toggle">
						{!this.state.isSidebarOpen && eventLength > 0 && 
							<Badge pill variant="light" className="number">{eventLength}</Badge>
						}

						{this.state.isSidebarOpen &&
							<div className="message text oswald">{messageText}</div>
						}
					</SideNav.Toggle>

					{this.state.isSidebarOpen && _map(this.state.eventArr, (event, key) => {
						let statusInfo = this.getStatusInfo(event.code, event.title);
						let keyCodeTitle = event.code + " " + event.title;

						return (
							<SideNav.Nav key={keyCodeTitle}>
								<NavItem eventKey={keyCodeTitle} navitemClassName={classnames("eventItem", statusInfo.expended && "expended")}>
								 	<NavIcon>
								 		<Badge pill variant={statusInfo.expended ? "secondary" : "light"}>&nbsp;</Badge>
								 	</NavIcon>
									<NavText>
										<span className="title text bookFont bold">{statusInfo.title}</span>
									</NavText>
									<NavItem navitemClassName={classnames("eventInfo", statusInfo.expended && "expended")}>
										<NavText>
											<div className="code text">
												<span>{statusInfo.code.toUpperCase()}</span>
												<Form>
													<Form.Check 
													    type="switch"
													    id={keyCodeTitle + " isExpended"}
													    label=""
													    onClick={this.toggleExpendedEvent.bind(this,event.code, event.title)}
													    checked={statusInfo.expended}
													    onChange={(e) => {}}
													/>
												</Form>
											</div>

											<p className="description text bookFont" dangerouslySetInnerHTML={{ __html: statusInfo.description }} />

											{statusInfo.option !== null && 
												<div className="list text bookFont" dangerouslySetInnerHTML={{ __html: statusInfo.option }} />
											}

											{statusInfo.selections.length > 0 && _map(statusInfo.selections, (selection, key) => {
												return <div key={key} className="list text bookFont" dangerouslySetInnerHTML={{ __html: selection }} />
											})}
										</NavText>
									</NavItem>
								</NavItem>
							</SideNav.Nav>
						);
					})}
				</SideNav>
			</ClickOutside>
		);
	};

	render_dataModal = () => {
		return (
			<Modal
				className="optionsModal"
				size="lg"
				centered
				show={this.state.showOptionsModal}
				onHide={() => {this.setState({showOptionsModal: false});}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Options</Modal.Title>
				</Modal.Header>

				<Modal.Body className="dataOptions">
					<input type="file" accept=".json" ref={this.inputRef} style={{display: "none"}} onChange={this.importData.bind(this)} />
					<Button className="oswald" size="lg" variant="info" onClick={this.exportData.bind(this)}>Export&nbsp;<BiExport /></Button>
					<Button className="oswald" size="lg" variant="info" onClick={() => {this.inputRef.current.click()}}>Import&nbsp;<BiImport /></Button>
					<Button className="oswald" size="lg" variant="outline-danger" onClick={this.resetData.bind(this,false,false)}>Reset&nbsp;<BiReset /></Button>
				</Modal.Body>
			</Modal>
		);
	}

	render_reorderModal = () => {
		var first = _find(this.state.gameDataReorder, (log) => {
			return log.record === START;
		})

		let firstTitle = "";
		if (!!first) {
			firstTitle =
				!!this.state.statusData[0] &&
				!!this.state.statusData[0][first.code] &&
				!!this.state.statusData[0][first.code].titleOverride
					? this.state.statusData[0][first.code].titleOverride
					: first.title;
		}

        return (
            <Modal
				className="reorderModal"
				size={"lg"}
				centered
				show={this.state.showReorderModal}
				onHide={() => {this.setState({showReorderModal: false});}}
				backdrop="static"
			>
				<Modal.Header closeButton>
					<Modal.Title>Redorder Logs</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Droppable droppableId="reorderList" type="LOG">
						{(provided, snapshot) => (
							<ul 
								className="draggableList"
								ref={provided.innerRef}
  								{...provided.droppableProps}
  							>
								{_map(this.state.gameDataReorder, (log,index) => {
									let statusObj = getFirstObject(_find(this.state.statusData, (s) => {
										return getFirstKey(s) === log.code;
									}));

									if (log.record === START) { return; }

									// let isDm = !!statusObj && !!statusObj.dungeonMaster && statusObj.dungeonMaster.isDm;
									let titleOverride = ![GAME,EPIC].includes(log.record) && !!statusObj && !!statusObj.titleOverride ? statusObj.titleOverride : log.title;
									
									return (
										<Draggable 
											key={log.code} 
											draggableId={log.code} 
											index={index}
										>
											{(provided, snapshot) => (
												<li 
													className={classnames("dItem",snapshot.isDragging && "dragging")} 
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													{log.record === SALVAGE && <GiPokecog className="dTypeIcon" /> }
													{log.record === NOTES && <RiEditCircleFill className="dTypeIcon" /> }
													{[GAME, EPIC].includes(log.record) && <GiD4 className="dTypeIcon" /> }
													<span style={{textAlign: "center"}}>
														{[GAME, EPIC].includes(log.record) && <span className="dCode">{log.code.toUpperCase()}</span>}
														<span className={classnames("dTitle",![NOTES,START].includes(log.record) && "dItalic")}>{titleOverride}</span>
														{/* {isDm && <FaDiceD20 /> } */}
													</span>
													{log.code !== startingWealthLog.code && <ImMenu className="dIcon" />}
												</li>
											)}
										</Draggable>
									);
								})}

								{provided.placeholder}
							</ul>
						)}
					</Droppable>

					{ !!first &&
						<ul className="draggableList dStatic">
							<li className="dItem dUndraggable dFirst">
								<AiFillDollarCircle className="dTypeIcon" />
								<span className="dTitle">{firstTitle}</span>
							</li>
						</ul>
					}
				</Modal.Body>

				<Modal.Footer className="flexBetwixt evenButtons">
					<Button 
						variant="secondary" 
						onClick={() => {this.setState({finishedMoving: true, showReorderModal: false},
							this.setState({finishedMoving: false}));
						}}
					>
						Cancel
					</Button>
					<Button
						variant="info"
						onClick={() => {
							if (JSON.stringify([...this.state.gameDataReorder].reverse()) === JSON.stringify(this.state.gameData)) {
								this.props.addToast("No changes to log order", { appearance: "info" })
							} else {
								this.setState({changingData: true});
								this.props.addToast("Logs successfully rearranged", { appearance: "success" })
							}

							setTimeout(() => {
								this.setState(
									{	
										finishedMoving: true,
										showReorderModal: false,
										gameData: [...this.state.gameDataReorder].reverse(),
										statusData: [...this.state.statusDataReorder].reverse(),
										changingData: false,
									}
								);
							}, resetTime);
						}}
					>
						Save
					</Button>
				</Modal.Footer>
			</Modal>
        );
    }

	render() {
		return (
			<DragDropContext onDragEnd={this.onDragEnd}>
				<div className="log">

					{this.render_activeEventSideBar()}

					<div className="topNav">
						<div className="flexSpace" />
						<Button 
							variant="link" 
							className={this.state.showOptionsModal ? "spin" : ""} 
							onClick={() => {this.setState({showOptionsModal: true});}}
						>
							<GrSettingsOption />
						</Button>
					</div>

					<Jumbotron>
						<Container>
							<div className="titleBox">
								<h1>Eberron: Oracle of War</h1>
								<h2>Adventure Records Log</h2>
							</div>
						</Container>
					</Jumbotron>

					<Fade in={!this.state.changingData && this.state.loaded} unmountOnExit mountOnEnter>
							<span className="contentWrapper">
							<Container>
								<Player 
									playerObj={this.state.charData}
									optionsObj={this.state.optionsData}
									saveHandler={this.savePlayerDataHandler}
									totalLevels={this.getTotalLoggedLevels()}
									latestWealth={this.getlatestWealth()}
								/>

							</Container>

							{this.render_newRecordArea()}

							{this.render_gameLogs(this.state.gameData)}
						</span>
					</Fade>

					<Jumbotron className="footer" />
				</div>

				{this.render_reorderModal()}
				{this.render_dataModal()}
			</DragDropContext>
		);
	}
}

export default withToast(AdvRecordLog);
