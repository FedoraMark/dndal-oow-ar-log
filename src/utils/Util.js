// CONSTS
export const fadeInUp = "animate__animated animate__fadeInUp";
export const fadeIn = "animate__animated animate__fadeIn";

// export const classes5e = ["Artificer","Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"];
// export const classesUA = ["Blood Hunter","Mystic"];

// FUNCTIONS
export const getFirstObject = (obj) => {
	return obj[Object.keys(obj)[0]];
};

export const getFirstKey = (obj) => {
	return Object.keys(obj)[0];
};

export const condenseWealth = (wealthObj, useEP) => {
	// convert to CP
	var totalCopper =
		wealthObj.pp * 1000 +
		wealthObj.gp * 100 +
		wealthObj.sp * 10 +
		wealthObj.cp;
	if (useEP) {
		totalCopper += wealthObj.ep * 50;
	}

	var denomObj = {};

	//get copper
	denomObj.cp = totalCopper % 10;
	totalCopper -= denomObj.cp;
	totalCopper /= 10;

	if (useEP) {
		//get silver
		denomObj.sp = totalCopper % 5;
		totalCopper -= denomObj.sp;
		totalCopper /= 5;

		//get ethereum
		denomObj.ep = totalCopper % 2;
		totalCopper -= denomObj.ep;
		totalCopper /= 2;
	} else {
		//get silver (without EP)
		denomObj.sp = totalCopper % 10;
		totalCopper -= denomObj.sp;
		totalCopper /= 10;
	}

	//get get gold (from EP)
	denomObj.gp = totalCopper % 10;
	totalCopper -= denomObj.gp;
	totalCopper /= 10;

	//get get platinum
	denomObj.pp = totalCopper;

	return denomObj;
};
