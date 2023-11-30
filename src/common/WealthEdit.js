import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _map from "lodash/map";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import style from "./WealthEdit.module.scss";

import { excludeInWealth } from "../utils/Util"

const denominations = ["pp", "gp", "ep", "sp", "cp"];
const conversion = [
    "platinum (1000cp)",
    "gold (100cp)",
    "ethereum (50cp)",
    "silver (10cp)",
    "copper (1cp)",
];

class WealthEdit extends Component {
    static propTypes = {
        fullWealth: PropTypes.object.isRequired,
        type: PropTypes.string.isRequired, // starting, spent, earned, ending
        updateHandler: PropTypes.func,
        disabled: PropTypes.bool,
        error: PropTypes.bool,
        isStart: PropTypes.bool,
    };

    static defaultProps = {
        updateHandler: () => {},
        disabled: false,
        error: false,
        isStart: false,
    };

    state = {
        wealth: this.props.isStart ? this.props.fullWealth.ending : this.props.fullWealth[this.props.type],
        disabled: this.props.disabled,
        error: this.props.error,
        useEp: true, //this.props.useEp,
    };

    componentWillReceiveProps(newProps) {
        this.setState({
            disabled: newProps.disabled,
            error: newProps.error,
            wealth: newProps.isStart ? newProps.fullWealth.ending : newProps.fullWealth[newProps.type],
        });
    }

    setWealth = (val, denom) => {
        let newWealth = { ...this.state.wealth }
        newWealth[denom] = val === "" ? 0 : Math.abs(parseInt(val));

        this.setState({ wealth: newWealth },
            this.props.updateHandler(newWealth, this.props.isStart ? "ending" : this.props.type)
        );
    }

    render() {
        if (!this.state.wealth) {
            return <></>;
        }

        return (
            <div className={style.coinInputsWrapper}>
				{_map(denominations, (denom, key) => {
					if (denom === "ep" && !this.state.useEp) {
						return <></>;
					}

					let value = !!this.state.wealth[denom]
						? this.state.wealth[denom].toString().replace(/^0+/, "")
						: "";

					return (
						<InputGroup key={key} className={classnames(style.money, this.state.error && style.error)}>
							<Form.Control
								className="handwritten"
								id={denom}
								type={this.state.error ? "text" : "number"}
                                pattern="[0-9]*"
								min="0"
								placeholder="0"
								value={this.state.error ? "—" : value}
								onChange={(e) => {this.setWealth(e.target.value, denom);}}
								onKeyDown={(e) => {excludeInWealth.includes(e.key) && e.preventDefault();}}
								disabled={this.state.disabled}
                                autoComplete={denom === "cp" ? "new-password" : "off"}
							/>
							<InputGroup.Append className={style.denomBox}>
								<InputGroup.Text>
									<OverlayTrigger
										placement="top"
										overlay={<Tooltip>{conversion[key]}</Tooltip>}
									>
										<span className="bookFont bold">{denom}</span>
									</OverlayTrigger>
								</InputGroup.Text>
							</InputGroup.Append>
						</InputGroup>
					);
				})}
			</div>
        );
    }
}

export default WealthEdit;