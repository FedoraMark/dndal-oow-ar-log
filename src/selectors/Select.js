import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import InputGroup from 'react-bootstrap/InputGroup';

import './Select.scss';

class Select extends React.Component {
    static propTypes = {
        isSelected: PropTypes.bool,
        isDisabled: PropTypes.bool,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired, // "checkbox", "radio" (TBD), "switch" (TBD)
        selection: PropTypes.object,
        isBold: PropTypes.bool
    }

    static defaultProps = {
        isSelected: false,
        isDisabled: false,
        isBold: false,
        selection: null
    }

    state = {
        isSelected: this.props.isSelected,
        isDisabled: this.props.isDisabled,
        selection: this.props.selection
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ isDisabled: nextProps.isDisabled });
    }

    //FUNCTIONS
    toggleSelect = () => {
        if (!this.state.isDisabled) {
            this.setState({ isSelected: !this.state.isSelected });
        }
    }

    //RENDERERS
    render() {
        const { label, type, isBold } = this.props;

        if (type === "checkbox") {
            return (
                <div className={classnames("selectWrapper checkbox", this.state.isDisabled && "disabled")} onClick={this.toggleSelect.bind(this)}>
					<InputGroup className="checkArea">
						<InputGroup.Prepend>
							<InputGroup.Checkbox checked={this.state.isSelected} disabled={this.state.isDisabled} onChange={this.toggleSelect.bind(this)} />
						</InputGroup.Prepend>
					   	<p className={classnames("label bookFont", this.props.isBold && "bold")}>{label}</p>
					</InputGroup>
				</div>
            );
        }

        return (null);

    }
}

export default Select;