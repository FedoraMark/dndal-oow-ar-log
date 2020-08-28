import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import Collapse from "react-bootstrap/Collapse";
import Fade from "react-bootstrap/Fade";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { useToasts } from "react-toast-notifications";
import _map from "lodash/map";
import _each from "lodash/each";

import { HiPlusCircle } from "react-icons/hi";
import { AiTwotoneDelete } from "react-icons/ai";
import { IoIosCalculator } from "react-icons/io";

import Wealth from "common/Wealth";
import EditButton from "common/EditButton";
import { animFaster, bounceIn, getTotalCopper, trimStringsInObjectFlatly, condenseWealth, classes5e, classesUA } from "utils/Util";

import "./Player.scss";

function withToast(Component) {
    return function WrappedComponent(props) {
        const toastFuncs = useToasts();
        return <Component {...props} {...toastFuncs} />; //BUG - "Warning: Each child in a list should have a unique "key" prop.""
    };
}

class Player extends Component {
    static propTypes = {
        playerObj: PropTypes.object.isRequired,
        optionsObj: PropTypes.object,
    };

    static defaultProps = {
        optionsObj: {
            autoLeveling: false,
            tierSetting: 0,
            useEp: true
        }
    }

    state = {
        playerObj: this.props.playerObj,
        tempObj: { ...this.props.playerObj },
        isEditing: false, // TRUE FOR TESTING
        topClass: "",
        mountAnimSpeed: {},

        // options
        autoLeveling: this.props.optionsObj.autoLeveling,
        tierSetting: this.props.optionsObj.tierSetting,
        useEp: this.props.optionsObj.useEp,
    };

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

    editInfo = (close) => {
        if (this.state.isEditing && !close) {        	
            this.setState({
                isEditing: false,
                playerObj: trimStringsInObjectFlatly({...this.state.tempObj}),
            });
        } else {
            this.setState({
                isEditing: !this.state.isEditing,
                tempObj: { ...this.state.playerObj },
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
        let condensedObj = condenseWealth(getTotalCopper(this.state.tempObj.wealth), this.state.useEp);

        if (JSON.stringify(condensedObj) === JSON.stringify(this.state.tempObj.wealth)) {
            this.props.addToast("No change to coinage", { appearance: "info" });
        } else {
            this.props.addToast("Coinaged condensed", { appearance: "success" });
        }

        this.updateTempInfo("wealth", condensedObj);
    };

    getTier = () => {
        if (this.state.tierSetting > 0) {
            return this.state.tierSetting
        }

        var totalLevel = 0;
        _each(this.state.playerObj.classes, (lv) => {
            totalLevel += lv;
        });

        if (totalLevel < 1) {
            return 0;
        }
        if (totalLevel < 5) {
            return 1;
        }
        if (totalLevel < 11) {
            return 2;
        }
        if (totalLevel < 17) {
            return 3;
        }
        return 4;
    };

    setUseEp = (val) => {
        // convert EP to SP and add to SP
        if (!val && this.state.tempObj.wealth.ep !== 0) {
            var newWealthObj = { ...this.state.tempObj.wealth };
            let newSp = newWealthObj.ep * 5;
            newWealthObj.sp = newWealthObj.sp + newSp;
            newWealthObj.ep = 0;
            this.updateTempInfo("wealth", newWealthObj);
            this.props.addToast((newSp / 5 + " ep converted into " + newSp + " sp"), { appearance: "warning" });
        }

        this.setState({ useEp: val });
    }

    addNewClass = () => {
		this.setState({ mountAnimSpeed: {animationDuration: "inerit"}});
        
        if (Object.keys(this.state.tempObj.classes).length > 20) {
            this.props.addToast("Leeloo Dallas multiclass", { appearance: "error" });
            return;
        }

        var newClassObj = { ...this.state.tempObj.classes };
        var newClassName = "";

        // *** "classes" should really be an array instead of an object ***

        // prevent duplicate names
        let i = Object.keys(newClassObj).length + 1;
        do {
            newClassName = "Multiclass " + i;
            i++;
        } while (Object.keys(newClassObj).includes(newClassName));

        newClassObj[newClassName] = 1 // set to level 1

        this.updateTempInfo("classes", newClassObj);
    }

    setClassLevel = (oldClass, newClass, newLevel) => {
        var newClassLevelObj = {}

        _map(this.state.tempObj.classes, (lv, cl) => {
            if (cl === oldClass) {
                newClassLevelObj[newClass] = newLevel;
            } else {
                newClassLevelObj[cl] = lv;
            }
        })

        this.updateTempInfo("classes", newClassLevelObj);
    }

    removeClass = (cl) => {
        var newClObj = { ...this.state.tempObj.classes };
        delete newClObj[cl];

        this.updateTempInfo("classes", newClObj);
    }

    setTopClass = (clss) => {
        this.setState({ topClass: clss });
    }

    //RENDERERS
    render_displayInfo = () => {
        return (
            <span className="playerBoxContent">
				<div className="infoItem">
					<h1>Character:</h1>
					<p>{this.state.playerObj.character}</p>
				</div>

				{this.state.playerObj.tier !== -1 && (
					<div className="infoItem tierItem">
						<h1>Tier:</h1>
						<ul className="tierList">
							<li className={this.getTier() > 0 ? "filled" : ""}>
								1
							</li>
							<li className={this.getTier() > 1 ? "filled" : ""}>
								2
							</li>
							<li className={this.getTier() > 2 ? "filled" : ""}>
								3
							</li>
							<li className={this.getTier() > 3 ? "filled" : ""}>
								4
							</li>
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

				{!!this.state.playerObj.wealth && getTotalCopper(this.state.playerObj.wealth) > 0 && (
					<div className="infoItem">
						<h1>Wealth:</h1>
						<p>
							<Wealth wealthObj={this.state.playerObj.wealth} />
						</p>
					</div>
				)}

				{Object.keys(this.state.playerObj.classes).length > 0 && (
					<div className="infoItem">
						<h1>{"Class" + (Object.keys(this.state.playerObj.classes).length !== 1 ? "es:" : ':')}</h1>
						<p className="classList">
							{_map(
								this.state.playerObj.classes,
								(level, clss) => {
									return (
										<span className="class" key={clss}>
											{clss + " (" + level + ")"}
											<span className="comma">, </span>
										</span>
									);
								}
							)}
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
        			this.setState({ mountAnimSpeed: {animationDuration: "0s"}});
        		}}
        		onEntered={(e) => {
        			this.setState({ mountAnimSpeed: {animationDuration: "inerit"}});
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
								placeholder="(required)"
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
								{_map(["cp","sp","ep","gp","pp"].reverse(), (denom, key) => {
										let conversion = [
											"platinum (1000cp)",
											"gold (100cp)",
											"ethereum (50cp)",
											"silver (10cp)",
											"copper (1cp)",
										];

										if (
											!this.state.useEp &&
											denom === "ep"
										) {
											return <></>;
										}

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
													value={this.state.tempObj.wealth[denom].toString().replace(/^0+/, '')}
													onChange={(e) => {this.setTempWealth(e.target.value, denom);}}
													placeholder="0"
												></Form.Control>
												<InputGroup.Append>
													<InputGroup.Text id={denom}>
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
									}
								)}
							</div>

							<InputGroup
								className="calcButtonGroup rightGroup"
								onClick={this.calcWealth.bind(this)}
							>
								<OverlayTrigger
									placement="top"
									overlay={<Tooltip>Condense Coinage</Tooltip>}
								>
									<InputGroup.Append>
										<InputGroup.Text id="wealth-calc">
											<span className="calcMoneyIcon"><IoIosCalculator /></span>
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
								{_map(this.state.tempObj.classes, (level, clss) => {
									return (
										<InputGroup
											key={clss}
											className={classnames(
												"playerInfoGroup classDropdownGroup", 
												animFaster,
												bounceIn,
												this.state.topClass === clss && "zFix", classLen === 1 && "firstLast")}
											onClick={this.setTopClass.bind(this,clss)}
											style={this.state.mountAnimSpeed}
										>
											{this.render_classLevelDropDown(clss, level)}
										</InputGroup>
									);
								})}

								<InputGroup className="fillerGroup filler1" />
								<InputGroup className="fillerGroup filler2" />
							</div>

							<InputGroup
								className="addClassGroup rightGroup"
								onClick={this.addNewClass.bind(this)}
							>
								{/* <OverlayTrigger placement="bottom" overlay={<Tooltip>Add Class</Tooltip>}> */}
									<InputGroup.Append>
										<InputGroup.Text id="add-class">
											<span className="plusIcon">
												<HiPlusCircle />
											</span>
										</InputGroup.Text>
									</InputGroup.Append>
								{/* </OverlayTrigger> */}
							</InputGroup>
						</li>

						{/* OPTIONS */}
						<li className="group optionsLevelWrapper splitGroupWrapper">
							<InputGroup className="playerInfoGroup leftGroup">
								<InputGroup.Prepend>
									<InputGroup.Text id="character-options">Options</InputGroup.Text>
								</InputGroup.Prepend>
							</InputGroup>

							<div className="playerInfoOptions">
								{/* set leveling */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.autoLeveling ? "Auto Levels" : "Manual Levels"} alignRight>
										<Dropdown.Item href="#" eventKey="f" active={this.state.autoLeveling === false} onSelect={(e) => {this.setState({autoLeveling: false})}}>Manual</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="t" active={this.state.autoLeveling === true} onSelect={(e) => {this.setState({autoLeveling: true})}}>Auto</Dropdown.Item>
									</DropdownButton>
								</InputGroup>

								{/* set tier */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.tierSetting > 0 ? "Tier " + this.state.tierSetting : "Auto Tier"} alignRight>
										<Dropdown.Item href="#" eventKey="0" active={this.state.tierSetting === 0} onSelect={(e) => {this.setState({tierSetting: 0})}}>Auto</Dropdown.Item>
										<Dropdown.Divider />
										<Dropdown.Item href="#" eventKey="1" active={this.state.tierSetting === 1} onSelect={(e) => {this.setState({tierSetting: 1})}}>Tier 1</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="2" active={this.state.tierSetting === 2} onSelect={(e) => {this.setState({tierSetting: 2})}}>Tier 2</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="3" active={this.state.tierSetting === 3} onSelect={(e) => {this.setState({tierSetting: 3})}}>Tier 3</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="4" active={this.state.tierSetting === 4} onSelect={(e) => {this.setState({tierSetting: 4})}}>Tier 4</Dropdown.Item>
									</DropdownButton>
								</InputGroup>

								{/* set useEp */}
								<InputGroup className="playerInfoGroup dropdownGroup">
									 <DropdownButton variant="secondary" title={this.state.useEp ? "Include EP" : "Exclude EP"} alignRight>
										<Dropdown.Item href="#" eventKey="t" active={this.state.useEp === true} onSelect={this.setUseEp.bind(this,true)}>Include EP</Dropdown.Item>
										<Dropdown.Item href="#" eventKey="f" active={this.state.useEp === false} onSelect={this.setUseEp.bind(this,false)}>Exclude EP</Dropdown.Item>
									</DropdownButton>
								</InputGroup>
							</div>
						</li>
					</ul>
				</div>
			</Collapse>
        );
    };

    render_classLevelDropDown = (selClass, selLevel) => {
        return (
        	<>
            	<DropdownButton
					as={InputGroup.Prepend}
					variant="secondary"
					title={selClass}
					onSelect={(e) => {
	        			this.setState({ mountAnimSpeed: {animationDuration: "0s"}});
	        		}}
				>
					{_map(classes5e, (c, i) => {
						if (selClass === c) {
							return <Dropdown.Item key={i} href="#" active onSelect={this.setClassLevel.bind(this,selClass,c,selLevel)}>{c}</Dropdown.Item>
						}
						if (!Object.keys(this.state.tempObj.classes).includes(c)) {
							return <Dropdown.Item key={i} href="#" onSelect={this.setClassLevel.bind(this,selClass,c,selLevel)}>{c}</Dropdown.Item>
						}
					})}
					<Dropdown.Divider />
					{_map(classesUA.concat(["Others"]), (k, j) => {
						if (selClass === k) {
							return <Dropdown.Item key={j} href="#" active onSelect={this.setClassLevel.bind(this,selClass,k,selLevel)}>{k}</Dropdown.Item>
						}
						if (k !== selClass && !Object.keys(this.state.tempObj.classes).includes(k)) {
							return <Dropdown.Item key={j} href="#" onSelect={this.setClassLevel.bind(this,selClass,k,selLevel)}>{k}</Dropdown.Item>
						}
					})}
					<Dropdown.Divider />
					<Dropdown.Item className="remove oswald" href="#" onSelect={this.removeClass.bind(this,selClass)}>
						<span>Remove</span>
						<AiTwotoneDelete />
					</Dropdown.Item>
				</DropdownButton>
				<DropdownButton as = { InputGroup.Append } variant = "outline-secondary" title = { selLevel } alignRight className = "levelDropdown" >
	            {_map(Array.from(Array(20), (_, i) => { return i + 1 }), (l) => {
	                return <Dropdown.Item key={l} href="#" active={selLevel === l} onSelect={this.setClassLevel.bind(this,selClass,selClass,l)}>{l}</Dropdown.Item>
	                })
	            }
	            </DropdownButton>
	        </>
        );
    };

    render() {
        return (
            <div className="editBox">
				<div className={classnames("playerBox",this.state.isEditing && "editing")}>
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