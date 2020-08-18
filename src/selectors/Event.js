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
    }

    static defaultProps = {
        isSelected: false,
        disable: false,
    }

    state = {
        eventObj: this.props.eventObj,
        isSelected: this.props.isSelected === "true"
    }

    //FUNCTIONS
    toggleSelect = () => {
        this.setSelect(!this.state.isSelected);
    }

    setSelect = (val) => {
        this.setState({ isSelected: val });
    }

    //RENDERERS
    render() {
        return (
            <Container className="eventWrapper custom-control custom-checkbox">
				<input type="checkbox" className="custom-control-input" disabled={this.props.disable} checked={this.state.isSelected} onChange={this.toggleSelect.bind(this)} />
	        	<span className="contents">
		        	<h1 className="bookFont bold" onClick={this.toggleSelect.bind(this)}>{this.state.eventObj.title}.</h1>
					<p className="bookFont" onClick={this.toggleSelect.bind(this)} dangerouslySetInnerHTML={{ __html: this.state.eventObj.description }} />

					{"checkboxes" in this.state.eventObj && 
						<ul className="checkboxes" onClick={this.setSelect.bind(this, true)}>
							{_map(this.state.eventObj.checkboxes, (cell, key) => {
								return <Select key={key} type="checkbox" isDisabled={this.props.disable || !this.state.isSelected} label={cell} />
							})}
							
						</ul>
					}

					{"radios" in this.state.eventObj && 
						<div className="radios" onClick={this.setSelect.bind(this, true)}>
							<Option options={this.state.eventObj.radios} isDisabled={this.props.disable || !this.state.isSelected} />
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