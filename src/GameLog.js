import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";
import Collapse from "react-bootstrap/collapse";
import Container from "react-bootstrap/Container";
import Select from "./selectors/Select";


import './GameLog.scss';

class GameLog extends React.Component {
	static propTypes = {
		data: PropTypes.object.isRequired,
		isCollapsed: PropTypes.bool
	}

	static defaultProps = {
		isCollapsed: false
	}

	state = {
		isCollapsed: this.props.isCollapsed
	}

	//FUNCTIONS
	toggleCollapsed = () => {
		this.setState({isCollapsed: !this.state.isCollapsed});
	}


	//RENDERERS
	render_titleAndCode = (code, title) => {
		return (
			<div className="titleWrapper" onClick={this.toggleCollapsed.bind(this)}>
				<h1 className="title">Adventure Record: <span dangerouslySetInnerHTML={{ __html: code.split("-").join("<span class='hyphen'>-</span>") }}></span> {title}</h1>
			</div>);
	}

	render_gameInfo = (event, date, dmObj) => {
		var dmStr = '';
		if ("name" in dmObj) {
			dmStr = dmObj.name;
			if ("dci" in dmObj) {
				dmStr = dmStr + " (" + dmObj.dci + ")";
			}
		} else if ("dci" in dmObj) {
			dmStr = dmObj.dci;
		} 

		return(
			<Container>
				<ul className="infoWrapper">
					{date !== '' && <li><h1 className="date">Date:</h1><p>{date}</p></li>}
					{event !== '' && <li><h1 className="event">Event:</h1><p>{event}</p></li>}
					{dmStr !== '' && <li><h1 className="dm">Dungeon Master:</h1><p>{dmStr}</p></li>}
				</ul>
			</Container>
		);
	}

	render_advNotes = (notesObj) => {
		return (
			<Container className="notesWrapper wrapper">
					<h1>Adventure Notes</h1>
					<div className="box">
						<p className="gameNotes bookFont" dangerouslySetInnerHTML={{ __html: notesObj.game }} />
						{"player" in notesObj && <hr />}
						{"player" in notesObj && <p className="playerNotes bookFont">{notesObj.player}</p>}
					</div>
			</Container>
		)
	}

	render_advancement = (advObj) => {
		return(
			<Container className="advWrapper wrapper">
					<h1>Advancement</h1>
					<div className="box">
						<Select label={advObj.level} type="checkbox" isSelected={advObj.isSelected} />
						<p className="bookFont centerText">{advObj.note}</p>
					</div>
			</Container>
		);
	}

	render_rewards = (rewardObj) => {
		return(
			<Container className="rewardsWrapper wrapper">
					<h1>Rewards</h1>
					<div className="box">
					</div>
			</Container>
		);
	}

	render_wealth = (wealthObj) => {
		return(
			<Container className="wealthWrapper wrapper">
					<h1>Character Wealth</h1>
					<div className="box">
					</div>
			</Container>
		);
	}

	render_legacy = (legacyObj) => {
		return(
			<Container className="legacyWrapper wrapper">
					<h1>Legacy Events</h1>
					<div className="box">
					</div>
			</Container>
		);
	}

	render() {
		const {data} = this.props;

	  	return (
	    	<Container fluid className={classnames("gameBox",!this.state.isCollapsed && "expanded")}>
				{this.render_titleAndCode(data.code,data.title)}

				<Collapse in={!this.state.isCollapsed}>
					<div className="content">
						{this.render_gameInfo(data.event,data.date,data.dungeonMaster)}
						{this.render_advNotes(data.notes)}

						<div className="twoCol">
							<div className="leftCol arCol">
								{this.render_advancement(data.advancement)}
								{this.render_rewards(data.rewards)}
								{this.render_wealth(data.gameWealth)}
							</div>

							<div className="rightCol arCol">
								{this.render_legacy(data.legacy)}
							</div>
						</div>
					</div>
				</Collapse>

	    	</Container>
	  	)
	}
}

export default GameLog;