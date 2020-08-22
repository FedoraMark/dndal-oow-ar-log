import React from "react";
import classnames from "classnames";
import _map from "lodash/map";
import _find from 'lodash/find';
import _findIndex from "lodash/findIndex";
import _sortBy from "lodash/sortBy";
import Jumbotron from "react-bootstrap/Jumbotron";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Badge from 'react-bootstrap/Badge';
import Collapse from "react-bootstrap/Collapse";
import SideNav, { NavItem, NavIcon, NavText } from '@trendmicro/react-sidenav';
import ClickOutside from 'react-click-outside';

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
		charData: { character: "Sam Pel", tier: 1, wealth: {} },
		gameData: [],
		statusData: [],
		showAddRecordArea: false,
		loaded: false,
		isSidebarOpen: false,
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

	updateLogStatus = (logStatusObj) => {
		let statusArr = this.state.statusData;

		let changeIndex = _findIndex(statusArr, (o) => {
			return Object.keys(o)[0] === Object.keys(logStatusObj)[0];
		});

		if (changeIndex === -1) {
			statusArr.push(logStatusObj);
		} else {
			statusArr[changeIndex] = logStatusObj;
		}

		this.setState({ statusData: statusArr },
			// console.log(this.state.statusData)
		);
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
		eventDetails = {title: title, code: code, description: eventData.description, option: null, selections: []}

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

	render_newRecordArea = (btnStyle) => {
		return (
			<Container className="newRecordWrapper">
				<Button
					className={classnames(
						"newButton",
						this.state.showAddRecordArea ? "isOpen" : ""
					)}
					style={btnStyle}
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
		var eventArr = [];

		this.state.statusData.forEach((log) => {
			_map(getFirstObject(log), (event, title) => {
				if (event.legacy) {
					eventArr.push({title: title, code: getFirstKey(log), event: event});
				}
			})
		});

		eventArr = _sortBy(eventArr, (o) => {
			return o.title.toUpperCase();
		})

		let messagePlural = eventArr.length === 1 ? "event" : "events";
		let messageText = eventArr.length === 0 ? "No legacy events" :  eventArr.length + " legacy " + messagePlural;

		return (
			<ClickOutside
				onClickOutside={() => {
			        this.setState({ isSidebarOpen: false });
			    }}
		    >
				<SideNav
					expanded={this.state.isSidebarOpen}
					onToggle={(e) => { this.setState({isSidebarOpen: e});} }
					className={classnames("activeBarWrapper", this.state.isSidebarOpen && "openBar")}
				>
					<SideNav.Toggle className="toggle">
						{!this.state.isSidebarOpen && eventArr.length > 0 && 
							<Badge pill variant="light" className="number">{eventArr.length}</Badge>
						}

						{this.state.isSidebarOpen &&
							<div className="message text oswald">{messageText}</div>
						}
					</SideNav.Toggle>

					{this.state.isSidebarOpen && _map(eventArr, (event, key) => {
						let statusInfo = this.getStatusInfo(event.code, event.title);
						let keyCodeTitle = event.code + " " + event.title;

						// console.log(statusInfo);

						return (
							<SideNav.Nav key={key}>
								<NavItem eventKey={keyCodeTitle} navitemClassName="eventItem">
								 	<NavIcon><Badge pill variant="light">&nbsp;</Badge></NavIcon>
									<NavText>
										<span className="title text bookFont bold">{statusInfo.title}</span>
									</NavText>
									<NavItem navitemClassName="eventInfo">
										<NavText>
											<div className="code text">{statusInfo.code.toUpperCase()}</div>
											<p className="description text bookFont" dangerouslySetInnerHTML={{ __html: statusInfo.description }} />
											{statusInfo.option !== null && <div className="list text bookFont" dangerouslySetInnerHTML={{ __html: statusInfo.option }} />}
											{statusInfo.selections.length > 0 && _map(statusInfo.selections, (selection) => {
												return <div className="list text bookFont" dangerouslySetInnerHTML={{ __html: selection }} />
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
					<Player playerObj={this.state.charData} />
				</Container>

				{this.render_newRecordArea()}

				{this.render_gameLogs(this.state.gameData)}
				{/* {this.render_gameLogs(games_oow.records)} */}

				<Jumbotron className="footer" />
			</div>
		);
	}
}

export default AdvRecordLog;
