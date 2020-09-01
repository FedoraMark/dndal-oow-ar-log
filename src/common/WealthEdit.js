import React, { Component } from "react";
import PropTypes from "prop-types";
import _map from "lodash/map";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import style from "./wealthEdit.module.scss";

import { excludeInWealth } from "utils/Util"

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
	};

	static defaultProps = {
		updateHandler: () => {},
	};

	state = {
		wealth: this.props.fullWealth[this.props.type],
		useEp: true, //this.props.useEp,

	};

	componentWillReceiveProps(newProps) {
		this.setState({ wealth: newProps.fullWealth[this.props.type] });
	}

	setWealth = (val, denom) => {
		let newWealth = { ...this.state.wealth }
		newWealth[denom] = val === "" ? 0 : Math.abs(parseInt(val));

		this.setState({wealth: newWealth},
			this.props.updateHandler(newWealth, this.props.type)
		);
	}

	render() {
		return (
			<div className={style.coinInputsWrapper}>
				{_map(denominations, (denom, key) => {
					if (!this.state.useEp && denom === "ep") {
						return <></>;
					}

					return (
						<InputGroup key={key} className={style.money}>
							<Form.Control
								className="handwritten"
								id={denom}
								type="number"
								min="0"
								placeholder="0"
								value={
									!!this.state.wealth[denom]
										? this.state.wealth[denom].toString().replace(/^0+/, "")
										: ""
								}
								onChange={(e) => {this.setWealth(e.target.value, denom);}}
								onKeyDown={(e) => {excludeInWealth.includes(e.key) && e.preventDefault();}}
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
