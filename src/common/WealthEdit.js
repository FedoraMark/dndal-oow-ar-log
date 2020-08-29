import React, { Component } from "react";
import PropTypes from "prop-types";
import _map from "lodash/map";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

import style from "./wealthEdit.module.scss";

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
		wealth: PropTypes.object.isRequired,
		useEp: PropTypes.bool,
	};

	static defaultProps = {
		useEp: true,
	};

	state = {
		wealth: this.props.wealth,
		useEp: this.props.useEp,
	};

	componentWillReceiveProps(newProps) {
		this.setState({
			wealth: newProps.wealth,
			useEp: newProps.useEp,
		});
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
								onChange={(e) => {
									/*this.setTempWealth(e.target.value, denom);*/
								}}
							/>
							<InputGroup.Append className={style.denomBox}>
								<InputGroup.Text>
									<OverlayTrigger
										placement="top"
										overlay={
											<Tooltip>{conversion[key]}</Tooltip>
										}
									>
										<span className="bookFont bold">
											{denom}
										</span>
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
