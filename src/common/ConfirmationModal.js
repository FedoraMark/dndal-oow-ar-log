import React, { Component } from "react";
import PropTypes from "prop-types";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

class ConfirmationModal extends Component {
	static popTypes = {
		show: PropTypes.bool.isRequired,
		onConfirm: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onHide: PropTypes.func,
		title: PropTypes.string,
		body: PropTypes.node,
		confirmButton: PropTypes.string,
		cancelButton: PropTypes.string,
		confirmButtonVariant: PropTypes.string,
		cancelButtonVariant: PropTypes.string,
	};

	static defaultProps = {
		onHide: null,
		title: "Confirm action?",
		body: (
			<p style={{ fontWeight: "bold" }}>
				This action is permanent, are you sure you want to continue?
			</p>
		),
		confirmButton: "Confirm",
		cancelButton: "Cancel",
		confirmButtonVariant: "outline-danger",
		cancelButtonVariant: "secondary",
	};

	state = {
		show: this.props.show,
	};

	componentWillReceiveProps(newProps) {
		this.setState({
			show: newProps.show,
		});
	}

	render() {
		const btnStyle = { width: "8rem" };

		return (
			<Modal
				backdrop="static"
				size="sm"
				centered
				show={this.props.show}
				onHide={
					this.props.onHide !== null
						? this.props.onHide
						: this.props.onCancel
				}
			>
				<Modal.Header closeButton>
					<h3>{this.props.title}</h3>
				</Modal.Header>

				<Modal.Body>{this.props.body}</Modal.Body>

				<Modal.Footer style={{ justifyContent: "space-between" }}>
					<Button
						variant={this.props.cancelButtonVariant}
						style={btnStyle}
						onClick={this.props.onCancel}
					>
						{this.props.cancelButton}
					</Button>
					<Button
						variant={this.props.confirmButtonVariant}
						style={btnStyle}
						onClick={this.props.onConfirm}
					>
						{this.props.confirmButton}
					</Button>
				</Modal.Footer>
			</Modal>
		);
	}
}

export default ConfirmationModal;
