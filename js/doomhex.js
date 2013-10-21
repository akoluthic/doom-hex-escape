var player = {
	hero: null,

	//stats
	HP: null,
	MP: null,
	MD: null,
	MA: null,
	AR: null,
	currHP: null,
	currMP: null,
	isDead: false,
	powerPoints: {
		"1": 0,
		"2": 0,
		"3": 0,
		"4": 0,
		"5": 0
	},
	onCooldown: {
		"melee": false,
		"1": false,
		"2": false,
		"3": false,
		"4": false,
		"5": false
	},

	//actions
	learnPowers: function() {
		if (this.hero) {
			for (powerKey in this.powerPoints) {
				if (heroes[this.hero].powers[powerKey].statAffected) {
					if (heroes[this.hero].powers[powerKey].statAffected == "MD") {
						this.MD[0] += heroes[this.hero].powers[powerKey].amounts[this.powerPoints[powerKey]];
						this.MD[1] += heroes[this.hero].powers[powerKey].amounts[this.powerPoints[powerKey]];
					} else {
						this[heroes[this.hero].powers[powerKey].statAffected]
						+= heroes[this.hero].powers[powerKey].amounts[this.powerPoints[powerKey]];
					}
				}
			}
		} else {
			message('Error learning powers');
		}
	},
	doAction: function(actionType, powerKey) {
		var self = this;
		var actionIdent, actionBar, CDID, cooldownLength;
		if (actionType == "melee") { CDID = "melee"; } else { CDID = powerKey; }
		if (!this.onCooldown[CDID]) {
			if (actionType == "melee" || this.currMP - heroes[player.hero].powers[powerKey].cost >= 0) {
				//combat actions
				if (actionType == "melee") {
					actionIdent = $("#use-melee");
					actionBar = $("#use-melee .power-cooldown");
					var meleeDamage = RNG(this.MD[0], this.MD[1]);
					hitToTarget(meleeDamage);
					cooldownLength = 3000;
				} else if (actionType == "power" && player.hero == "templar" && powerKey == "1") {
					actionIdent = $("#use-power-1");
					actionBar = $("#use-power-1 .power-cooldown");
					var damage = heroes.templar.powers[1].amounts[player.powerPoints[1]];
					hitToTarget(damage);
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = 7000;
				} else if (actionType == "power" && player.hero == "templar" && powerKey == "3") {
					actionIdent = $("#use-power-3");
					actionBar = $("#use-power-3 .power-cooldown");
					var heal = heroes.templar.powers[3].amounts[player.powerPoints[3]] + this.MA;
					healToPlayer(heal);
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = 10000;
				} else if (actionType == "power" && player.hero == "templar" && powerKey == "5") {
					actionIdent = $("#use-power-5");
					actionBar = $("#use-power-5 .power-cooldown");
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = heroes.templar.powers[5].amounts[player.powerPoints[5]] * 1000;
				} else if (actionType == "power" && player.hero == "archdruid" && powerKey == "1") {
					actionIdent = $("#use-power-1");
					actionBar = $("#use-power-1 .power-cooldown");
					var damage = heroes.archdruid.powers[1].amounts[player.powerPoints[1]] + this.MA;
					hitToTarget(damage);
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = 8000;
				} else if (actionType == "power" && player.hero == "archdruid" && powerKey == "3") {
					actionIdent = $("#use-power-3");
					actionBar = $("#use-power-3 .power-cooldown");
					var heal = heroes.archdruid.powers[3].amounts[player.powerPoints[3]] + this.MA;
					restoreToPlayer(heal);
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = 7000;
				} else if (actionType == "power" && player.hero == "archdruid" && powerKey == "5") {
					actionIdent = $("#use-power-5");
					actionBar = $("#use-power-5 .power-cooldown");
					var damage = heroes.archdruid.powers[5].amounts[player.powerPoints[5]] + this.MA;
					hitAllEnemies(damage);
					setStat('MP', this.currMP - heroes[player.hero].powers[powerKey].cost);
					cooldownLength = 20000;
				}
				self.toggleCD(CDID, true);
				actionIdent.css("color", "#686868");
				actionBar.css("width", "100%").stop().animate({
						'width': 0
					},
					{
				    	duration: cooldownLength,
		  				easing: "linear",
				    	complete: function() {
				     			actionIdent.css("color", "#FFFFFF");
				     			self.toggleCD(CDID, false);
				    		}
				    }
				);
			} else {
				message('Not enough Mana!');
				sounds_nope.play();
			}
		} else {
			sounds_nope.play();
		}
	},
	toggleCD: function(CDID, val) {
		this.onCooldown[CDID] = val;
	}
}

var maxPowerPoints = 20;
var gameState = 'MAINMENU';
var escapeFights = 12;
var currentFight = 0;
var currentEnemies = {};
var currentTarget = null;

var heroes = {
	templar: {
		fullname: "Templar",
		startingHP: 98,
		startingMP: 56,
		startingMD: [24, 35],
		startingMA: 10,
		startingAR: 24,
		powers: {
			"1": {
				name: "Valiant Strike",
				description: "Deals heavy melee damage to one enemy",
				use: "active",
				amounts: [0, 35, 38, 41, 44, 47, 50, 53, 56, 59, 62],
				additions: null,
				unit: "Damage",
				cost: 2,
				statAffected: null,
				target: "enemy"
			},
			"2": {
				name: "Vigor",
				description: "Increases Health Points",
				use: "passive",
				amounts: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
				additions: null,
				unit: "HP",
				cost: null,
				statAffected: "HP",
				target: null
			},
			"3": {
				name: "Blessing",
				description: "Heals the Templar",
				use: "active",
				amounts: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
				additions: "MA",
				unit: "HP Healed",
				cost: 4,
				statAffected: null,
				target: "self"
			},
			"4": {
				name: "Fervor",
				description: "Increases melee damage",
				use: "passive",
				amounts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				additions: null,
				unit: "Extra Damage",
				cost: null,
				statAffected: "MD",
				target: null
			},
			"5": {
				name: "Hero's Call",
				description: "Take only 50% damage for a length of time",
				use: "active",
				amounts: [0, 0, 4, 0, 8, 0, 12, 0, 16, 0, 20],
				additions: null,
				unit: "Seconds",
				cost: 6,
				statAffected: null,
				target: "self"
			}
		}
	},
	archdruid: {
		fullname: "Archdruid",
		startingHP: 80,
		startingMP: 90,
		startingMD: [10, 18],
		startingMA: 20,
		startingAR: 12,
		powers: {
			"1": {
				name: "Lightning Bolt",
				description: "Shoots a bolt of lightning at an enemy",
				use: "active",
				amounts: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
				additions: "MA",
				unit: "Damage",
				cost: 3,
				statAffected: null,
				target: "enemy"
			},
			"2": {
				name: "Barkskin",
				description: "Increases the Archdruid's Armor",
				use: "passive",
				amounts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				additions: null,
				unit: "Added Armor",
				cost: null,
				statAffected: "AR",
				target: null
			},
			"3": {
				name: "Regeneration",
				description: "Heals the Archdruid and restores some mana",
				use: "active",
				amounts: [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
				additions: "MA",
				unit: "HP and MP",
				cost: 9,
				statAffected: null,
				target: "self"
			},
			"4": {
				name: "Wisdom",
				description: "Increases the Archdruid's Magic Ability",
				use: "passive",
				amounts: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
				additions: null,
				unit: "Magic Ability",
				cost: null,
				statAffected: "MA",
				target: null
			},
			"5": {
				name: "Wrath of Nature",
				description: "Deals heavy nature damage, divided among enemies",
				use: "active",
				amounts: [0, 0, 40, 0, 60, 0, 80, 0, 100, 0, 120],
				additions: "MA",
				unit: "Damage",
				cost: 9,
				statAffected: null,
				target: "enemy"
			}
		}
	},
	shadowmaster: {
		fullname: "Shadowmaster",
		startingHP: 72,
		startingMP: 72,
		startingMD: [16, 28],
		startingMA: 14,
		startingAR: 15,
		powers: {
			"1": {
				name: "Shadow Slice",
				description: "Melee strike plus added damage over 3 turns",
				use: "active",
				amounts: [0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60],
				additions: null,
				unit: "Added Damage",
				cost: 4,
				statAffected: null,
				target: "enemy"
			},
			"2": {
				name: "Assassin",
				description: "Chance to deal double damage for the next 3 turns",
				use: "active",
				amounts: [0, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95],
				additions: null,
				unit: "% Chance",
				cost: 6,
				statAffected: null,
				target: "self"
			},
			"3": {
				name: "Feint",
				description: "Increases dodge chance for the next 3 turns",
				use: "active",
				amounts: [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40],
				additions: null,
				unit: "% Extra",
				cost: 6,
				statAffected: null,
				target: "self"
			},
			"4": {
				name: "Initiative",
				description: "Gives a chance to receive extra turns in combat",
				use: "passive",
				amounts: [0, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32],
				additions: null,
				unit: "% Chance",
				cost: null,
				statAffected: null,
				target: null
			},
			"5": {
				name: "Death Machine",
				description: "Regenerate mana every time an enemy is killed",
				use: "passive",
				amounts: [0, 0, 4, 0, 8, 0, 12, 0, 16, 0, 20],
				additions: null,
				unit: "Mana/Kill",
				cost: null,
				statAffected: null,
				target: null
			}
		}
	}
}

var enemies = {
	"beholder": {
		HP: 150,
		MD: [45, 65]
	},
	"wraith": {
		HP: 70,
		MD: [30, 42]
	},
	"imp": {
		HP: 25,
		MD: [18, 28]
	}
}

var enemyPacks = {
	"hard": [
		{
			enemy: "beholder",
			packSize: [1, 1]
		},
		{
			enemy: "wraith",
			packSize: [2, 3]
		},
		{
			enemy: "imp",
			packSize: [6, 7]
		}
	],
	"medium": [
		{
			enemy: "wraith",
			packSize: [1, 2]
		},
		{
			enemy: "imp",
			packSize: [4, 5]
		}
	],
	"easy": [
		{
			enemy: "wraith",
			packSize: [1, 1]
		},
		{
			enemy: "imp",
			packSize: [3, 4]
		}
	]
}

var hexes = [
	{
		description: "The Doom Hex has injured you!",
		statAffected: "HP"
	},
	{
		description: "The Doom Hex has sapped some Mana!",
		statAffected: "MP"
	},
	{
		description: "The Doom Hex has drained your Magic Ability!",
		statAffected: "MA"
	},
	{
		description: "The Doom Hex has drained your Melee Damage!",
		statAffected: "MD"
	},
	{
		description: "The Doom Hex has defiled your Armor!",
		statAffected: "AR"
	}
];

RNG = function(lo, hi) {
	return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

startGame = function() {
	$('#main-menu').fadeIn(800);
}

showHeroInfo = function(hero) {
	$("#hero-menu-customize").hide();
	showStartingStats(hero);
	showStartingPowers(hero);
	$("#hero-type").text(heroes[hero].fullname);
	$("#hero-menu-customize").fadeIn(400);
}

showStartingStats = function(hero) {
	$("#hero-menu-stats-hp").text(heroes[hero].startingHP);
	$("#hero-menu-stats-mp").text(heroes[hero].startingMP);
	$("#hero-menu-stats-md").text(heroes[hero].startingMD[0] + "-" + heroes[hero].startingMD[1]);
	$("#hero-menu-stats-ma").text(heroes[hero].startingMA);
	$("#hero-menu-stats-ar").text(heroes[hero].startingAR);
}

showStartingPowers = function(hero) {
	for (powerKey in heroes[player.hero].powers) {
		$("#powers-menu-" + powerKey + "-name").text(heroes[player.hero].powers[powerKey].name);
	}
}

totalPtsAllocated = function() {
	return player.powerPoints[1] + player.powerPoints[2] + player.powerPoints[3] + player.powerPoints[4] + player.powerPoints[5];
}

setPowerPoints = function(powerKey, num) {
	player.powerPoints[powerKey] = num;

	//change affects stats, if necessary
	if (heroes[player.hero].powers[powerKey].statAffected) {
		var statAff = heroes[player.hero].powers[powerKey].statAffected;
		if (statAff == "MD") {
			var meleeLow = heroes[player.hero].startingMD[0] + heroes[player.hero].powers[powerKey].amounts[num];
			var meleeHigh = heroes[player.hero].startingMD[1] + heroes[player.hero].powers[powerKey].amounts[num];
			$("#hero-menu-stats-md").text(meleeLow + "-" + meleeHigh);
		} else {
			var statString = "starting" + statAff;
			$("#hero-menu-stats-" + statAff.toLowerCase())
			.text(heroes[player.hero][statString] + heroes[player.hero].powers[powerKey].amounts[num]);
		}
	}

	$("#powers-menu-" + powerKey + "-pts").text(player.powerPoints[powerKey]);
	var totPts = totalPtsAllocated();
	var totalPtsRemaining = maxPowerPoints - totPts;
	$("#points-remaining").text(totalPtsRemaining);
}

allocatePoint = function(hero, powerKey, type) {
	var alloc = type == 'plus' ? 1 : -1;
	if (powerKey == 5) {
		alloc *= 2;
	}
	var totPts = totalPtsAllocated();
	if (player.powerPoints[powerKey] + alloc >= 0) {
		if (player.powerPoints[powerKey] + alloc <= 10) {
			if (maxPowerPoints - totPts - alloc >= 0) {
				setPowerPoints(powerKey, player.powerPoints[powerKey] + alloc);
			} else {
				message('Not enough ability points!');
			}
		} else {
			message('Ability maxed at 10 points');
		}
	}
}

zeroPowers = function() {
	for (i = 1; i <= 5; i++) {
		setPowerPoints(i, 0);
	}
}

message = function(msgText) {
	$('#message').dequeue();
	$("#message #msg-text").text(msgText);
	$("#message").fadeIn(400).delay(1000).fadeOut(1000);
}

loadHero = function(hero) {
	player.HP = heroes[hero].startingHP;
	player.MP = heroes[hero].startingMP;
	player.MD = heroes[hero].startingMD;
	player.MA = heroes[hero].startingMA;
	player.AR = heroes[hero].startingAR;
}

setStat = function(stat, amount) {
	var statToSet;
	if (stat == "HP" || stat == "MP") {
		statToSet = "curr" + stat;
	} else {
		statToSet = stat;
	}
	player[statToSet] = amount;
	if (stat == "MD") {
		$("#hero-" + stat.toLowerCase() + "-num").text(amount[0] + "-" + amount[1]);
	} else {
		$("#hero-" + stat.toLowerCase() + "-num").text(amount);
	}

	//hp and mp bars
	if (stat == "HP" || stat == "MP") {
		var pct = amount / player[stat];
		var barPx = Math.floor(pct * 244);
		$("#" + stat.toLowerCase() + "-bar-fill").animate({ width: barPx }, 400);
	}
}

showHeroStats = function() {
	setStat('HP', player.HP);
	setStat('MP', player.MP);
	setStat('MD', player.MD);
	setStat('MA', player.MA);
	setStat('AR', player.AR);
}

enterWorld = function() {
	showHeroStats();
	$("#hero-portrait").css("background-image", "url('img/" + player.hero + ".png')");
	$("#instructions").fadeIn(400);
}

showPowers = function() {
	for (powerKey in player.powerPoints) {
		if (player.powerPoints[powerKey] > 0 && heroes[player.hero].powers[powerKey].use == "active") {
			$("#combat-powers").append("<div id='use-power-" + powerKey + "' data-power-key='" + powerKey + 
				"' class='combat-list' data-use-type='power' role='button'><div class='power-cooldown' data-use-type='power' data-power-key='" + powerKey + "'></div>" + 
				heroes[player.hero].powers[powerKey].name + "</div>");
		}
	}
	$("#combat-powers").show();
}

killPlayer = function() {
	if (!player.isDead) {
		$("#game").fadeOut(400, function() {
			$("#death").fadeIn(400);
		});
		player.isDead = true;
	}
}

win = function() {
	if (!player.isDead) {
		clearInterval(timer);
		clearInterval(enemyTimer);
		$("#game").fadeOut(400, function() {
			$("#win").fadeIn(400);
		})
	}
}

hexPlayer = function() {
	var hexStat, checkAffix;
	sounds_hex.play();
	$("#hex-warning").show();
	$("#hex-warning").fadeOut(1000);
	var hexPick = RNG(0, 4);
	$("#hex-description").text(hexes[hexPick].description);
	var statAff = hexes[hexPick].statAffected;
	if (statAff == "MD") {
		var hexMDlow = (player.MD[0] - 1 > 0 ? player.MD[0] - 1 : 0);
		var hexMDhigh = (player.MD[1] - 1 > 0 ? player.MD[1] - 1 : 0);
		hexStat = [hexMDlow, hexMDhigh];
	} else {
		if (statAff == "HP" || statAff == "MP") {
			checkStat = "curr" + statAff;
		} else {
			checkStat = statAff;
		}
		hexStat = (player[checkStat] - 2 > 0 ? player[checkStat] - 2 : 0);
	}
	setStat(statAff, hexStat);
}

var timer;
startHex = function() {
	var hexSec = $('#hex-timer').text();
	timer = setInterval(function() { 
	    $('#hex-timer').text(--hexSec);
	    if (hexSec == 0) {
	    	hexPlayer();
	    	hexSec = 10;
	    	$('#hex-timer').text(hexSec);
	    	if (player.currHP <= 0) {
		    	clearInterval(timer);
		    	killPlayer();
	    	}
	    }
	}, 1000);
}

var attackPlayer = function(enemy) {

	var damage = RNG(enemies[enemy].MD[0], enemies[enemy].MD[1]);
	var dmgMinArmor = damage - player.AR;
	if (dmgMinArmor < 0) { dmgMinArmor = 0; }
	if (player.hero == "templar" && player.onCooldown[5]) {
		dmgMinArmor = Math.round(dmgMinArmor / 2);
	}
	combatLog('Enemy ' + enemy + ' hits for ' + dmgMinArmor + ' damage!');
	sounds_hit.play();
	setStat('HP', player.currHP - dmgMinArmor);
}

var enemyTimer;
spawnEnemies = function(num, enemyType) {
	clearInterval(enemyTimer);
	for (i = 1; i <= num; i++) {
		currentEnemies[i] = {
			type: enemyType,
			HP: enemies[enemyType].HP,
			MD: enemies[enemyType].MD
		}
		var rndY = RNG(100, 300);
		if (num == 1) {
			var rndX = 300;
		} else {
			var rndX = Math.round((i/num) * 500 - 48);
		}
		$("#viewport").prepend("<div class='enemy' id='enemy-" + i + "' style='position:absolute;top:" + 
			rndY + ";left:" + rndX + 
			";' data-enemy-id='" + i + "'></div>");
		$("#enemy-" + i).css("background-image", "url('img/" + enemyType + ".png')");
	}
	var attackRate = Math.round(5000 / num);
	enemyTimer = setInterval(function() { 
		if (RNG(1,2) == 1) {
	    	attackPlayer(enemyType);
	    }
    	if (player.currHP <= 0) {
	    	clearInterval(enemyTimer);
	    	killPlayer();
    	}
	}, attackRate);
}

createEnemies = function() {
	var difficulty, numEncounters;
	if ((currentFight / escapeFights) * 100 < 33) {
		difficulty = "hard";
	} else if ((currentFight / escapeFights) * 100 < 66 && (currentFight / escapeFights) * 100 >= 33) {
		difficulty = "medium";
	} else {
		difficulty = "easy";
	}
	numEncounters = enemyPacks[difficulty].length;
	var rnd = RNG(0, numEncounters - 1);
	var numEnemies = RNG(enemyPacks[difficulty][rnd].packSize[0], enemyPacks[difficulty][rnd].packSize[1]);
	if (numEnemies == 1) {
		combatLog('A wild ' + enemyPacks[difficulty][rnd].enemy + ' appears!  Attack!');
	} else {
		combatLog('A group of ' + enemyPacks[difficulty][rnd].enemy + 's appear!  Fight!');
	}
	spawnEnemies(numEnemies, enemyPacks[difficulty][rnd].enemy);
}

startFights = function() {
	createEnemies();
}

noMoreEnemies = function(obj) {

    // null and undefined are empty
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    for (var key in obj) {
        if (hasOwnProperty.call(obj, key))    return false;
    }

    // Doesn't handle toString and toValue enumeration bugs in IE < 9

    return true;
}

killEnemy = function(enemy) {
	sounds_kill.play();
	currentTarget = null;
	delete currentEnemies[enemy];
	$("#enemy-" + enemy).remove();
	if (noMoreEnemies(currentEnemies)) {
		currentFight++;
		if (currentFight > escapeFights) {
			win();
		} else {
			createEnemies();
		}
	}
}

combatLog = function(text) {
	$("#combat-log").text(text);
}

hitToTarget = function(damage) {
	combatLog('Hero does ' + damage + ' damage to ' + currentEnemies[currentTarget].type);
	sounds_hit.play();
	currentEnemies[currentTarget].HP -= damage;
	if (currentEnemies[currentTarget].HP <= 0) {
		combatLog(currentEnemies[currentTarget].type + ' dies');
		killEnemy(currentTarget);
	}
}

hitAllEnemies = function(damage) {
	combatLog('Hero does ' + damage + ' damage to all enemies');
	sounds_hit.play();
	var j = 0;
	for (e in currentEnemies) {
		j++
	}
	var divDmg = Math.round(damage / j);
	for (enemy in currentEnemies) {
		currentEnemies[enemy].HP -= damage;
		if (currentEnemies[enemy].HP <= 0) {
			killEnemy(enemy);
		}
	}
}

healToPlayer = function(heal) {
	combatLog('Hero heals for ' + heal + ' HP');
	sounds_heal.play();
	if (player.currHP + heal > player.HP) {
		setStat('HP', player.HP);
	} else {
		setStat('HP', player.currHP + heal);
	}
}

restoreToPlayer = function(heal) {
	combatLog('Hero gains ' + heal + ' HP and MP');
	sounds_heal.play();
	if (player.currHP + heal > player.HP) {
		setStat('HP', player.HP);
	} else {
		setStat('HP', player.currHP + heal);
	}

	if (player.currMP + heal > player.MP) {
		setStat('MP', player.MP);
	} else {
		setStat('MP', player.currMP + heal);
	}
}

var sounds_hex, sounds_click;

$(function() {

	//sounds
	sounds_heal = $("#sound-heal")[0];
	sounds_kill = $("#sound-kill")[0];
	sounds_nope = $("#sound-nope")[0];
	sounds_hit = $("#sound-hit")[0];
	sounds_hex = $("#sound-hex")[0];
	sounds_click = $("#sound-click")[0];
	
	$("button, .hero-select").click(function() {
	  sounds_click.play();
	});

	//event handlers
	$("#start").click(function(e) {
		$("#main-menu").fadeOut(400, function() {
			$("#story").fadeIn(400);
		});
	});
	$("#create-hero").click(function(e) {
		$("#story").fadeOut(400, function() {
			$("#hero-menu").fadeIn(400);
			gameState = 'CREATEHERO';
		});
	});
	$(".hero-select").click(function(e) {
		var selectedHero = $(this).attr('id');
		if (selectedHero == 'templar-select') {
			player.hero = 'templar';
		} else if (selectedHero == 'archdruid-select') {
			player.hero = 'archdruid';
		} else if (selectedHero == 'shadowmaster-select') {
			//player.hero = 'shadowmaster';
			return false;
		}
		zeroPowers();
		$(".hero-select").removeClass('hero-selected');
		$(this).addClass('hero-selected');
		showHeroInfo(player.hero);
	});
	$(".plus, .minus").click(function(e) {
		var allocationType;
		var allocationParent = $(this).parent().attr("id");
		var powerKey = allocationParent.slice(-1);
		if ($(this).hasClass('plus')) {
			allocationType = 'plus';
		} else {
			allocationType = 'minus';
		}
		allocatePoint(player.hero, powerKey, allocationType);
	});
	$(".plus, .minus, .combat-list, .power-cooldown, #combat-powers").dblclick(function(){
	    return false;
	});
	$(".power-name").mouseover(function(e) {
		var powerKey = $(this).attr('data-power');
		var pow = heroes[player.hero].powers[powerKey];
		var nextRank, addt, amt, amtNext, statAdded;

		//get applicable additions for this power
		if (pow.additions) {
			statAdded = "starting" + pow.additions;
			addt = heroes[player.hero][statAdded];
			if (pow.additions == "MA") {
				addt = parseInt($("#hero-menu-stats-ma").text());
			} 
		} else {
			addt = 0;
		}

		if (player.powerPoints[powerKey] > 0) {
			amt = pow.amounts[player.powerPoints[powerKey]] + addt;
		} else {
			amt = 0;
		}

		//determine what the next rank would be
		if (powerKey >= 1 && powerKey <= 4) {
			nextRank = player.powerPoints[powerKey] + 1;
		} else if (powerKey == 5) {
			nextRank = player.powerPoints[powerKey] + 2;
		}

		//create text for next rank
		if (nextRank > 10) {
			nextRankText = "Maxed!";
			amtNext = 0;
		} else {
			amtNext = pow.amounts[nextRank] + addt;
			nextRankText = amtNext + " " + pow.unit;
		}

		if (pow.use == "passive") {
			passiveBR = "<span class='light-blue-text'>Passive</span><br>";
		} else {
			passiveBR = "<br>";
		}
		$("#power-description").html(
			pow.name + 
			"<br>" + passiveBR +
			pow.description +
			"<br><span class='yellow-text'>Current Rank:</span><br><span class='green-text'>" + 
			amt + " " + pow.unit +
			"</span><br><span class='yellow-text'>Next Rank:</span><br><span class='green-text'>" +
			nextRankText +
			"</span>"
		);
		$("#power-description").toggle();
	});
	$(".power-name").mouseout(function(e) {
		$("#power-description").toggle();
	});
	$("#play").click(function(e) {
		if (player.hero) {
			if (totalPtsAllocated() > 19) {
				if (gameState == 'CREATEHERO') {
					loadHero(player.hero);
					player.learnPowers();
					$("#hero-menu").fadeOut(400, function() {
						gameState == 'GAME';
						enterWorld();
						$("#game").fadeIn(400);
					});
				}
			} else {
				message("You haven't used all your points!");
			}
		} else {
			message("No hero selected");
		}
	});
	$("#go").click(function(e) {
		$("#instructions").fadeOut(400, function() {
			showPowers();
			startHex();
			startFights();
		});
	});
	$(document).on("click", ".enemy", function() {
		currentTarget = $(this).attr('data-enemy-id');
		$(".enemy").css('background-position', '0 0');
		$("#enemy-" + currentTarget).css('background-position', '0 -64px');
	});
	$(document).on("click", ".combat-list", function() {
		var actionType = $(this).attr('data-use-type');
		var usePower = null;

		//get powerkey if this is a power
		if (actionType == "power") {
			usePower = $(this).attr('data-power-key');
		}

		//if this is melee or a power which requires an enemy, check for target
		if (actionType == "melee" || (actionType == "power" && heroes[player.hero].powers[usePower].target == "enemy")) {
			if (!currentTarget) {
				message('No target selected!');
			} else {
				player.doAction(actionType, usePower);
			}
		} else if (actionType == "power" && heroes[player.hero].powers[usePower].target == "self") {
			player.doAction(actionType, usePower);
		}
	});

    startGame();
});
