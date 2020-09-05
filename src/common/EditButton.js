import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Fade from "react-bootstrap/Fade";

import { FaSave } from "react-icons/fa";
import { FiEdit, FiX } from "react-icons/fi";
import { ImMenu } from "react-icons/im";

import style from "./EditButton.module.scss";

class EditButton extends Component {
	constructor(props) {
		super(props);
		this.editButton = React.createRef();
	}

	static propTypes = {
		onClick: PropTypes.func.isRequired,
		className: PropTypes.string,
		active: PropTypes.bool,
		save: PropTypes.bool,
		cancel: PropTypes.bool,
		left: PropTypes.bool,
		move: PropTypes.bool,
		hide: PropTypes.bool,
	};

	static defaultProps = {
		className: "",
		active: false,
		hide: false,
	};

	state = {
		active: this.props.active,
	};

	componentWillReceiveProps(newProps) {
		this.setState({ active: newProps.active, hide: newProps.hide });
	}

	render() {
		const { onClick, className, active, save, cancel, left, move, hide } = this.props;

		return (
			<button
				className={classnames(
					style.editButtonWrapper,
					className,
					this.state.active && style.active,
					(left ? style.left : style.right),
					save && style.save,
					cancel && style.cancel,
					move && style.move,
					hide && style.hide,
				)}
				ref={this.editButton}
				onClick={(e) => {
					onClick();
				}}
				onMouseEnter={(e) => {this.editButton.current.focus()}}
				onMouseLeave={(e) => {this.editButton.current.blur()}}
			>
				{!move && <Fade className={style.icon} in={!cancel && !active}><FiEdit /></Fade>}
				{!move && <Fade className={style.icon} in={cancel || (!save && this.state.active)}><FiX /></Fade>}
				{!move && <Fade className={style.icon} in={save && this.state.active}><FaSave /></Fade>}
				{move && <div className={style.icon}><ImMenu /></div>}
			</button>
		);
	}
}

export default EditButton;
