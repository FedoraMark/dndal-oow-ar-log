import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";
import Collapse from "react-bootstrap/collapse";

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
				<h1 className="title">Adventure Record: <span>{code.split("-").join("–")}</span> {title}</h1>
			</div>);
	}

	render_gameInfo = (event, date, dmObj) => {
		return(
			<ul className="infoWrapper">
				<li><h1 className="date">Date:</h1><p>{date}</p></li>
				<li><h1 className="event">Event:</h1><p>{event}</p></li>
				<li><h1 className="dm">Dungeon Master:</h1><p>{dmObj.name}{"dci" in dmObj && " (" + dmObj.dci + ")"}</p></li>
			</ul>
		);
	}

	render_advNotes = (notesObj) => {
		return (
			<div className="notesWrapper wrapper">
				<h1>Adventure Notes</h1>
				<div className="box">
					<p className="gameNotes bookFont">{notesObj.game}</p>
					{"player" in notesObj && <hr />}
					{"player" in notesObj && <p className="playerNotes bookFont">{notesObj.player}</p>}
				</div>
			</div>
		)
	}

	render_advancement = (advObj) => {

	}

	render() {
		const {data} = this.props;

	  	return (
	    	<div className={classnames("gameBox",!this.state.isCollapsed && "expanded")}>
				{this.render_titleAndCode(data.code,data.title)}

				<Collapse in={!this.state.isCollapsed}>
					<div className="content">
						{this.render_gameInfo(data.event,data.date,data.dungeonMaster)}
						{this.render_advNotes(data.notes)}
						{this.render_advancement(data.advancement)}
					</div>
				</Collapse>
	    	</div>
	  	)
	}
}

export default GameLog;