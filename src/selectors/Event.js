import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Container from 'react-bootstrap/Container';
import Select from './Select';
import Option from './Option';
import _map from "lodash/map";

import "./Event.scss";

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
        selectionObj: {[this.props.eventObj.title]: {"active": this.props.isSelected, "selections": [], "option": -1}}
    }

    //FUNCTIONS
    toggleSelect = () => {
        this.setSelect(!this.state.isSelected, false);
    }

    setSelect = (val,skip) => {
    	if (skip) {
    		return;
    	}

    	let title = this.state.eventObj.title;
    	let data = val ? {...this.state.selectionObj[title]} : {"selections": [], "option": -1};

    	let selectObj = {[title]: {...data, "active": val }};

		this.setState({ isSelected: val, selectionObj: selectObj },
        	this.props.updateHandler(selectObj)
        );	

    }

    selectHandler = (key, val) => {
    	let title = this.state.eventObj.title;

    	var newArr = this.state.selectionObj[title].selections;
    	newArr[key] = val;

    	let selectObj = {[title]: {"active": true, "selections": newArr  }};

    	this.setState({selectionObj: selectObj},
        	this.props.updateHandler(selectObj)
        );
    }

    optionHandler = (key) => {
    	let title = this.state.eventObj.title;
    	let selectObj = {[title]: {"active": true, "option": key }};

    	this.setState({selectionObj: selectObj},
        	this.props.updateHandler(selectObj)
        );
    }

    //RENDERERS
    render() {
        return (
            <Container className="eventWrapper custom-control custom-checkbox">
				<input type="checkbox" className="custom-control-input" disabled={this.props.disable} checked={this.state.isSelected} onChange={this.toggleSelect.bind(this)} />
	        	<span className="contents">
		        	<div className="descriptionWrapper" onClick={this.toggleSelect.bind(this)}>
		        		<h1 className="bookFont bold">{this.state.eventObj.title}.</h1>
						<p className="bookFont" dangerouslySetInnerHTML={{ __html: this.state.eventObj.description }} />
					</div>

					{"checkboxes" in this.state.eventObj && 
						<ul className="checkboxes" onClick={this.setSelect.bind(this, true, this.state.isSelected)}>
							{_map(this.state.eventObj.checkboxes, (cell, key) => {
								return <Select key={key} arrKey={key} type="checkbox" isDisabled={this.props.disable || !this.state.isSelected} label={cell} selectHandler={this.selectHandler} />
							})}
						</ul>
					}

					{"radios" in this.state.eventObj && 
						<div className="radios" onClick={this.setSelect.bind(this, true, this.state.isSelected)}>
							<Option options={this.state.eventObj.radios} isDisabled={this.props.disable || !this.state.isSelected} optionHandler={this.optionHandler} />
						</div>
					}
					
					{"table" in this.state.eventObj && 
						<ul className="table" onClick={this.toggleSelect.bind(this)}>
							{_map(this.state.eventObj.table, (cell, key) => {
								return <li className="bookFont" key={key} dangerouslySetInnerHTML={{ __html: cell }} />
							})}
						</ul>
					}
		        </span>
			</Container>
        );
    }
}

export default Event;