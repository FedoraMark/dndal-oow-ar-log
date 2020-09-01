import _each from "lodash/each";

// CONSTS
export const animFaster = "animate__faster";
export const fadeIn = "animate__animated animate__fadeIn";
export const fadeInUp = "animate__animated animate__fadeInUp";
export const bounceIn = "animate__animated animate__bounceIn";

export const excludeInWealth = ["e", "+", "-", "."];
export const emptyWealth = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
export const emptyLogWealth = {starting: emptyWealth, spent: emptyWealth, earned: emptyWealth, ending: emptyWealth};
export const currency = ["cp", "sp", "ep", "gp", "pp"]

export const dmRewardNote =
    "When you run an adventure, you earn the Adventure Record for that adventure, which you may apply to one of your Oracle of War characters. Apply the same rewards to the Adventure Record as your group earned, including legacy events. If a legacy event was awarded to a specific character, you may tick that event for your own character too.";

export const playerRewardNote =
    "(A character that dies during an adventure should still receive any legacy events that they earned, based on the discretion of the DM.)";

export const classes5e = [
    "Artificer",
    "Barbarian",
    "Bard",
    "Cleric",
    "Druid",
    "Fighter",
    "Monk",
    "Paladin",
    "Ranger",
    "Rogue",
    "Sorcerer",
    "Warlock",
    "Wizard",
];
export const classesUA = ["Blood Hunter", "Mystic"];
// export const coins5e = ["cp","sp","ep","gp","pp"];

// FUNCTIONS
export const getFirstObject = (obj) => {
    return obj[Object.keys(obj)[0]];
};

export const getFirstKey = (obj) => {
    return Object.keys(obj)[0];
};

export const trimStringsInObjectFlatly = (obj) => {
    var trimmedData = obj;
    _each(obj, (e, k) => {
        if (typeof e === "string") {
            trimmedData[k] = e.trim();
        }
    });

    return trimmedData;
};

export const getTotalCopper = (wealthObj) => {
    return (
        (!wealthObj.pp ? 0 : wealthObj.pp) * 1000 +
        (!wealthObj.gp ? 0 : wealthObj.gp) * 100 +
        (!wealthObj.ep ? 0 : wealthObj.ep) * 50 +
        (!wealthObj.sp ? 0 : wealthObj.sp) * 10 +
        (!wealthObj.cp ? 0 : wealthObj.cp)
    );
};

export const condenseWealth = (totalCopper, useEP) => {
    var totalInCopper = totalCopper;
    var denomObj = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

    //get copper
    denomObj.cp = totalInCopper % 10;
    totalInCopper -= denomObj.cp;
    totalInCopper /= 10;

    if (useEP) {
        //get silver
        denomObj.sp = totalInCopper % 5;
        totalInCopper -= denomObj.sp;
        totalInCopper /= 5;

        //get ethereum
        denomObj.ep = totalInCopper % 2;
        totalInCopper -= denomObj.ep;
        totalInCopper /= 2;
    } else {
        //get silver
        denomObj.sp = totalInCopper % 10;
        totalInCopper -= denomObj.sp;
        totalInCopper /= 10;

        //set etherum to 0
        denomObj.ep = 0;
    }

    //get get gold (from EP)
    denomObj.gp = totalInCopper % 10;
    totalInCopper -= denomObj.gp;
    totalInCopper /= 10;

    //get get platinum
    denomObj.pp = totalInCopper;

    return denomObj;
};
