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
        selection: PropTypes.bool,
        isDisabled: PropTypes.bool,
        canBlank: PropTypes.bool
    }

    static defaultProps = {
        selection: null,
        isDisabled: false,
        canBlank: false,
    }

    state = {
        selection: this.props.selection,
        isDisabled: this.props.isDisabled
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ isDisabled: nextProps.isDisabled }, () => {
        	if (this.state.isDisabled) {
        		this.setState({selection: null});
        	}
        });
    }

    //FUNCTIONS
    setSelection = (id) => {
    	if (!this.state.isDisabled) {
    		this.setState({selection: id});
    	}
    }

    //RENDERERS
    render_blankButton = () => {

    }

    render() {
        return (
            <div className={classnames("selectWrapper radio", this.state.isDisabled && "disabled")} >
                {this.props.canBlank &&
                    <Fade in={this.state.selection !== null}>
                        <div className={classnames("button", this.state.selection === null && "hidden")} onClick={this.setSelection.bind(this,null)} />
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