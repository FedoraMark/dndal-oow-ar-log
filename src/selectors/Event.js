import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import _map from "lodash/map";
import _pull from "lodash/pull";

import Select from 'selectors/Select';
import Option from 'selectors/Option';

import "selectors/Event.scss";

class Event extends Component {
    static propTypes = {
        eventObj: PropTypes.object.isRequired,
        isSelected: PropTypes.bool,
        disable: PropTypes.bool,
        updateHandler: PropTypes.func
    }

    static defaultProps = {
        isSelected: false,
        disable: false,
        updateHandler: (e) => {}
    }

    state = {
        eventObj: this.props.eventObj,
        isSelected: this.props.isSelected === "true",
        selectionObj: {[this.props.eventObj.title]: {active: this.props.isSelected, selections: [], option: -1}}
    }

    //FUNCTIONS
    toggleSelect = () => {
        this.setSelect(!this.state.isSelected, false);
    }

    setSelect = (val, skip) => {
        if (skip) {
            return;
        }

    	let title = this.state.eventObj.title;
    	let data = val ? {...this.state.selectionObj[title]} : {selections: [], option: -1};

    	let selectObj = {[title]: {...data, legacy: true, active: val }};

		this.setState({ isSelected: val, selectionObj: selectObj },
        	this.props.updateHandler(selectObj)
        );	

    }

    eventSelectHandler = (key, val) => {
    	let title = this.state.eventObj.title;

    	var newArray = this.state.selectionObj[title].selections;
        if (!val) {
            _pull(newArray, key);
        } else {
            newArray.push(key);
        }

    	let selectObj = {[title]: {legacy: true, active: true, selections: newArray  }};

    	this.setState({selectionObj: selectObj},
        	this.props.updateHandler(selectObj)
        );
    }

    eventOptionHandler = (key) => {
    	let title = this.state.eventObj.title;
    	let optionObj = {[title]: {legacy: true, active: true, option: key }};

    	this.setState({selectionObj: optionObj},
        	this.props.updateHandler(optionObj)
        );
    }

    //RENDERERS
    render() {
        return (
            <Container className="eventWrapper custom-control custom-checkbox">
				<input type="checkbox" className="custom-control-input" disabled={this.props.disable} checked={this.state.isSelected} onChange={(e) => {}} onClick={this.toggleSelect.bind(this)} />
	        	<span className="contents">
		        	<div className="descriptionWrapper" onClick={this.toggleSelect.bind(this)}>
		        		<h1 className="bookFont bold">{this.state.eventObj.title}.</h1>
						<p className="bookFont" dangerouslySetInnerHTML={{ __html: this.state.eventObj.description }} />
					</div>

					{"checkboxes" in this.state.eventObj && 
						<ul className="checkboxes" onClick={this.setSelect.bind(this, true, this.state.isSelected)}>
							{_map(this.state.eventObj.checkboxes, (cell, key) => {
								return <Select key={key} arrKey={key} type="checkbox" isDisabled={this.props.disable || !this.state.isSelected} label={cell} selectHandler={this.eventSelectHandler} />
							})}
						</ul>
					}

					{"radios" in this.state.eventObj && 
						<div className="radios" onClick={this.setSelect.bind(this, true, this.state.isSelected)}>
							<Option options={this.state.eventObj.radios} isDisabled={this.props.disable || !this.state.isSelected} optionHandler={this.eventOptionHandler} />
						</div>
					}
					
					{"table" in this.state.eventObj && 
						<ul className="table" onClick={this.setSelect.bind(this, true, this.state.isSelected)}>
                            <Option options={this.state.eventObj.table} isDisabled={this.props.disable || !this.state.isSelected} optionHandler={this.eventOptionHandler} />
						</ul>
					}
		        </span>
			</Container>
        );
    }
}

export default Event;