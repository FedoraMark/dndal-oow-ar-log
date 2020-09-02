import React from "react";
import classnames from "classnames";
import _filter from "lodash/filter";
import _find from 'lodash/find';
import _findIndex from "lodash/findIndex";
import _map from "lodash/map";
import _sortBy from "lodash/sortBy";
import Badge from 'react-bootstrap/Badge';
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Collapse from "react-bootstrap/Collapse";
import Container from "react-bootstrap/Container";
import Form from 'react-bootstrap/Form'
import Jumbotron from "react-bootstrap/Jumbotron";
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import ClickOutside from 'react-click-outside';
import { ToastProvider } from "react-toast-notifications";

import { fadeInUp, fadeIn, getFirstObject, getFirstKey, emptyWealth, emptyLogWealth } from "utils/Util";
import Player from "common/Player";
import Summary from "common/Summary";
import GameLog from "GameLog";

import "AdvRecordLog.scss";
import "animate.css";
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

import games_oow from "./data/oowGames.json";
// import chara_SamPel from "./data/SamPel.json";

const NOTES_WEALTH = "notes";
const SALVAGE = "salvage"

class AdvRecordLog extends React.Component {
	state = {
		charData: {
	        "player": "",
	        "dci": "",
	        "character": "Sam Pel",
	        "classes": {},
	        "tier": 0,
	        "base": "",
	        "wealth": emptyWealth
	    },
	    optionsData: {
	    	autoLeveling: "",
			tierSetting: 0,
			autoWealth: true,
			// useEp: true,
	    },
	    gameData: [],
	    statusData: [],
	    
	    showAddRecordArea: false,
	    loaded: false,
	    isSidebarOpen: false,
	    eventArr: [],
	    deleteCode: -1,
	    openEditorCode: -1
	};

	componentDidMount() {
		this.setState({ loaded: true });
	}

	//FUNCTIONS
	savePlayerDataHandler = (playerObj, optionsObj) => {
		this.setState({charData: playerObj, optionsData: optionsObj});
	}

	toggleAddRecordArea = () => {
		this.setState({ showAddRecordArea: !this.state.showAddRecordArea });
	};

	addRecord = (recordObj, openEditor, record) => {
		var newLogData = {...recordObj};
		var newLogStatus = {[recordObj.code]: {wealth: this.getPrevEndingWealth()}};
		var newEditorCode = openEditor ? recordObj.code : -1;
		var newCode = recordObj.code;

		// notes_wealth and salvage logs
		if ([NOTES_WEALTH, SALVAGE].includes(record)) {
			
			var numUnique = 1;
			_filter(this.state.gameData, (g) => {
				if (!!g.record && g.record === record) {
					numUnique++; // NEEDS TO BE FIXED FOR DELETED AND RE-INSERTED LOGS
				}
			});

			newCode = record + "_" + numUnique;
			let type = record === NOTES_WEALTH ? "Notes and Wealth Changes" : "Salvage Mission";

			newLogData = {record: record, type: type, title: "New " + record + " log " + numUnique, code: newCode, tier: this.state.charData.tier === 0 ? 1 : this.state.charData.tier};
			newLogStatus = {[newCode]: {tier: this.state.charData.tier === 0 ? 1 : this.state.charData.tier, wealth: this.getPrevEndingWealth()}};
			newEditorCode = newCode;
		}

		var newGameData = [...this.state.gameData];
		newGameData.push(newLogData);

		var newStatusData = [...this.state.statusData];
		newStatusData.push(newLogStatus);

		this.setState({ openEditorCode: newEditorCode, gameData: newGameData, statusData: newStatusData});
		this.toggleAddRecordArea();
	};

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
		newGameData.splice(index, 1);
		// let title = newGameData.splice(index, 1).title; // ADD TOAST

		var newStatusData = [...this.state.statusData];
		newStatusData.splice(index,1);

		this.setState({deleteCode: -1, gameData: newGameData, statusData: newStatusData});
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

	//RENDERERS
	render_gameLogs = (gamesObj) => {
		return (
			<Container className="gameList">
				{_map(gamesObj, (logData, key) => {
					let delayTime = this.state.loaded ? 0 : 200;
					let animClass = this.state.loaded ? fadeIn : fadeInUp;

					let wasEpic = !!this.state.statusData[key] && !!this.state.statusData[key][logData.code] && !!this.state.statusData[key][logData.code].isForEpic
						? this.state.statusData[key][logData.code].isForEpic === true
						: logData.isForEpic;

					let wasDm   = !!this.state.statusData[key] && !!this.state.statusData[key][logData.code] && !!this.state.statusData[key][logData.code].dungeonMaster
						? this.state.statusData[key][logData.code].dungeonMaster.isDm
						: {...logData.dungeonMaster}.isDm;

					return (
						<Collapse
							key={key}
							in={logData.code !== this.state.deleteCode}
							mountOnEnter
							dismountOnExit
							onExited={this.removeLog.bind(this,logData.code)}
						>
							<GameLog
								className={animClass}
								style={{ animationDelay: delayTime * key + "ms" }}
								data={logData}
								statuses={this.state.statusData[key]}
								collapse={!this.state.loaded}
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
		return (
			<Container className="newRecordWrapper">
				<Button
					className={classnames(
						"newButton",
						"fauxdesto",
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
									onClick={this.addRecord.bind(this,{},true,NOTES_WEALTH)}
								>
									<Card.Body>
										<Card.Title>Notes / Wealth</Card.Title>
										<Card.Subtitle>
											Notes and wealth changes
										</Card.Subtitle>
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
							<SideNav.Nav key={key}>
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

	render() {
		return (
			<ToastProvider autoDismiss autoDismissTimeout="3000">
				<div className="log">

					{this.render_activeEventSideBar()}

					<Jumbotron>
						<Container>
							<div className="titleBox">
								<h1>Eberron: Oracle of War</h1>
								<h2>Adventure Records Log</h2>
							</div>
						</Container>
					</Jumbotron>

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
						{/* {this.render_gameLogs(games_oow.records)} */}
					</span>

					<Jumbotron className="footer" />
				</div>
			</ToastProvider>
		);
	}
}

export default AdvRecordLog;
