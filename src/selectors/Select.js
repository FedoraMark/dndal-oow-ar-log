import React from 'react';
import PropTypes from 'prop-types';
import InputGroup from 'react-bootstrap/InputGroup';

import './Select.scss';

class Select extends React.Component {

	static propTypes = {
		isSelected: PropTypes.bool,
		isDisabled: PropTypes.bool,
		label: PropTypes.string.isRequired,
		type: PropTypes.string.isRequired,  // "checkbox", "radio"
		selectedItem: PropTypes.string
	}

	static defaultProps = {
		isSelected: false,
		isDisabled: false,
		selectedItem: ''
	}

	state = {
		isSelected: this.props.isSelected,
		isDisabled: this.props.isDisabled
	}

	//FUNCTIONS
	toggleSelect = () => {
		this.setState({isSelected: !this.state.isSelected});
	}

	//RENDERERS
	render() {
		const {label, type} = this.props;

		if (type === "checkbox") {
	  		return (
		    	<div className="selectWrapper checkbox" onClick={this.toggleSelect.bind(this)}>
					<InputGroup className="checkArea">
						<InputGroup.Prepend>
							<InputGroup.Checkbox checked={this.state.isSelected} onChange={this.toggleSelect.bind(this)} aria-label="Checkbox for following text input" />
						</InputGroup.Prepend>
					     <p className="label bookFont bold">{label}</p>
					</InputGroup>
				</div>
		  	);
	  	} else if (type === "radio") {
		  	return (
		  		<div className="selectWrapper radio">

		  		</div>
		  	);
		}
	}
}

export default Select;
