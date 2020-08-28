import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Fade from "react-bootstrap/Fade";
import { FiEdit, FiX } from "react-icons/fi";
import { FaSave } from "react-icons/fa";

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
		const { onClick, className, active, save, cancel, left } = this.props;

		return (
			<button
				className={classnames(
					style.editButtonWrapper,
					className,
					this.state.active && style.active,
					(left ? style.left : style.right)
				)}
				ref={this.editButton}
				onClick={(e) => {
					onClick();
				}}
				onMouseEnter={(e) => {this.editButton.current.focus()}}
				onMouseLeave={(e) => {this.editButton.current.blur()}}
			>
				<Fade className={style.icon} in={!cancel && !active}><FiEdit /></Fade>
				<Fade className={style.icon} in={cancel || (!save && this.state.active)}><FiX /></Fade>
				<Fade className={style.icon} in={save && this.state.active}><FaSave /></Fade>
			</button>
		);
	}
}

export default EditButton;
