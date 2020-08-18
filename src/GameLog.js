import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";
import Collapse from "react-bootstrap/collapse";
import Container from "react-bootstrap/Container";
import _map from "lodash/map";

import Event from "./selectors/Event";
import Select from "./selectors/Select";
import Option from "./selectors/Option";
import Wealth from "./common/Wealth";

import "animate.css";
import './GameLog.scss';

class GameLog extends React.Component {

    static propTypes = {
        data: PropTypes.object.isRequired,
        isCollapsed: PropTypes.bool,
        className: PropTypes.string,
        preview: PropTypes.bool
    }

    static defaultProps = {
        isCollapsed: false,
        className: '',
        style: {},
        preview: false
    }

    state = {
        isCollapsed: this.props.isCollapsed
    }

    //FUNCTIONS
    toggleCollapsed = () => {
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    //RENDERERS
    render_titleAndCode = (type, code, title) => {
        return (
            <div className={classnames("titleWrapper",!this.props.preview && "sticky")} onClick={this.toggleCollapsed.bind(this)}>
				<h1 className="title fauxdesto">
					{/* <span className="type">{type}:</span> */}
					<span className="name">
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
					{dmStr !== '' && <li className="dm"><h1>Dungeon Master:</h1><p>{dmStr}</p></li>}
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
        return (
            <Container className="advWrapper wrapper">
					<h1 className="sectionTitle">Advancement</h1>
					<div className="box">
						<Select label={advObj.label} type="checkbox" isSelected={advObj.isSelected} isBold isDisabled={this.props.preview} />
						<p className="bookFont footnote" dangerouslySetInnerHTML={{ __html:  advObj.footnote }} />
					</div>
			</Container>
        );
    }

    render_rewards = (rewardObj) => {
        return (
            <Container className="rewardsWrapper wrapper">
					<h1 className="sectionTitle">Rewards</h1>
					<div className="box rewardsContent">
						{_map(rewardObj, (rewardGroup, key) => {
							return  (
								<div key={key} className="rewardGroup">
									<h1 className="bookFont bold">
										<span className="instructions">{rewardGroup.instruction}</span>
										{"options" in rewardGroup && <div className="buttonArea" />}
									</h1>

									{"options" in rewardGroup && <Option options={rewardGroup.options} canBlank isDisabled={this.props.preview} />}

									{"selections" in rewardGroup &&
										<>
											{_map(rewardGroup.selections, (selection, key) => {
												return <Select key={key} label={selection} type="checkbox" isDisabled={this.props.preview} />
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
        return (
            <Container className="legacyWrapper wrapper">
				<h1 className="sectionTitle">Legacy Events</h1>
				<Container className="box">
					<div className="legacyContent">
						{_map(legacyObj.events, (event, key) => {
							return <Event eventObj={event} key={key} disable={this.props.preview} />
						})}
					</div>
					<div className="footnote bookFont" dangerouslySetInnerHTML={{ __html: legacyObj.footnote }} />
				</Container>
			</Container>
        );
    }

    render() {
        const { data, style, className, preview } = this.props;

        if (["game","epic"].includes(data.record)) {
	        return (
	            <Container fluid className={classnames(className,"gameBox",!this.state.isCollapsed && "expanded", preview && "preview")} style={style}>
					{this.render_titleAndCode(data.type,data.code,data.title)}

					<Collapse in={!this.state.isCollapsed}>
						<div className="content">
							{this.render_gameInfo(data.event,data.date,data.dungeonMaster,data.tier)}
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
	    } else if (data.record === "salvage") {
	    	return (
	            <Container fluid className={classnames(className,"gameBox","salvageBox",!this.state.isCollapsed && "expanded", preview && "preview")} style={style}>
					{this.render_titleAndCode(data.type,null,data.title)}

					<Collapse in={!this.state.isCollapsed}>
						<div className="content">
							{this.render_gameInfo(undefined,data.date,data.dungeonMaster,data.tier)}

							<div className="twoCol">
								<div className="leftCol arCol">
									SALVAGE<br />
									LEVEL UP?
								</div>

								<div className="rightCol arCol">
									WEALTH
								</div>
							</div>

							{this.render_advNotes(data.notes, true)}
						</div>
					</Collapse>

		    	</Container>
        	)
	    } else if (data.record === "notes") {

	    }

	    return <></>
    }
}

export default GameLog;