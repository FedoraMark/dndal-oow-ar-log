import React, { Component } from "react";
import PropTypes from "prop-types";
import Container from "react-bootstrap/Container";
import _map from "lodash/map";
import _pull from "lodash/pull";
import classnames from "classnames";
import Statebox from "react-three-state-checkbox";

import Select from "selectors/Select";
import Option from "selectors/Option";

import "selectors/Event.scss";

class Event extends Component {
    static propTypes = {
        eventObj: PropTypes.object.isRequired,
        disable: PropTypes.bool,
        updateHandler: PropTypes.func,
        status: PropTypes.object,
    };

    static defaultProps = {
        disable: false,
        updateHandler: (e) => {},
        status: {},
    };

    state = {
        eventObj: this.props.eventObj,
        status: this.props.status,
        isDisabled: this.props.disable,
        isSelected: this.props.isSelected || this.props.status.active,
        selectionObj: {
            [this.props.eventObj.title]: {
                active: this.props.isSelected,
                selections: [],
                option: -1,
            },
        },
    };

    componentWillReceiveProps(newProps) {
        this.setState({
            status: newProps.status,
            isDisabled: newProps.disable,
            isSelected: newProps.isSelected || newProps.status.active,
        });
    }

    //FUNCTIONS
    toggleSelect = () => {
        this.setSelect(!this.state.isSelected, false);
    };

    setSelect = (val, skip) => {
        if (this.state.isDisabled || this.state.status.expended || skip) {
            return;
        }

        let title = this.state.eventObj.title;
        let data = val
            ? { ...this.state.selectionObj[title] }
            : { selections: [], option: -1 };

        let selectObj = { [title]: { ...data, legacy: true, active: val } };

        this.setState(
            { isSelected: val, selectionObj: selectObj },
            this.props.updateHandler(selectObj)
        );
    };

    eventSelectHandler = (key, val) => {
        if (!this.state.isSelected) {
            return;
        }

        let title = this.state.eventObj.title;

        var newArray = [...this.state.selectionObj[title].selections];
        if (!val) {
            _pull(newArray, key);
        } else if (!newArray.includes(key)) {
            newArray.push(key);
        }

        let selectObj = {
            [title]: { legacy: true, active: true, selections: newArray },
        };

        this.setState(
            { selectionObj: selectObj },
            this.props.updateHandler(selectObj)
        );
    };

    eventOptionHandler = (key) => {
        let title = this.state.eventObj.title;
        let optionObj = {
            [title]: { legacy: true, active: true, option: key },
        };

        this.setState(
            { selectionObj: optionObj },
            this.props.updateHandler(optionObj)
        );
    };

    //RENDERERS
    render() {
        let disableSubOptions = this.state.isDisabled || !this.state.isSelected || this.state.status.expended;

        return (
            <Container
                className={classnames(
                    "eventWrapper",
                    "custom-control",
                    "custom-checkbox",
                    this.state.status.expended && "expended"
                )}
            >
                <span onClick={this.toggleSelect.bind(this)}>
                    <Statebox
                        className="custom-control-input"
                        checked={this.state.isSelected}
                        disabled={this.state.isDisabled || this.state.status.expended}
                        indeterminate={this.state.isSelected && this.state.status.expended}
                        onChange={this.toggleSelect.bind(this)}
                    />
                </span>
                <span className="contents">
                    <div
                        className="descriptionWrapper"
                        onClick={this.toggleSelect.bind(this)}
                    >
                        <h1 className="bookFont bold">
                            {this.state.eventObj.title}.
                        </h1>
                        <p
                            className="bookFont"
                            dangerouslySetInnerHTML={{__html: this.state.eventObj.description,}}
                        />
                    </div>

                    {"checkboxes" in this.state.eventObj && (
                        <ul
                            className="checkboxes"
                            onClick={this.setSelect.bind( this, true, this.state.isSelected)}
                        >
                            {_map(
                                this.state.eventObj.checkboxes, (cell, key) => {
                                    let selectionsArray = this.state.status.selections !== undefined
                                        ? this.state.status.selections
                                        : [];
                                    return (
                                        <Select
                                            key={key}
                                            arrKey={key}
                                            type="checkbox"
                                            isSelected={selectionsArray.includes(key)}
                                            isDisabled={disableSubOptions}
                                            isExpended={this.state.status.expended}
                                            label={cell}
                                            selectHandler={this.eventSelectHandler}
                                        />
                                    );
                                }
                            )}
                        </ul>
                    )}

                    {"radios" in this.state.eventObj && (
                        <div
                            className="radios"
                            onClick={this.setSelect.bind(this,true,this.state.isSelected)}
                        >
                            <Option
                                options={this.state.eventObj.radios}
                                isDisabled={disableSubOptions}
                                isExpended={this.state.status.expended}
                                selection={this.state.status.option}
                                optionHandler={this.eventOptionHandler}
                            />
                        </div>
                    )}

                    {"table" in this.state.eventObj && (
                        <ul
                            className="table"
                            onClick={this.setSelect.bind(this,true,this.state.isSelected)}
                        >
                            <Option
                                options={this.state.eventObj.table}
                                selection={this.state.status.option}
                                isDisabled={disableSubOptions}
                                isExpended={this.state.status.expended}
                                optionHandler={this.eventOptionHandler}
                            />
                        </ul>
                    )}
                </span>
            </Container>
        );
    }
}

export default Event;
