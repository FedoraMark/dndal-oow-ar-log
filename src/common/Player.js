import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import _each from "lodash/each";
import _map from "lodash/map";
import Collapse from "react-bootstrap/Collapse";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Fade from "react-bootstrap/Fade";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Modal from "react-bootstrap/Modal";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useToasts } from "react-toast-notifications";

import { AiTwotoneDelete } from "react-icons/ai";
import { HiPlusCircle } from "react-icons/hi";
import { IoIosCalculator, IoMdHelpCircle } from "react-icons/io";

import Wealth from "common/Wealth";
import EditButton from "common/EditButton";

import {
    animFaster,
    bounceIn,
    getTotalCopper,
    trimStringsInObjectFlatly,
    condenseWealth,
    classes5e,
    classesUA,
    excludeInWealth
} from "utils/Util";

import "./Player.scss";

function withToast(Component) {
    return function WrappedComponent(props) {
        const toastFuncs = useToasts();
        return <Component {...props} {...toastFuncs} />; //BUG - Exclude EP - "Warning: Each child in a list should have a unique "key" prop.""
    };
}

class Player extends Component {
    static propTypes = {
        playerObj: PropTypes.object.isRequired,
        optionsObj: PropTypes.object,
        saveHandler: PropTypes.func,
        totalLevels: PropTypes.number.isRequired,
        latestWealth: PropTypes.object.isRequired,
    };

    static defaultProps = {
        optionsObj: {
            autoLeveling: "",
            tierSetting: 0,
            // useEp: true,
            autoWealth: false,
        },
        saveHandler: (e) => {},
    };

    state = {
        playerObj: this.props.playerObj,
        tempObj: { ...this.props.playerObj },

        totalLevels: this.props.totalLevels,
        isEditing: false,
        topClass: "",
        mountAnimSpeed: {},
        showHelpModal: false,

        // options
        autoLeveling: this.props.optionsObj.autoLeveling,
        tierSetting: this.props.optionsObj.tierSetting,
        useEp: true, //this.props.optionsObj.useEp,
        autoWealth: this.props.optionsObj.autoWealth,

        // temp
    	tempAutoLeveling: this.props.optionsObj.autoLeveling,
        tempTierSetting: this.props.optionsObj.tierSetting,
        tempUseEp: true, // this.props.optionsObj.useEp,
        tempAutoWealth: this.props.optionsObj.autoWealth,

        latestWealth: this.props.latestWealth,
        // noEpLatestWealth: {}
        
    };

    // componentDidMount() {
    // 	this.getNoEpWealth(this.state.latestWealth)
    // }

    componentWillReceiveProps(newProps) {
        this.setState({
            playerObj: newProps.playerObj,
            totalLevels: newProps.totalLevels,
            latestWealth: newProps.latestWealth,
            // noEpLatestWealth: this.getNoEpWealth(newProps.latestWealth),

            autoLeveling: newProps.optionsObj.autoLeveling,
            tierSetting: newProps.optionsObj.tierSetting,
            useEp: true, //newProps.optionsObj.useEp,
            autoWealth: newProps.optionsObj.autoWealth,
        },
        	(e) => {
        		if (this.state.tempAutoWealth) {
        			this.updateTempInfo("wealth",this.state.latestWealth)
        		}
        	}
        );
    }

    //FUNCTIONS
    getPlayerDciStr = () => {
        var str = "";
        if (!!this.state.playerObj.player) {
            str = this.state.playerObj.player;
            if (!!this.state.playerObj.dci) {
                str = str + " (" + this.state.playerObj.dci + ")";
            }
        } else if (!!this.state.playerObj.dci) {
            str = this.state.playerObj.dci;
        }

        return str;
    };

    editInfo = (closeWithoutSaving) => {
        if (this.state.isEditing && !closeWithoutSaving) {
            // SAVE
            this.saveAutoLevel().then((p) => {
	            this.setState({
	                isEditing: false,
	                playerObj: trimStringsInObjectFlatly({...this.state.tempObj}),
	                autoLeveling: this.state.tempAutoLeveling,
	            	tierSetting: this.state.tempTierSetting,
	            	// useEp: this.state.tempUseEp,
	            	autoWealth: this.state.tempAutoWealth,
	            }, this.props.saveHandler(
	            	trimStringsInObjectFlatly({...this.state.tempObj}), 
	            	{
	                	autoLeveling: this.state.tempAutoLeveling,
	                	tierSetting: this.state.tempTierSetting,
	                	// useEp: this.state.tempUseEp,
	                	autoWealth: this.state.tempAutoWealth,
	            	}
	            ))
            });
        } else {
            // CANCEL
            this.setState({
                isEditing: !this.state.isEditing,
                tempObj: { ...this.state.playerObj },
                tempAutoLeveling: this.props.optionsObj.autoLeveling,
                tempTierSetting: this.props.optionsObj.tierSetting,
                // tempUseEp: this.props.optionsObj.useEp,
                tempAutoWealth: this.props.optionsObj.autoWealth,
            });
        }
    };

    updateTempInfo = (attr, val) => {
        var newObj = this.state.tempObj;
        newObj[attr] = val;
        this.setState({ tempObj: newObj });
    };

    setTempWealth = (money, denom) => {   
        let tempWealthObj = {
            ...this.state.tempObj.wealth,
            [denom]: money === "" ? 0 : Math.abs(parseInt(money)),
        };

        this.updateTempInfo("wealth", tempWealthObj);
    };

    calcWealth = () => {
    	if (this.state.tempAutoWealth) {
    		var newWealthObj = { ...this.state.latestWealth };
    		return;
    	}

        let condensedObj = condenseWealth(getTotalCopper(this.state.tempObj.wealth),this.state.tempUseEp);

        if (
            JSON.stringify(condensedObj) === JSON.stringify(this.state.tempObj.wealth)
        ) {
            this.props.addToast("No change to coinage", { appearance: "info" });
        } else {
            this.props.addToast("Coinaged condensed", { appearance: "success" });
        }

        this.updateTempInfo("wealth", condensedObj);
    };

    getTier = () => {
        if (this.state.tempTierSetting > 0) {
            return this.state.tempTierSetting;
        }

        var totalLevel = 0;

        if (this.state.autoLeveling !== "") {
        	totalLevel = this.state.totalLevels;
        } else {
	        _each(this.state.playerObj.classes, (lv) => {
	            totalLevel += lv;
	        });
	    }

        if (totalLevel < 1) { return 0; }
        if (totalLevel < 5) { return 1; }
        if (totalLevel < 11) { return 2; }
        if (totalLevel < 17) { return 3; }
        return 4;
    };

//     setTempUseEp = (val) => {
//         // convert EP to SP and add to SP
//         if (!val && this.state.tempObj.wealth.ep !== 0) {
//             var newWealthObj = { ...this.state.tempObj.wealth };
//             let newSp = newWealthObj.ep * 5;
//             newWealthObj.sp = newWealthObj.sp + newSp;
//             newWealthObj.ep = 0;
//             this.updateTempInfo("wealth", newWealthObj);
//             this.props.addToast(
//                 (newSp / 5 + " ep converted into " + newSp + " sp"), { appearance: "warning" }
//             );
//         }
// 
//         this.setState({ tempUseEp: val });
//     };
// 
//     getNoEpWealth = (wealthObj) => {
// 		var noEpLatestWealth = {...wealthObj};
// 		noEpLatestWealth.sp = noEpLatestWealth.ep * 5;
// 		noEpLatestWealth.ep = 0;
// 
// 		return noEpLatestWealth;
//     }

    addNewClass = () => {
        this.setState({ mountAnimSpeed: { animationDuration: "inerit" } });

        if (Object.keys(this.state.tempObj.classes).length > 14) {
            this.props.addToast("Leeloo Dallas multiclass", {
                appearance: "error",
            });
            return;
        }

        var newClassObj = { ...this.state.tempObj.classes };
        var newClassName = "";

        // prevent duplicate names
        let i = Object.keys(newClassObj).length + 1;
        do {
            newClassName = "Multiclass " + i;
            i++;
        } while (Object.keys(newClassObj).includes(newClassName));

        newClassObj[newClassName] = 1; // set to level 1

        this.updateTempInfo("classes", newClassObj);
    };

    setClassLevel = (oldClass, newClass, newLevel) => {
        var newClassLevelObj = {};

        _map(this.state.tempObj.classes, (lv, cl) => {
            if (cl === oldClass) {
                newClassLevelObj[newClass] = newLevel;
            } else {
                newClassLevelObj[cl] = lv;
            }
        });

        this.updateTempInfo("classes", newClassLevelObj);
    };

    removeClass = (cl) => {
        var newClObj = { ...this.state.tempObj.classes };
        delete newClObj[cl];

        this.updateTempInfo("classes", newClObj);
    };

    setTopClass = (clss) => {
        this.setState({ topClass: clss });
    };

    getAutoLevel = () => {
    	var otherLevelCount = 0;

    	_map(this.state.tempObj.classes, (lv,clss) => {
    		if (clss !== this.state.tempAutoLeveling) {
    			otherLevelCount += lv;
    		}
    	})

    	if (otherLevelCount > this.state.totalLevels) {
    		// console.error("WARNING: Manual levels ");
    		return 0;
    	}

    	return this.state.totalLevels - otherLevelCount + 1;
    	
    }

    saveAutoLevel = async (clss) => {
    	_map(this.state.tempObj.classes, (lv,clss) => {
    		if (clss === this.state.tempAutoLeveling) {
    			this.setClassLevel(clss,clss,this.getAutoLevel())
    			return;
    		}
    	});
    }

    //RENDERERS
    render_displayInfo = () => {
    	var wealthObj = this.state.tempAutoWealth ? this.state.latestWealth : this.state.playerObj.wealth;
    	// if (!this.state.tempUseEp) {
    	// 	wealthObj = this.state.tempAutoWealth ? this.getNoEpWealth(this.state.latestWealth) : this.getNoEpWealth(this.state.playerObj.wealth);
    	// }

        return (
            <span className="playerBoxContent">
				{!!this.state.playerObj.character && (
					<div className="infoItem">
						<h1>Character:</h1>
						<p>{this.state.playerObj.character}</p>
					</div>
				)}

				{this.state.playerObj.tier !== -1 && (
					<div className="infoItem tierItem">
						<h1>Tier:</h1>
						<ul className="tierList">
							<li className={this.getTier() > 0 ? "filled" : ""}>1</li>
							<li className={this.getTier() > 1 ? "filled" : ""}>2</li>
							<li className={this.getTier() > 2 ? "filled" : ""}>3</li>
							<li className={this.getTier() > 3 ? "filled" : ""}>4</li>
						</ul>
					</div>
				)}

				{(!!this.state.playerObj.player ||
					!!this.state.playerObj.dci) && (
					<div className="infoItem">
						<h1>Player:</h1>
						<p>{this.getPlayerDciStr()}</p>
					</div>
				)}

				{!!this.state.playerObj.base && (
					<div className="infoItem">
						<h1>Base:</h1>
						<p>{this.state.playerObj.base}</p>
					</div>
				)}

				{!!this.state.playerObj.wealth &&
					getTotalCopper(this.state.playerObj.wealth) > 0 && (
						<div className="infoItem">
							<h1>Wealth:</h1>
							<p>
								<Wealth wealthObj={wealthObj} />
							</p>
						</div>
					)}

				{Object.keys(this.state.playerObj.classes).length > 0 && (
					<div className="infoItem">
						<h1>
							{"Class" +
								(Object.keys(this.state.playerObj.classes)
									.length !== 1
									? "es:"
									: ":")}
						</h1>
						<p className="classList">
							{_map(this.state.playerObj.classes,(level, clss) => {
								var autoLevelNum = this.state.autoLeveling === clss ? this.getAutoLevel() : level
								return (
									<span className="class" key={clss}>
										{clss + " (" + autoLevelNum + ")"}
										<span className="comma">, </span>
									</span>
								);
							})}
						</p>
					</div>
				)}
			</span>
        );
    };

    render_editInfo = () => {
        let classLen = Object.keys(this.state.tempObj.classes).length;

        return (
            <Collapse
				in={this.state.isEditing}
				onExited={(e) => {
					this.setState({
						mountAnimSpeed: { animationDuration: "0s" },
					});
				}}
				onEntered={(e) => {
					this.setState({
						mountAnimSpeed: { animationDuration: "inerit" },
					});
				}}
				mountOnEnter
				unmountOnExit
			>
				<div className="editingContent">
					<ul className="editingFlex">
						{/* CHARACTER NAME */}
						<InputGroup as="li" className="playerInfoGroup">
							<InputGroup.Prepend>
								<InputGroup.Text id="character-name">
									Character
									<span className="condense">&nbsp;Name</span>
								</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control
								className="handwritten"
								id="charaName"
								value={this.state.tempObj.character}
								onChange={(e) => {
									this.updateTempInfo(
										"character",
										e.target.value
									);
								}}
							/>
						</InputGroup>

						{/* PLAYER NAME AND DCI # */}
						<li className="group playerInfoWrapper">
							<InputGroup className="playerInfoGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="player-name">
										Player
										<span className="condense">
											&nbsp;Name
										</span>
									</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control
									className="handwritten"
									id="playerName"
									value={this.state.tempObj.player}
									onChange={(e) => {
										this.updateTempInfo(
											"player",
											e.target.value
										);
									}}
								/>
							</InputGroup>

							<InputGroup className="playerInfoGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="player-dci">
										<span className="condense">
											Player&nbsp;
										</span>
										DCI&nbsp;#
									</InputGroup.Text>
								</InputGroup.Prepend>
								<Form.Control
									className="handwritten"
									id="playerDci"
									value={this.state.tempObj.dci}
									onChange={(e) => {
										this.updateTempInfo(
											"dci",
											e.target.value
										);
									}}
								/>
							</InputGroup>
						</li>

						{/* ASSIGNED BASE */}
						<InputGroup as="li" className="playerInfoGroup">
							<InputGroup.Prepend>
								<InputGroup.Text id="base-name">
									<span className="condense">
										Assigned&nbsp;
									</span>
									Base
								</InputGroup.Text>
							</InputGroup.Prepend>
							<Form.Control
								className="handwritten"
								id="baseName"
								value={this.state.tempObj.base}
								onChange={(e) => {
									this.updateTempInfo("base", e.target.value);
								}}
							/>
						</InputGroup>

						{/* CURRENT WEALTH */}
						<li className="group wealthWrapper splitGroupWrapper">
							<InputGroup className="wealthGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="current-wealth">
										<span className="condense">
											Current&nbsp;
										</span>
										Wealth
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							{/* Should really do this as a grid */}
							<div className="currencyInputsWrapper middleGroup">
								{_map(
									["pp", "gp", "ep", "sp", "cp"],
									(denom, key) => {
										let conversion = [
											"platinum (1000cp)",
											"gold (100cp)",
											"ethereum (50cp)",
											"silver (10cp)",
											"copper (1cp)",
										];

										// if ( !this.state.tempUseEp && denom === "ep" ) {return <></>;}

										let currentWealthObj = this.state.tempAutoWealth ? this.state.latestWealth : this.state.tempObj.wealth;

										return (
											<InputGroup
												key={key}
												className={"money " + denom}
											>
												<Form.Control
													className="handwritten"
													id={denom}
													type="number"
													min="0"
													placeholder="0"
													disabled={this.state.tempAutoWealth}
													value={currentWealthObj[denom].toString().replace(/^0+/, "")}
													onChange={(e) => {this.setTempWealth(e.target.value,denom);}}
													onKeyDown={(e) => {excludeInWealth.includes(e.key) && e.preventDefault();}}
												/>
												<InputGroup.Append>
													<InputGroup.Text id={denom}>
														<OverlayTrigger
															placement="top"
															overlay={
																<Tooltip>{conversion[key]}</Tooltip>
															}
														>
															<span className="bookFont bold">{denom}</span>
														</OverlayTrigger>
													</InputGroup.Text>
												</InputGroup.Append>
											</InputGroup>
										);
									}
								)}
							</div>

							<InputGroup
								className={classnames("calcButtonGroup rightGroup", this.state.tempAutoWealth && "disabled")}
								onClick={this.calcWealth.bind(this)}
							>
								<OverlayTrigger
									placement="top"
									overlay={<Tooltip>Condense Coinage</Tooltip>}
									trigger={this.state.tempAutoWealth ? [] : ['hover','focus']}
								>
									<InputGroup.Append as="button">
										<InputGroup.Text id="wealth-calc">
											<span className="calcMoneyIcon">
												<IoIosCalculator />
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								</OverlayTrigger>
							</InputGroup>
						</li>

						{/* CLASSES AND LEVELS */}
						<li className="group classLevelWrapper splitGroupWrapper">
							<InputGroup className="playerInfoGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-name">
										Classes
										<span className="condense">
											&nbsp;/&nbsp;Levels
										</span>
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="dropdownsWrapper middleGroup">
								{Object.keys(this.state.tempObj.classes).length === 0 && 
									<div className="placeholderNote">(no classes added)</div>
								}


								{_map(this.state.tempObj.classes, (level, clss) => {
									var levelForClass = clss === this.state.tempAutoLeveling ? this.getAutoLevel() : level;

									return (
										<InputGroup
											key={clss}
											className={classnames(
												"playerInfoGroup classDropdownGroup",
												animFaster,
												bounceIn,
												this.state.topClass === clss && "zFix",
												classLen === 1 && "firstLast",
												this.state.tempAutoLeveling !== "" && "disabled",
												this.state.tempAutoLeveling === clss && "disabledClass"
											)}
											onClick={this.setTopClass.bind(this,clss)}
											style={this.state.mountAnimSpeed}
										>
											{this.render_classLevelDropDown(clss,levelForClass)}
										</InputGroup>
									);
								})}

								{/* this should really be a grid */}
								<InputGroup className="fillerGroup filler1" />
								<InputGroup className="fillerGroup filler2" />
							</div>

							<InputGroup
								className="addClassGroup rightGroup"
								onClick={this.addNewClass.bind(this)}
							>
								<InputGroup.Append as="button">
									<InputGroup.Text id="add-class">
										<span className="plusIcon">
											<HiPlusCircle />
										</span>
									</InputGroup.Text>
								</InputGroup.Append>
							</InputGroup>
						</li>

						{/* OPTIONS */}
						<li className="group optionsLevelWrapper splitGroupWrapper">
							<InputGroup className="playerInfoGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-options">
										Options
									</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="playerInfoOptions middleGroup">
								{/* set leveling */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									<DropdownButton
										variant="light"
										title={this.state.tempAutoLeveling ? ("Auto-leveling " + this.state.tempAutoLeveling.toUpperCase().replace(/ /g, "\u00a0")) : "Manual Levels"}
										alignRight
									>
										<Dropdown.Item
											href="#"
											eventKey="f"
											active={this.state.tempAutoLeveling === ""}
											onSelect={(e) => {this.setState({tempAutoLeveling: ""});}}
										>
											Manual<span className="condense">ly&nbsp;Assign</span>&nbsp;Levels
										</Dropdown.Item>

										<Dropdown.Divider />

										{Object.keys(this.state.tempObj.classes).length === 0 && 
											<Dropdown.Item
												href="#"
												disabled
											>
												(create a class<span className="condense"> to auto-level</span>)
											</Dropdown.Item>
										}

										{_map(this.state.tempObj.classes, (level, clss) => {
											return (
												<Dropdown.Item
													href="#"
													key={clss}
													eventKey={clss}
													active={this.state.tempAutoLeveling === clss}
													onSelect={(e) => {this.setState({tempAutoLeveling: clss})}}
												>
													Auto-level {clss.toUpperCase().replace(/ /g, "\u00a0")}
												</Dropdown.Item>
											);
										})}
									</DropdownButton>
								</InputGroup>

								{/* set tier */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									<DropdownButton
										variant="light"
										title={this.state.tempTierSetting > 0 ? "Tier " + this.state.tempTierSetting : "Auto Tier"}
										alignRight
									>
										<Dropdown.Item
											href="#"
											eventKey="0"
											active={this.state.tempTierSetting === 0}
											onSelect={(e) => {this.setState({tempTierSetting: 0});}}
										>
											Auto
										</Dropdown.Item>
										<Dropdown.Divider />
										{_map([1,2,3,4], (t) => {
											return (
												<Dropdown.Item
													href="#"
													key={t}
													eventKey={t}
													active={this.state.tempTierSetting === t}
													onSelect={(e) => {this.setState({tempTierSetting: t});}}
												>
													Tier {t}
												</Dropdown.Item>
											);
										})}
									</DropdownButton>
								</InputGroup>

								{/* set auto last gold */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									<DropdownButton
										variant="light"
										title={this.state.tempAutoWealth ? "Auto Wealth" : "Manual Wealth"}
										alignRight
									>
										<Dropdown.Item
											href="#"
											eventKey="t"
											active={this.state.tempAutoWealth === false}
											onSelect={
												(e) => {this.setState({tempAutoWealth: false},
													(e) => { 
														if (this.state.autoWealth) {
															this.updateTempInfo("wealth",this.state.latestWealth)
														}
													}
												);
											}}
										>
											Manual<span className="condense">ly Enter</span> Wealth
										</Dropdown.Item>
										<Dropdown.Item
											href="#"
											eventKey="f"
											active={this.state.tempAutoWealth === true}
											onSelect={(e) => {this.setState({tempAutoWealth: true});}}
										>
											<span className="condense">Use </span>Latest Wealth
										</Dropdown.Item>
									</DropdownButton>
								</InputGroup>

								{/* set tempUseEp */}
								{/* <InputGroup className="playerInfoGroup dropdownGroup"> */}
								{/* 	<DropdownButton */}
								{/* 		variant="light" */}
								{/* 		title={this.state.tempUseEp ? "Include EP" : "Exclude EP"} */}
								{/* 		alignRight */}
								{/* 	> */}
								{/* 		<Dropdown.Item */}
								{/* 			href="#" */}
								{/* 			eventKey="t" */}
								{/* 			active={this.state.tempUseEp === true} */}
								{/* 			onSelect={this.setTempUseEp.bind(this,true)} */}
								{/* 		> */}
								{/* 			Include EP */}
								{/* 		</Dropdown.Item> */}
								{/* 		<Dropdown.Item */}
								{/* 			href="#" */}
								{/* 			eventKey="f" */}
								{/* 			active={this.state.tempUseEp === false} */}
								{/* 			onSelect={this.setTempUseEp.bind(this,false)} */}
								{/* 		> */}
								{/* 			Exclude EP */}
								{/* 		</Dropdown.Item> */}
								{/* 	</DropdownButton> */}
								{/* </InputGroup> */}
							</div>

							<InputGroup
								className="addClassGroup rightGroup"
								onClick={(e) => {this.setState({showHelpModal: true});}}
							>
								<InputGroup.Append as="button">
									<InputGroup.Text id="add-class">
										<span className="helpIcon">
											<IoMdHelpCircle />
										</span>
									</InputGroup.Text>
								</InputGroup.Append>
							</InputGroup>
						</li>
					</ul>
				</div>
			</Collapse>
        );
    };

    render_classLevelDropDown = (selClass, selLevel) => {
        return ( <>
            <DropdownButton
					as={InputGroup.Prepend}
					variant="secondary"
					title={selClass}
					disabled={selClass === this.state.tempAutoLeveling}
					onSelect={(e) => {this.setState({mountAnimSpeed: { animationDuration: "0s" }});}}
				>
					{_map(classes5e, (c, i) => {
						if (selClass === c) {
							return (
								<Dropdown.Item
									key={i}
									href="#"
									active
									onSelect={this.setClassLevel.bind(this,selClass,c,selLevel)}
								>
									{c}
								</Dropdown.Item>
							);
						}
						if (!Object.keys(this.state.tempObj.classes).includes(c)) {
							return (
								<Dropdown.Item
									key={i}
									href="#"
									onSelect={this.setClassLevel.bind(this,selClass,c,selLevel)}
								>
									{c}
								</Dropdown.Item>
							);
						}
					})}
					<Dropdown.Divider />
					{_map(classesUA.concat(["Others"]), (k, j) => {
						if (selClass === k) {
							return (
								<Dropdown.Item
									key={j}
									href="#"
									active
									onSelect={this.setClassLevel.bind(this,selClass,k,selLevel)}
								>
									{k}
								</Dropdown.Item>
							);
						}
						if (k !== selClass && !Object.keys(this.state.tempObj.classes).includes(k)) {
							return (
								<Dropdown.Item
									key={j}
									href="#"
									onSelect={this.setClassLevel.bind(this,selClass,k,selLevel)}
								>
									{k}
								</Dropdown.Item>
							);
						}
					})}
					<Dropdown.Divider />
					<Dropdown.Item
						className="remove oswald"
						href="#"
						onSelect={this.removeClass.bind(this, selClass)}
					>
						<span>Remove</span>
						<AiTwotoneDelete />
					</Dropdown.Item>
				</DropdownButton>

				<DropdownButton
					as={InputGroup.Append}
					variant="outline-secondary"
					title={selLevel}
					disabled={this.state.tempAutoLeveling !== ""}
					alignRight
					className={classnames(
						"levelDropdown",
						this.state.tempAutoLeveling !== "" && "disabled"
					)}
				>
					{_map(
						Array.from(Array(20), (_, i) => {
							return i + 1;
						}),
						(l) => {
							return (
								<Dropdown.Item
									key={l}
									href="#"
									active={selLevel === l}
									onSelect={this.setClassLevel.bind(this,selClass,selClass,l)}
								>
									{l}
								</Dropdown.Item>
							);
						}
					)}
				</DropdownButton>
            </>
        );
    };

    render_helpModal = () => {
    	return (
    		<Modal
				className="helpModal"
				size={"lg"}
				show={this.state.showHelpModal}
				onHide={(e) => {this.setState({showHelpModal: false});}}
			>
				<Modal.Header closeButton>
					<Modal.Title>Player Options Help</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<ul className="helpList">
						<li>
							<h1>Manual and Auto Leveling</h1>
							<ul>
								<li>After adding a class you can choose one of your classes to automatically add levels.</li>
								<li>Levels added are the total number of checked Advancements in game logs (minus any multiclassing levels) starting at level 1.</li>
								<li>If there are more levels set from multiclassing than total levels, then the selected class' level will be 0.</li>
								<li>You cannot manually change any class levels or the selected class.</li>
							</ul>
						</li>
						<li>
							<h1>Manual and Auto Tier</h1>
							<ul>
								<li>Auto Tier will set the character's current tier based on class levels.</li>
								<li>This is based on the total levels set to classes and not to checked Advancements in game logs.</li>
								<li>This will work in conjunction with auto-leveling.</li>
							</ul>
						</li>
						<li>
							<h1>Manual and Auto Wealth</h1>
							<ul>
								<li>Auto Wealth will use the Ending Gold of the most recent log.</li>
								<li>Auto Wealth prevents any changes to Current Wealth other than setting 'Include/Exclude EP'.</li>
							</ul>
						</li>
						{/* <li> */}
						{/* 	<h1>Including and Excluding EP</h1> */}
						{/* 	<ul> */}
						{/* 		<li>You may include or exclude ethereum pieces (ep) from your Current Wealth inputs.</li> */}
						{/* 		<li>Setting this to 'Exclude EP' will convert any ep into sp and add it to your current sp.</li> */}
						{/* 		<li>This is (currently) only set for player options only; each log will have its own individual setting.</li> */}
						{/* 	</ul> */}
						{/* </li> */}
						<li>
							<h1>Condensing Coinage <IoIosCalculator /></h1>
							<ul>
								<li>This will convert your wealth into using the least amount of coins possible.</li>
							</ul>
						</li>
					</ul>
				</Modal.Body>
			</Modal>
    	);
    }

    render() {
        return (
            <div className="editBox">
            	{this.render_helpModal()}

				<div
					className={classnames(
						"playerBox",
						this.state.isEditing && "editing"
					)}
				>
					<Fade in={this.state.isEditing}>
						<EditButton
							left
							cancel
							onClick={this.editInfo.bind(this, true)}
							active={this.state.isEditing}
						/>
					</Fade>

					{this.render_displayInfo()}

					<EditButton
						save
						onClick={this.editInfo.bind(this, false)}
						active={this.state.isEditing}
					/>
				</div>

				{this.render_editInfo()}
			</div>
        );
    }
}

export default withToast(Player);