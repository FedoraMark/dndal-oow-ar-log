import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import InputGroup from "react-bootstrap/InputGroup";
import { FiCornerDownRight } from "react-icons/fi";

import "selectors/SelectOption.scss";

class Select extends React.Component {
    static propTypes = {
        arrKey: PropTypes.number,
        isSelected: PropTypes.bool,
        isDisabled: PropTypes.bool,
        label: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired, // "checkbox", "switch" (TBD)
        isBold: PropTypes.bool,
        selectHandler: PropTypes.func,
        isExpended: PropTypes.bool,
        title: PropTypes.string,
        indent: PropTypes.bool,
    };

    static defaultProps = {
        arrKey: -1,
        isSelected: false,
        isDisabled: false,
        isBold: false,
        selectHandler: (e) => {},
        isExpended: false,
        title: "N-A",
    };

    state = {
        isSelected: this.props.isSelected,
        isDisabled: this.props.isDisabled,
        isExpended: this.props.isExpended,
    };

    componentWillReceiveProps(nextProps) {
        this.setState(
            {
                isSelected: nextProps.isSelected,
                isDisabled: nextProps.isDisabled,
                isExpended: nextProps.isExpended,
            },
        );
    }

    //FUNCTIONS
    toggleSelect = () => {
        if (!this.state.isDisabled) {
            this.setSelect(!this.state.isSelected);
        }
    };

    setSelect = (set) => {
        this.setState({ isSelected: set },
            this.props.selectHandler(this.props.arrKey, set, this.props.title)
        );
    };

    //RENDERERS
    render() {
        const { label, type, isBold, indent} = this.props;

        if (type === "checkbox") {
            return (
                <div
                    className={classnames("selectWrapper checkbox",this.state.isDisabled && "disabled")}
                    onClick={this.toggleSelect.bind(this)}
                >
                    <InputGroup className="checkArea">
                        <InputGroup.Prepend>
                            <InputGroup.Checkbox
                                checked={this.state.isSelected}
                                disabled={this.state.isDisabled}
                                onChange={this.toggleSelect.bind(this)} // DOUBLE SELECTS WITH THIS AND ONCLICK ABOVE
                            />
                        </InputGroup.Prepend>
                        <p className={classnames("label bookFont",isBold && "bold")} >
                            {indent && <FiCornerDownRight className="arrow" />}
                            <span dangerouslySetInnerHTML={{ __html: label }} />
                        </p>
                    </InputGroup>
                </div>
            );
        }

        return null;
    }
}

export default Select;
