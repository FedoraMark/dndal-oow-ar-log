import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";
import Collapse from "react-bootstrap/collapse";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import _map from "lodash/map";

import Event from "./selectors/Event";
import Select from "./selectors/Select";
import Option from "./selectors/Option";
import Wealth from "./common/Wealth";

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
        this.setState({ isCollapsed: !this.state.isCollapsed });
    }

    //RENDERERS
    render_titleAndCode = (type, code, title) => {
        return (
            <div className="titleWrapper" onClick={this.toggleCollapsed.bind(this)}>
				<h1 className="title">{type}: <span className="code" dangerouslySetInnerHTML={{ __html: code.split("-").join("<span class='hyphen'>-</span>") }}></span> {title}</h1>
			</div>);
    }

    render_gameInfo = (event, date, dmObj, tier) => {
        var dmStr = '';
        if (dmObj !== undefined) {
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
					{date !== undefined && <li><h1 className="date">Date:</h1><p>{date}</p></li>}
					{event !== undefined && <li><h1 className="event">Event:</h1><p>{event}</p></li>}
					{tier !== undefined && <li><h1 className="tier">Tier:</h1><p>{tier}</p></li>}
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
        return (
            <Container className="advWrapper wrapper">
					<h1>Advancement</h1>
					<div className="box">
						<Select label={advObj.label} type="checkbox" isSelected={advObj.isSelected} isBold />
						<p className="bookFont footnote">{advObj.footnote}</p>
					</div>
			</Container>
        );
    }

    render_rewards = (rewardObj) => {
        return (
            <Container className="rewardsWrapper wrapper">
					<h1>Rewards</h1>
					<div className="box content">
						{_map(rewardObj, (rewardGroup, key) => {
							return  (
								<div key={key} className="rewardGroup">
									<h1 className="bookFont bold">{rewardGroup.instruction}</h1>
									{"options" in rewardGroup && <Option options={rewardGroup.options} />}

									{"selections" in rewardGroup &&
										<span>
											{_map(rewardGroup.selections, (selection, key) => {
												return <Select key={key} label={selection} type="checkbox" />
											})}
										</span>
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
				<h1>Character Wealth</h1>
					
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
				<h1>Legacy Events</h1>
				<Container className="box">
					<div className="content">
						{_map(legacyObj.events, (event, key) => {
							return <Event eventObj={event} key={key} />
						})}
					</div>
					<div className="footnote bookFont">{legacyObj.footnote}</div>
				</Container>
			</Container>
        );
    }

    render() {
        const { data } = this.props;

        return (
            <Container fluid className={classnames("gameBox",!this.state.isCollapsed && "expanded")}>
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
    }
}

export default GameLog;