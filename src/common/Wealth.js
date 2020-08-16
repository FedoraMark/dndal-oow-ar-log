import React from 'react';
import PropTypes from 'prop-types';
import classnames from "classnames";

import "./Wealth.scss";

class Wealth extends React.Component {

    static propTypes = {
        wealthObj: PropTypes.object,
        isEmpty: PropTypes.bool,
        gain: PropTypes.bool,
        loss: PropTypes.bool,
        colorless: PropTypes.bool
    }

    static defaultProps = {
        isEmpty: false,
        wealthObj: {},
        gain: false,
        loss: false,
        colorless: false
    }

    state = {
        pp: this.props.wealthObj.pp === undefined || this.props.isEmpty ? 0 : this.props.wealthObj.pp,
        gp: this.props.wealthObj.gp === undefined || this.props.isEmpty ? 0 : this.props.wealthObj.gp,
        ep: this.props.wealthObj.ep === undefined || this.props.isEmpty ? 0 : this.props.wealthObj.ep,
        sp: this.props.wealthObj.sp === undefined || this.props.isEmpty ? 0 : this.props.wealthObj.sp,
        cp: this.props.wealthObj.cp === undefined || this.props.isEmpty ? 0 : this.props.wealthObj.cp,
    }

    render() {
        const { gain, loss, colorless } = this.props;

        let style = classnames("money", gain && "gain", loss && "loss", colorless && "colorless");

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