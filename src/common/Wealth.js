import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";

import "common/Wealth.scss";

class Wealth extends React.Component {

    static propTypes = {
        wealthObj: PropTypes.object,
        isEmpty: PropTypes.bool,
        gain: PropTypes.bool,
        loss: PropTypes.bool,
        colorless: PropTypes.bool,
        error: PropTypes.bool,
    }

    static defaultProps = {
        isEmpty: false,
        wealthObj: {},
        gain: false,
        loss: false,
        colorless: false,
        error: false,
    }

    isInvalid = (val) => {
        return !val || val === 0;
    }

    state = {
        pp: this.isInvalid(this.props.wealthObj.pp) || this.props.isEmpty ? 0 : this.props.wealthObj.pp,
        gp: this.isInvalid(this.props.wealthObj.gp) || this.props.isEmpty ? 0 : this.props.wealthObj.gp,
        ep: this.isInvalid(this.props.wealthObj.ep) || this.props.isEmpty ? 0 : this.props.wealthObj.ep,
        sp: this.isInvalid(this.props.wealthObj.sp) || this.props.isEmpty ? 0 : this.props.wealthObj.sp,
        cp: this.isInvalid(this.props.wealthObj.cp) || this.props.isEmpty ? 0 : this.props.wealthObj.cp,
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            pp: this.isInvalid(newProps.wealthObj.pp) || newProps.isEmpty ? 0 : newProps.wealthObj.pp,
            gp: this.isInvalid(newProps.wealthObj.gp) || newProps.isEmpty ? 0 : newProps.wealthObj.gp,
            ep: this.isInvalid(newProps.wealthObj.ep) || newProps.isEmpty ? 0 : newProps.wealthObj.ep,
            sp: this.isInvalid(newProps.wealthObj.sp) || newProps.isEmpty ? 0 : newProps.wealthObj.sp,
            cp: this.isInvalid(newProps.wealthObj.cp) || newProps.isEmpty ? 0 : newProps.wealthObj.cp,
        });
    }

    render() {
        const { gain, loss, colorless, error } = this.props;

        if (error) {
            return (
                <span className="wealthMoney error">—</span>
            );
        }

        let style = classnames("wealthMoney", gain && "gain", loss && "loss", colorless && "colorless");

        if (this.state.pp === 0 && this.state.gp === 0 && this.state.ep === 0 && this.state.sp === 0 && this.state.cp === 0) {
            return (
                <span className={style}>{this.state.gp}gp</span>
            );
        }

        return (
            <span className={style}>
				{this.state.pp > 0 && <>{this.state.pp}pp<span className="comma">, </span></>}
				{this.state.gp > 0 && <>{this.state.gp}gp<span className="comma">, </span></>}
				{this.state.ep > 0 && <>{this.state.ep}ep<span className="comma">, </span></>}
				{this.state.sp > 0 && <>{this.state.sp}sp<span className="comma">, </span></>}
				{this.state.cp > 0 && <>{this.state.cp}cp<span className="comma">, </span></>}
			</span>
        );
    }
}

export default Wealth;