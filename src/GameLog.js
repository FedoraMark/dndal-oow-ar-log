import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import Container from "react-bootstrap/Container";
import _map from "lodash/map";
import _pull from "lodash/pull";
import { FaDiceD20 } from "react-icons/fa";

import { dmRewardNote, playerRewardNote, getFirstObject, getFirstKey } from "utils/Util";
import Event from "selectors/Event";
import Select from "selectors/Select";
import Option from "selectors/Option";
import Wealth from "common/Wealth";
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
        logUpdateHandler: PropTypes.func
    }

    static defaultProps = {
    	statuses: {},
        collapse: false,
        className: '',
        style: {},
        preview: false,
        isEditing: false,
    }

    state = {
    	data: this.props.data,
    	statusData: this.props.statuses,
        isCollapsed: this.props.collapse,
        isCollapsing: false,
        willBeEditing: false,
        isEditing: this.props.isEditing,
        rewardGroup0: [],
        // rewardGroup1: [], // currently unneeded
    }

    componentWillReceiveProps(newProps) {
    	this.setState({data: newProps.data, statusData: newProps.statuses});
    }

    //FUNCTIONS
    toggleCollapsed = () => {
    	if (!this.state.isEditing) {
        	this.setState({ isCollapsed: !this.state.isCollapsed });
        }
    }

    updateEventHandler = (eventStatus) => {
        let code = this.state.data.code;
        var stats = this.state.statusData;

        if (getFirstObject(eventStatus).active) {
        	// IF ACTIVE
	        stats = {[code]: { ...this.state.statusData[code], ...eventStatus } };
	    } else {
	    	//IF DISABLED
	    	delete stats[code][getFirstKey(eventStatus)];
	    }

	    this.setState({ statusData: stats },
			this.props.logUpdateHandler(stats)
		);
    }

    advancementHandler = (key, val) => {
	    this.updateEventHandler({"advancement": {legacy: false, active: val}}) ;
    }

    selectRewardHandler = (key, val, title) => {    	
    	var newArray = this.state[title];
    	if (!val) {
    		_pull(newArray, key);
    	} else {
    		newArray.push(key);
    	}

    	this.setState({[title]: newArray},
    		this.updateEventHandler({[title]: {legacy: false, active: true, selections: newArray}})
    	);
    }

    optionRewardHandler = (key, title) => {
    	this.updateEventHandler({[title]: {legacy: false, active: true, option: key}})
    }

    setIsEditing = (editing) => {
		this.setState({willBeEditing: editing, isCollapsing: true });
	};

    expandToEdit = () => {
    	this.setState({isEditing: this.state.willBeEditing, isCollapsing: false});
    }

    //RENDERERS
    render_titleAndCode = (type, code, title) => {
        return (
            <div className={classnames("titleWrapper",!this.props.preview && "sticky")}>
            	{!this.props.preview && 
            		<>
	            		<Fade in={!this.state.isCollapsed} mountOnEnter unmountOnExit>
	            			<EditButton save onClick={this.setIsEditing.bind(this, !this.state.isEditing)} active={this.state.willBeEditing} />
	            		</Fade>

	            		<Fade in={this.state.willBeEditing} mountOnEnter unmountOnExit>
							<EditButton left cancel onClick={this.setIsEditing.bind(this, false)} active />
						</Fade>
					</>
            	}

				<h1 className="title fauxdesto" onClick={this.toggleCollapsed.bind(this)}>
					<span className="name">
						{!this.props.preview && !!this.state.data.dungeonMaster && this.state.data.dungeonMaster.isDm && <FaDiceD20 className="diceIcon" />}
						{code !== null && <span className="code" dangerouslySetInnerHTML={{ __html: code.split("-").join("<span class='hyphen'>-</span>") }}></span>}
						<span className="fauxdesto italic">{title}</span>
					</span>
				</h1>
			</div>
        );
    }

    render_gameInfo = (event, date, dmObj, tier) => {
        var dmStr = dmObj !== undefined && dmObj.isDm ? "(me)" : '';

        if (dmObj !== undefined && !dmObj.isDm) {
            if ("name" in dmObj) {
                dmStr = dmObj.name;
                if ("dci" in dmObj) {
                    dmStr = dmStr + " (" + dmObj.dci + ")";
                }
            } else if ("dci" in dmObj) {
                dmStr = dmObj.dci;
            }
        }

        return (
            <Container>
				<ul className="infoWrapper">
					{date !== undefined && <li className="date"><h1>Date:</h1><p>{date}</p></li>}
					{event !== undefined && <li className="event"><h1>Event:</h1><p>{event}</p></li>}
					{tier !== undefined && <li className="tier"><h1>Tier:</h1><p>{tier}</p></li>}
					{!this.props.preview && dmStr !== '' && <li className="dm"><h1>Dungeon Master:</h1><p>{dmStr}</p></li>}
				</ul>
			</Container>
        );
    }

    render_advNotes = (notesObj, suppressTitle) => {
        return (
            <Container className="notesWrapper wrapper">
					{!suppressTitle && <h1 className="sectionTitle">Adventure Notes</h1>}
					<div className="box">
						{"game" in notesObj &&<p className="gameNotes bookFont" dangerouslySetInnerHTML={{ __html: notesObj.game }} />}
						{("game" in notesObj && "player" in notesObj) && <hr />}
						{"player" in notesObj && <p className="playerNotes handwritten">{notesObj.player}</p>}
					</div>
			</Container>
        )
    }

    render_advancement = (advObj) => {
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
							label={advObj.label}
							type="checkbox"
							isBold
							isDisabled={preview}
							isSelected={isSelected}
							selectHandler={this.advancementHandler}
						/>
						<p className="bookFont footnote" dangerouslySetInnerHTML={{ __html:  advObj.footnote }} />
					</div>
			</Container>
        );
    }

    render_rewards = (rewardObj) => {
    	const { preview } = this.props;

        return (
            <Container className="rewardsWrapper wrapper">
					<h1 className="sectionTitle">Rewards</h1>
					<div className="box rewardsContent">
						{_map(rewardObj, (rewardGroup, groupKey) => {
							
							//CLEANUP - should be type of <Event /> component
							let groupName = "rewardGroup" + groupKey;
							var option = -1;
							var selectArray = [];
								
							if (this.state.statusData[this.state.data.code] !== undefined && this.state.statusData[this.state.data.code][groupName] !== undefined) {
								option = this.state.statusData[this.state.data.code][groupName].option;
								selectArray = this.state.statusData[this.state.data.code][groupName].selections;
							}

							return  (
								<div key={groupKey} className="rewardGroup">
									<h1 className="bookFont bold">
										<span className={classnames("instructions")}>{rewardGroup.instructions}</span>
										{"options" in rewardGroup && <div className="buttonArea" />}
									</h1>

									{"options" in rewardGroup && <Option options={rewardGroup.options} canBlank isDisabled={preview} selection={option} title={groupName} optionHandler={this.optionRewardHandler} />}

									{"selections" in rewardGroup &&
										<>
											{_map(rewardGroup.selections, (selection, selectKey) => {
												return <Select key={selectKey} label={selection} type="checkbox" isDisabled={preview} isSelected={selectArray.includes(selectKey)} title={groupName} arrKey={selectKey} selectHandler={this.selectRewardHandler} />
											})}
										</>
									}
								</div>
							)
						})}
					</div>
			</Container>
        );
    }

    render_wealth = (wealthObj) => {
        return (
            <Container className="wealthWrapper wrapper">
				<h1 className="sectionTitle">Character Wealth</h1>
					
				<Container className="wealthContent box">
					<div className="header cell">
						Starting Gold
					</div>
					<div className="amount cell">
						<span className="val"><Wealth isEmpty={wealthObj === undefined} wealthObj={wealthObj === undefined ? undefined : wealthObj.starting} /></span>
					</div>

					<div className="header cell">
						Gold Spent (<span>-</span>)
					</div>
					<div className="amount cell">
						<span className="val"><Wealth colorless /*loss*/ isEmpty={wealthObj === undefined} wealthObj={wealthObj === undefined ? undefined : wealthObj.spent} /></span>
					</div>

					<div className="header cell">
						Gold Earned (+)
					</div>
					<div className="amount cell">
						<span className="val"><Wealth colorless /*gain*/ isEmpty={wealthObj === undefined} wealthObj={wealthObj === undefined ? undefined : wealthObj.earned} /></span>
					</div>

					<div className="header cell bottom">
						Ending Gold
					</div>
					<div className="amount cell bottom">
						<span className="val"><Wealth isEmpty={wealthObj === undefined} wealthObj={wealthObj === undefined ? undefined : wealthObj.ending} /></span>
					</div>
				</Container>
			</Container>
        );
    }

    render_legacy = (legacyObj) => {
    	const { preview } = this.props;
    	let footnote = (!!this.state.data.dungeonMaster && this.state.data.dungeonMaster.isDm) ? dmRewardNote : playerRewardNote;

        return (
            <Container className="legacyWrapper wrapper">
				<h1 className="sectionTitle">Legacy Events</h1>
				<Container className="box">
					<div className="legacyContent">
						{_map(legacyObj.events, (event, key) => {
							var statusObj = {};
							if (this.state.statusData[this.state.data.code] !== undefined && this.state.statusData[this.state.data.code][event.title] !== undefined) {
						    	statusObj = this.state.statusData[this.state.data.code][event.title];
						    }

							return <Event eventObj={event} key={key} disable={preview} status={statusObj} updateHandler={this.updateEventHandler} />
						})}
					</div>
					<div className="footnote bookFont" dangerouslySetInnerHTML={{ __html: footnote }} />
				</Container>
			</Container>
        );
    }

    render_logData = () => {
    	return (
			<>
				{this.render_gameInfo(this.state.data.event,this.state.data.date,this.state.data.dungeonMaster,this.state.data.tier)}
				{this.render_advNotes(this.state.data.notes)}

				<div className="twoCol">
					<div className="leftCol arCol">
						{this.render_advancement(this.state.data.advancement)}
						{this.render_rewards(this.state.data.rewards)}
						{this.render_wealth(this.state.data.gameWealth)}
					</div>

					<div className="rightCol arCol">
						{this.render_legacy(this.state.data.legacy)}
					</div>
				</div>
			</>
    	);
    }

    render_editData = () => {
    	return (
    		<div className="editWrapper">
				DELETE<br/>
				NOTES<br/>
				WEALTH (x4)<br/>
				EXPEND EVENTS (selected)<br/>
				INFO EDIT<br/>
				MOVE<br/>
			</div>
    	);
    }

    render() {
        const { style, className, preview } = this.props;

        if (["game", "epic"].includes(this.state.data.record)) {
            return (
                <Container fluid className={classnames(className,"gameBox",(!this.state.isCollapsed && !this.state.isEditing) && "expanded", preview && "preview", this.state.willBeEditing && "editing")} style={style}>
					{this.render_titleAndCode(this.state.data.type,this.state.data.code,this.state.data.title)}

					<Collapse in={!this.state.isCollapsed && !this.state.isCollapsing} onExited={this.expandToEdit.bind(this)} timeout="1" unmountOnExit mountOnEnter>
						<div className="content">
							{!this.state.isEditing && this.render_logData() }
							{ this.state.isEditing && this.render_editData() }
						</div>
					</Collapse>

		    	</Container>
            )
        } else if (this.state.data.record === "salvage") {
        	// TO BE DONE
            return (
                <Container fluid className={classnames(className,"gameBox","salvageBox",!this.state.isCollapsed && "expanded", preview && "preview")} style={style}>
					{this.render_titleAndCode(this.state.data.type,null,this.state.data.title)}

					<Collapse in={!this.state.isCollapsed}>
						<div className="content">
							{this.render_gameInfo(undefined,this.state.data.date,this.state.data.dungeonMaster,this.state.data.tier)}

							<div className="twoCol">
								<div className="leftCol arCol">
									SALVAGE<br />
									LEVEL UP?
								</div>

								<div className="rightCol arCol">
									{this.render_wealth(this.state.data.gameWealth)}
								</div>
							</div>

							{this.render_advNotes(this.state.data.notes, true)}
						</div>
					</Collapse>

		    	</Container>
            )
        } else if (this.state.data.record === "notes") {
        	// TO BE DONE
        	return (
	        	<Container fluid className={classnames(className,"gameBox","notesWealthBox",!this.state.isCollapsed && "expanded", preview && "preview")} style={style}>
					{this.render_titleAndCode(this.state.data.type,null,"Notes / Wealth")}

					<Collapse in={!this.state.isCollapsed}>
						<div className="content">
							{this.render_gameInfo(undefined,this.state.data.date,undefined,this.state.data.tier)}

							<div className="twoCol">
								<div className="leftCol arCol">
									NOTES
								</div>

								<div className="rightCol arCol">
									{this.render_wealth(this.state.data.gameWealth)}
								</div>
							</div>

							{this.render_advNotes(this.state.data.notes, true)}
						</div>
					</Collapse>

		    	</Container>
	    	)
        }

        return < > < />
    }
}

export default GameLog;