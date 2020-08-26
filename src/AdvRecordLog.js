import React from "react";
import classnames from "classnames";
import _map from "lodash/map";
import _find from 'lodash/find';
import _findIndex from "lodash/findIndex";
import _sortBy from "lodash/sortBy";
import _filter from "lodash/filter";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form'
import Collapse from "react-bootstrap/Collapse";
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import ClickOutside from 'react-click-outside';
import { ToastProvider } from "react-toast-notifications";

import { fadeInUp, fadeIn, getFirstObject, getFirstKey } from "utils/Util";
import Player from "common/Player";
import GameLog from "GameLog";
import Summary from "common/Summary";

import "AdvRecordLog.scss";
import "animate.css";
import '@trendmicro/react-sidenav/dist/react-sidenav.css';

import games_oow from "./data/oowGames.json";
// import chara_SamPel from "./data/SamPel.json";

class AdvRecordLog extends React.Component {
	state = {
		// charData: chara_SamPel.player,
		charData: {
	        "player": "",
	        "dci": "",
	        "character": "Sam Pel",
	        "classes": null,
	        "tier": '',
	        "base": "",
	        "wealth": {cp: 0, sp: 0, ep: 0, gp: 0, pp: 0}
	    },
	    optionsData: {
	    	autoLeveling: false,
			tierSetting: 0,
			useEp: true
	    },
	    gameData: [],
	    statusData: [],
	    showAddRecordArea: false,
	    loaded: false,
	    isSidebarOpen: false,
	    eventArr: []
	};

	componentDidMount() {
		this.setState({ loaded: true });
	}

	//FUNCTIONS
	toggleAddRecordArea = () => {
		this.setState({ showAddRecordArea: !this.state.showAddRecordArea });
	};

	addRecord = (recordObj) => {
		let newGameData = this.state.gameData;
		newGameData.push(recordObj);

		this.setState({ gameData: newGameData });
		this.toggleAddRecordArea();
	};

	toggleExpendedEvent = (code, title) => {		
		var newStatusData = this.state.statusData;
		let index = _findIndex(newStatusData, (e) => {
			return getFirstKey(e) === code;
		});

		newStatusData[index][code][title].expended = newStatusData[index][code][title].expended === true ? false : true;

		this.setState({statusData: newStatusData});
	}

	updateLogStatus = (logStatusObj) => {
		let statusArr = this.state.statusData;

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
		// console.log(code + " - " + title);

		let statusInfo = _find(this.state.statusData, (o) => {
			return getFirstKey(o) === code;
		})[code][title];
		// console.log(statusInfo);

		let recordData = _find(games_oow.records, (r) => {
			return r.code === code;
		});
		// console.log(recordData.legacy.events);

		let eventData = _find(recordData.legacy.events, (e) => {
			return e.title === title;
		});
		// console.log(eventData); 

		//description, title, checkboxes, radios, table
		var eventDetails = {};
		if (statusInfo.active && statusInfo.legacy) {
			let expendedBool = statusInfo.expended !== undefined ? statusInfo.expended : false; // TEMPORARY

			eventDetails = {title: title, code: code, description: eventData.description, option: null, selections: [], expended: expendedBool}

			// console.log(statusInfo);

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

		// console.log(eventDetails);

		return eventDetails; 
	};

	setSidebarInfo = (getActiveLength) => {
		var eventArr = [];

		this.state.statusData.forEach((log) => {
			_map(getFirstObject(log), (event, title) => {
				if (event.legacy) {
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

	//RENDERERS
	render_gameLogs = (gamesObj) => {
		return (
			<Container className="gameList">
				{_map(gamesObj, (logData, key) => {
					let delayTime = this.state.loaded ? 0 : 200;
					let animClass = this.state.loaded ? fadeIn : fadeInUp;

					return (
						<GameLog
							className={animClass}
							style={{ animationDelay: delayTime * key + "ms" }}
							key={key}
							data={logData}
							isCollapsed={!this.state.loaded}
							logUpdateHandler={this.updateLogStatus}
						/>
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
											disabled={
												_findIndex(
													this.state.gameData,
													(o) => {
														return (
															o.code === game.code
														);
													}
												) > -1
											}
										/>
									</li>
								);
							})}

							<li className="addItem" id="newSalvage">
								<Card className="customItem disabled">
									<Card.Body>
										<Card.Title>Salvage Mission</Card.Title>
										<Card.Subtitle>
											Salvage mission log
										</Card.Subtitle>
									</Card.Body>
								</Card>
							</li>

							<li className="addItem" id="newNotes">
								<Card className="customItem disabled">
									<Card.Body>
										<Card.Title>Notes / Wealth</Card.Title>
										<Card.Subtitle>
											Notes and wealth changes
										</Card.Subtitle>
									</Card.Body>
								</Card>
							</li>
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
			<ClickOutside
				onClickOutside={() => {
			        this.setState({ isSidebarOpen: false });
			    }}
		    >
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
											{statusInfo.option !== null && <div className="list text bookFont" dangerouslySetInnerHTML={{ __html: statusInfo.option }} />}
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

					<Container>
						<Player playerObj={this.state.charData} optionsData={this.state.optionsData} />
					</Container>

					{this.render_newRecordArea()}

					{this.render_gameLogs(this.state.gameData)}
					{/* {this.render_gameLogs(games_oow.records)} */}

					<Jumbotron className="footer" />
				</div>
			</ToastProvider>
		);
	}
}

export default AdvRecordLog;
