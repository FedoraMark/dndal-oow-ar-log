import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import { FiEdit, FiX } from "react-icons/fi";
import { FaSave } from "react-icons/fa";

import style from "./EditButton.module.scss";

class EditButton extends Component {
	static propTypes = {
		onClick: PropTypes.func.isRequired,
		className: PropTypes.string,
		active: PropTypes.bool,
		save: PropTypes.bool,
		cancel: PropTypes.bool,
		left: PropTypes.bool,
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
		console.log(this.state.cancel);
		const { onClick, className, active, save, cancel, left } = this.props;

		return (
			<span
				className={classnames(
					style.editButtonWrapper,
					className,
					this.state.active && style.active,
					(left ? style.left : style.right)
				)}
				onClick={(e) => {
					onClick();
				}}
			>
				{(!cancel && !active) && <FiEdit />}
				{(cancel || (!save && this.state.active)) && <FiX />}
				{save && this.state.active && <FaSave />}
			</span>
		);
	}
}

export default EditButton;
