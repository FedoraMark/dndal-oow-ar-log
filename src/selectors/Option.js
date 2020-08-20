import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import InputGroup from 'react-bootstrap/InputGroup';
import Fade from 'react-bootstrap/Fade'
import _map from 'lodash/map';

import './SelectOption.scss';

class Option extends React.Component {

    static propTypes = {
        options: PropTypes.array.isRequired,
        selection: PropTypes.number,
        isDisabled: PropTypes.bool,
        canBlank: PropTypes.bool,
        optionHandler: PropTypes.func,
        title: PropTypes.string,
    }

    static defaultProps = {
        selection: -1,
        isDisabled: false,
        canBlank: false,
        optionHandler: (e) => {},
        title: 'N-A'
    }

    state = {
        selection: this.props.selection,
        isDisabled: this.props.isDisabled
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ isDisabled: nextProps.isDisabled }, () => {
        	if (nextProps.isDisabled) {
        		this.setState({selection: -1});
        	}
        });
    }

    //FUNCTIONS
    setSelection = (id) => {
    	if (!this.state.isDisabled) {
    		this.setState({selection: id},
                this.props.optionHandler(id, this.props.title)
            );
    	}
    }

    //RENDERERS
    render() {
        return (
            <div className={classnames("selectWrapper radio", this.state.isDisabled && "disabled")} >
                {this.props.canBlank &&
                    <Fade in={this.state.selection !== -1}>
                        <button className={classnames("button", this.state.selection === -1 && "hidden")} onClick={this.setSelection.bind(this,-1)} />
                    </Fade>
                }

				<InputGroup className="radioArea">
					{_map(this.props.options, (option, key) => {
						return (
							<div key={key} className="option" onClick={this.setSelection.bind(this,key)}>
								<InputGroup.Prepend>
									<InputGroup.Radio checked={this.state.selection === key} disabled={this.state.isDisabled} onChange={this.setSelection.bind(this,key)} />
								</InputGroup.Prepend>
							   	<p className="label bookFont" dangerouslySetInnerHTML={{ __html: option }} />
						   	</div>
						);
					})}
				</InputGroup>
			</div>
        );
    }
}

export default Option;