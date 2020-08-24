import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { FiEdit, FiX } from "react-icons/fi";

import style from "./EditButton.module.scss";

class EditButton extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		className: PropTypes.string,
		active: PropTypes.bool,
	};

	static defaultProps = {
		className: "",
		active: false,
	};

	state = {
		active: this.props.active,
	};

	componentWillReceiveProps(newProps) {
		this.setState({ active: newProps.active });
	}

	render() {
		return (
			<span
				className={classnames(
					style.editButtonWrapper,
					this.props.className,
					this.state.active && style.active
				)}
				onClick={(e) => {
					this.props.onClick();
				}}
			>
				{!this.state.active && <FiEdit />}
				{this.state.active && <FiX />}
			</span>
		);
	}
}

export default EditButton;
