// ==UserScript==
// @name        Various fixes
// @author      Frankie Garcia
// @license     Lesser Gnu Public License, version 3
// @homepage    https://greasyfork.org/es/users/473836-karkass
// @downloadURL https://greasyfork.org/scripts/463180-pods-fix/code/Pods%20fix.user.js
// @description For planets.nu -- Some experimental and fixes
// @match       https://planets.nu/*
// @match       https://*.planets.nu/*
// @namespace   https://larision.sytes.net
// @version     0.2
// @grant       none
// ==/UserScript==

/*
    Changelog:
    0.1     First Release
            Show real waypoints of accelerated pods
    0.2     Close planet windows when switching race in home sector
    */


// shorterDistOKForHyp intended for use during replay, when shorter distance is OK for the waypoint
vgaPlanets.prototype.loadWaypoints = function (shorterDistOKForHyp) {
    var sets = vgap.accountsettings;

    this.waypoints = new Array();
    for (var i = 0; i < vgap.ships.length; i++) {
        //waypoint
        var ship = vgap.ships[i];
        if (ship.ownerid != vgap.player.id && !ship.fullinfo && !vgap.editmode) {
            if (ship.heading != -1 && ship.warp != 0) {

                var relation = vgap.getRelation(ship.ownerid);
                var color = sets.enemyshipto;
                if (vgap.allied(ship.ownerid))
                    color = sets.allyshipto;
                if (relation && relation.color && relation.color != "")
                    color = "#" + relation.color;
                if (vgap.sh.isPod(ship))
                    color = colorToRGBA(color, 0.2);

                var speedfactor = 1;
                if (vgap.sh.isPod(ship) && ship.neutronium == 2)
                    speedfactor = 1.5;

                var speed = vgap.getSpeed(ship.warp, ship.hullid, speedfactor);

                var x2 = ship.x + Math.round(Math.sin(Math.toRad(ship.heading)) * speed);
                var y2 = ship.y + Math.round(Math.cos(Math.toRad(ship.heading)) * speed);
                //ship.targetx = x2;
                //ship.targety = y2;


                //color = colorToRGBA(color, 0.3);

                dasharray = [6,3];

                this.waypoints.push({ id: ship.id, x1: ship.x, y1: ship.y, x2: x2, y2: y2, color: color, dasharray: dasharray });

                //this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(x2) + " " + this.screenY(y2)).attr({ stroke: color, "stroke-width": "2", "stroke-opacity": 0.5 }));
            }
        }
        else if (!vgap.editmode || (ship.targetx != 0 && ship.targety != 0)) {

            if (vgap.isChunnelling(ship)) {

                var x = ship.x;
                var y = ship.y;

                //we are initiating a chunnel at warp speed inside a matrix
                if (ship.warp > 0 && (ship.targetx != ship.x || ship.targety != ship.y)) {


                    var dasharray = null;
                    var color = sets.myshipto;

                    var next = vgap.getNextLoc(ship);

                    var waypoint = { id: ship.id, x1: x, y1: y, x2: next.x, y2: next.y, color: color, dasharray: dasharray };
                    this.waypoints.push(waypoint);

                    x = next.x;
                    y = next.y;
                }

                var targetId = vgap.getChunnelTarget(ship).id;
                var target = vgap.getShipClosestCopy(targetId, ship.x, ship.y);
                var dasharray = [9, 4];
                var color = "#00FFFF";
                if (ship.id < 0)
                    color = "rgba(0, 255, 255, 0.15)";
                var linewidth = 2;
                if (ship.hullid != 56 && ship.hullid != 114) {
                    dasharray = [5, 2];
                    color = "#009999";
                }
                if (vgap.isMultiChunnel(ship.x, ship.y, target.x, target.y)) {
                    linewidth = 6;
                    dasharray = [6,6];
                }

                this.waypoints.push({ id: ship.id, x1: x, y1: y, x2: target.x, y2: target.y, color: color, dasharray: dasharray, linewidth: linewidth });
            }
            else if (vgap.isTemporalLancing(ship)) {

                var x = ship.x;
                var y = ship.y;

                var target = vgap.getTemporalLanceEndPoint(ship);
                var dasharray = [9, 4];
                var color = "#FF00FF";
                var linewidth = 2;

                this.waypoints.push({ id: ship.id, x1: x, y1: y, x2: target.x, y2: target.y, color: color, dasharray: dasharray, linewidth: linewidth });
            }
            else {

                var dasharray = null;

                var color = sets.myshipto;// colorToRGBA(sets.myshipto, 0.3); //{ stroke: sets.myshipto, "stroke-width": "2", "stroke-opacity": 0.5 };
                var path = vgap.getPath(ship);

                if (vgap.isHyping(ship)) {
                    color = "#F5F5DC";
                    dasharray = [2, 2];

                    if (path.length > 0) {
                        var first = path[0];
                        var dist = Math.dist(first.x1, first.y1, first.x2, first.y2);
                        var mindist = shorterDistOKForHyp ? 0 : 339.95;
                        var maxdist = 360.05;
                        var middist = 350;
                        if (vgap.settings.isacademy) {
                            mindist = shorterDistOKForHyp ? 0 : 8;
                            maxdist = 9;
                            middist = 8.5;
                        }
                        if (dist < mindist || dist > maxdist) {
                            //now we just fly exactly 350
                            color = "#FF0000";
                            ship.heading = vgap.getHeading(first.x1, first.y1, first.x2, first.y2);
                            first.x2 = ship.x + Math.round(Math.sin(Math.toRad(ship.heading)) * middist);
                            first.y2 = ship.y + Math.round(Math.cos(Math.toRad(ship.heading)) * middist);
                        }
                        //ship.hypend = { x: first.x2, y: first.y2 };
                    }
                }

                //use tower path
                var tower = vgap.isTowTarget(ship.id);
                if (tower != null) 
                    path = vgap.getPath(tower);

                // We need the towees waypoint to draw in purple in drawUserChangable *sigh*
                // But we do NOT want the towee's waypoints to be drawn over the tower, when the tower runs out of fuel
                // and the towee is NOT selected. Common case when your lowest ID ship tows to evade a cloaker.
                let movingShip = tower ? tower : ship;
                var startfuel = movingShip.neutronium;
                for (var j = 0; j < path.length; j++) {
                    let hop = path[j];

                    if (vgap.isHyping(ship) && j > 0)
                        break;

                    var neededFuel = vgap.getFuelUsage(hop.x1, hop.y1, hop.x2, hop.y2, movingShip);
                    if (neededFuel > startfuel)
                        color = "#ff6600";
                    startfuel -= neededFuel;

                    //pod color
                    if (vgap.sh.isPod(ship))
                        color = colorToRGBA("#7a7a3e", 0.1);

                    var waypoint = { id: ship.id, x1: hop.x1, y1: hop.y1, x2: hop.x2, y2: hop.y2, color: color, dasharray: dasharray };
                    this.waypoints.push(waypoint);
                }
            }
        }
    }
    for (var i = 0; i < vgap.ionstorms.length; i++) {
        var storm = vgap.ionstorms[i];
        if (storm.parentid == 0) {

            var x = storm.x;
            var y = storm.y;

            var x2 = x + Math.round(Math.sin(Math.toRad(storm.heading)) * storm.warp * storm.warp);
            var y2 = y + Math.round(Math.cos(Math.toRad(storm.heading)) * storm.warp * storm.warp);

            //add 1000 to id to make sure it doesnt' match up with ship ids
            this.waypoints.push({ id: 1000 + storm.id, x1: x, y1: y, x2: x2, y2: y2, color: colorToRGBA("#FFFF00", 0.1) });
        }
    }

    if (vgap.q.isPlayingHorwasp()) {
        vgap.myplanets.forEach(planet => {
            if (vgap.pl.isBuildingPod(planet)) {
                vgap.pl.waypointsForPod(planet).forEach(wp =>
                    this.waypoints.push({id: planet.id, color: colorToRGBA("#7a7a3e", 0.5), ...wp})
                )
            }
        })
    }

}

// Intento de cerrar ventana al cambiar la raza

vgaPlanets.prototype.tasksToDo = function () {
    var tasks = [];
    var required = 0;

    //Home Sector Stuff - for now only have tutorials for first player
    if (vgap.isHomeSector() && vgap.player.id == 1) {

        let hsTaskClass = "helptask NeutralText";

        //guide to point to the tasklist to get to show me hows
        if (vgap.myplanets.length == 0) {

            if (vgap.assistant.uiguide == null) {
                console.log("UIGUIDE");
                let uiguide = {};
                uiguide.check = function () {
                    if ($("#eshowmehow").length > 0)
                        vgap.assistant.highlight("#eshowmehow");
                    else if (vgap.moreOpen || vgap.activeScreen() || vgap.cutSceneOpen)
                        vgap.assistant.hideLight();
                    else {
                        if (vgap.tasklistShowing)
                            vgap.assistant.highlight(".helptask");
                        else
                            vgap.assistant.highlight("#TaskTitle");
                    }

                    return false;
                };
                // EXPLAIN this timeout construct, please!?
                setTimeout(() => { vgap.assistant.setUIGuide(uiguide); });
            }

            //need to get first planet
            let ship = vgap.getShip(1);
            let planet = vgap.nearestPlanet(ship);

            if (vgap.planetAt(ship.x, ship.y) == null) {
                if (!vgap.assistant.getMoveShipToUIGuide(ship, planet, 7, true).onlyCheck()) {
                    const objective = {
                        title: "Move Ship to Planet",
                        text: "To establish ourselves here, we must first colonize a planet with the clans on our freighter. Let's move our freighter to the nearest planet.",
                        imgpath: cutSceneImage(17, 10),
                        helpfunc: () => vgap.assistant.setUIGuide(vgap.assistant.getColonizeUIGuide())
                    };

                    tasks.push({
                        cls: hsTaskClass, text: "Move Ship to Planet", action: function () {
                            vgap.logAction("task - Move Ship to Planet");
                            shtml.showObjectiveCutScene(objective);
                        }
                    });
                }
            }
            else {
                let colonizeUIGuide = vgap.assistant.getColonizeUIGuide({ megacredits: 1000 });
                if (!colonizeUIGuide.onlyCheck()) {
                    let objective = {
                        title: "Colonize a Planet",
                        text: "Now that we are at the planet, we must drop the colonist clans down to claim it. Use the cargo transfer interface to beam them down, along with some megacredits to start building on the planet.",
                        imgpath: cutSceneImage(17, 10),
                        helpfunc: () => vgap.assistant.setUIGuide(colonizeUIGuide)
                    };
                    tasks.push({
                        cls: hsTaskClass, text: "Colonize a Planet", action: function () {
                            vgap.logAction("task - Colonize a Planet");
                            shtml.showObjectiveMore(objective);
                        }
                    });
                }
            }
        } else {
            if (vgap.assistant.uiguide) {
                tasks.push({
                    cls: hsTaskClass,
                    text: "Stop Tutorial",
                    action: function () {
                        vgap.logAction("task - Cancelled tutorial");
                        vgap.assistant.setUIGuide(undefined);
                    }
                });
            }
        }

        //tax natives
        if (vgap.myplanets.length <= 3 && vgap.myplanets.filter(o => vgap.pl.hasNatives(o) && (o.nativetaxrate == 0 && !o.nativeautotax)).length > 0) {
            let planet = vgap.myplanets.filter(o => vgap.pl.hasNatives(o) && (o.nativetaxrate == 0 && !o.nativeautotax))[0];
            let uiguide = {};
            uiguide.planet = planet;
            uiguide.check = function () {
                if (planet.nativetaxrate > 0 || planet.nativeautotax)
                    return true;

                let selectPlanet = vgap.assistant.selectPlanetUIGuide(planet);
                if (selectPlanet.onlyCheck()) {
                    if (vgap.isMoreOpen("planetnativetaxrates")) {
                        if (planet.nativetaxrate == 0 && !planet.nativeautotax) {
                            if ($("#TaxMethodSelect").is(":visible"))
                                vgap.assistant.highlight($("#TaxMethodSelect :contains('Growth')"), { hintText: "Tax Strategy: Growth" });
                            else
                                vgap.assistant.highlight("#TaxMethod", { hintText: "Tax Strategies" });
                        }
                    }
                    else if (vgap.isMoreOpen("planetcolony")) {
                        vgap.assistant.highlight("#NativeTaxRates", { hintText: "Native Taxing" });
                    }
                    else if (!vgap.moreOpen) {
                        vgap.assistant.nativeTaxUIGuide().check();
                    }
                    else {
                        vgap.assistant.highlight(vgap.planetScreen.closebutton);
                    }
                }
                else {
                    selectPlanet.check();
                }

                return false;
            };
            let objective = {
                title: "Tax Natives",
                text: "Taxing natives is important for generating MegaCredits. We can tax at a steady rate or use a taxing strategy to balance population growth and income.",
                imgpath: cutSceneImage(planet.id, 21),
                helpfunc: () => {
                    vgap.assistant.setUIGuide(uiguide);
                }
            };
            tasks.push({ cls: hsTaskClass, text: "Tax Natives", action: function () { vgap.logAction("task - Tax Natives"); shtml.showObjectiveMore(objective); } });

        }

        let undevelopedplanet = null;
        for (let i = 1; i <= 3; i++) {
            let planet = vgap.getPlanet(i);
            if (planet.ownerid == 1 && planet.clans >= 100 && (planet.factories < 100 || planet.mines < 100)) {
                undevelopedplanet = planet;
                break;
            }
        }

        if (undevelopedplanet) {
            //build structures
            let planet = undevelopedplanet;
            let uiguide = {};
            uiguide.onlyCheck = () => vgap.nowTurn > 50 || (planet.factories >= 100 && planet.mines >= 100)
            uiguide.check = function () {
                if (planet.factories >= 100 && planet.mines >= 100)
                    return true;

                let selectPlanet = vgap.assistant.selectPlanetUIGuide(planet);
                if (selectPlanet.onlyCheck()) {
                    let planetStructures = vgap.assistant.planetStructures();
                    if (planetStructures.onlyCheck()) {
                        if (planet.factories < 100) {
                            if (shtml.commandActionId != "factories")
                                vgap.assistant.highlight("#factories.formrow label.factories", { hintText: "Build Factories" });
                            else
                                vgap.assistant.highlight("#100", { hintText: "100 Factories Built" });
                        }
                        else if (planet.mines < 100) {
                            if (shtml.commandActionId != "mines")
                                vgap.assistant.highlight("#mines.formrow label.mines", { hintText: "Build Mines" });
                            else
                                vgap.assistant.highlight("#100", { hintText: "100 Mines Built" });
                        }
                    } else {
                        planetStructures.check();
                    }
                }
                else {
                    selectPlanet.check();
                }

                return false;
            };

            if (!uiguide.onlyCheck()) {
                let objective = {
                    title: "Develop Planet",
                    text: `Now that we are in control of ${planet.name}, we must build some structures to generate resources.`,
                    imgpath: cutSceneImage(planet.id, 21),
                    helpfunc: () => vgap.assistant.setUIGuide(uiguide)
                };
                tasks.push({
                    cls: hsTaskClass, text: "Develop Planet", action: function () {
                        vgap.logAction("task - Develop Planet");
                        shtml.showObjectiveMore(objective);
                    }
                });
            }
        }

        //complete account
        if (vgap.myplanets.length >= 3 && nu.data.account.id == vgap.player.accountid && nu.isTrialAccount()) {
            tasks.push({
                cls: hsTaskClass,
                text: "Choose A Name",
                action: function () {
                    shtml.showCompleteAccountHomeSector();
                }
            });
        }

        //build starbase
        if (vgap.myplanets.length >= 3 && vgap.mystarbases.length == 0 && vgap.myplanets.filter(o => o.buildingstarbase).length == 0 && vgap.myships.length > 0) {
        //if (vgap.mystarbases.length == 0 && vgap.myplanets.filter(o => o.buildingstarbase).length == 0 && vgap.getPlanet(1).ownerid == 1) {
            let planet = vgap.myplanets.filter(o => vgap.pl.hasNatives(o))[0];
            //let planet = vgap.getPlanet(1);
            let gatherResourcesUIGuide = vgap.assistant.getGatherResourcesUIGuide(planet, vgap.pl.starbaseCosts(planet));
            if (gatherResourcesUIGuide.onlyCheck()) {
                if (vgap.currentTurnLoaded()) {
                    let uiguide = {};
                    uiguide.planet = planet;
                    uiguide.check = function () {
                        if (planet.buildingstarbase)
                            return true;

                        let selectPlanet = vgap.assistant.selectPlanetUIGuide(planet);
                        if (selectPlanet.onlyCheck()) {
                            if (vgap.isMoreOpen("planetbuildstarbase")) {
                                vgap.assistant.highlight("#BuildBaseButton");
                            } else if (vgap.isMoreOpen("planetcolony")) {
                                //hacky scroll to bottom if needed
                                if (vgap.more.find(".jspScrollable").length)
                                    vgap.more.find(".jspScrollable").data("jsp").scrollToBottom();
                                vgap.assistant.highlight("#BuildStarbase");
                            } else if (!vgap.moreOpen) {
                                vgap.assistant.selectUnbuiltStarbaseUIGuide().check();
                            } else {
                                vgap.assistant.highlight(vgap.planetScreen.closebutton);
                            }
                        } else {
                            selectPlanet.check();
                        }

                        return false;
                    };
                    let objective = {
                        title: "Build Starbase",
                        text: "Now that we have collected the needed resources, let's build a new starbase!",
                        imgpath: cutSceneImage(planet.id, 21),
                        helpfunc: () => vgap.assistant.setUIGuide(uiguide)
                    };
                    tasks.push({
                        cls: hsTaskClass, text: "Build a Starbase", action: function () {
                            vgap.logAction("task - Build Starbase");
                            shtml.showObjectiveMore(objective);
                        }
                    });
                }
            }
            else if (vgap.myplanets.length >= 3) {
                let objective = {
                    title: "Gather Starbase Materials",
                    text: `We need resources for a starbase on ${planet.id}: ${planet.name}. Our freighter can collect mined minerals from other planets and deliver them.<br/><br/>${vgap.createCompactBuildStarbaseResourceTable(planet, vgap.pl.starbaseCosts(planet)).prop("outerHTML")}`,
                    imgpath: cutSceneImage(planet.id, 21),
                    helpfunc: () => {
                        vgap.assistant.setUIGuide(gatherResourcesUIGuide);
                    }
                };
                tasks.push({ cls: hsTaskClass, text: "Gather Starbase Materials", action: function () { vgap.logAction("task - Gather Starbase Materials"); shtml.showObjectiveMore(objective); } });

            }
        }

        //continue colonizing
        if (vgap.myplanets.length >= 1 && vgap.myplanets.length < 3) {
            let colonizeUIGuide = vgap.assistant.getColonizeUIGuide();
            if (!colonizeUIGuide.onlyCheck()) {
                let objective = {
                    title: "Continue Colonizing",
                    text: "To grow our empire we should continue to colonize and develop more planets. Send our freighter to drop more clans and megacredits at other planets.",
                    imgpath: cutSceneImage(17, 10),
                    helpfunc: () => vgap.assistant.setUIGuide(colonizeUIGuide)
                };
                tasks.push({
                    cls: hsTaskClass, text: "Continue Colonizing", action: function () {
                        vgap.logAction("task - Continue Colonizing");
                        shtml.showObjectiveMore(objective);
                    }
                });
            }
        }

        let warships = vgap.myships.filter(o => o.beams + o.torps + o.bays > 0);
        if (vgap.myplanets.length >= 3 && vgap.mystarbases.length >= 1 && warships.length < 2 && vgap.mystarbases.filter(o => o.isbuilding).length == 0 && vgap.myships.length > 0) {
            //build a new ship
            let starbase = vgap.mystarbases[0];
            let planet = vgap.getPlanet(starbase.planetid);
            let isSecond = (warships.length == 1);
            //nebuld, warp 7, blaster, mark 4
            let build = {
                buildhullid: 5,
                buildengineid: 7,
                buildbeamcount: 4,
                buildbeamid: 4,
                buildtorpcount: 4,
                buildtorpedoid: 6
            }
            let shipcost = vgap.sb.costToBuildShip(starbase, build);
            let gatherResourcesUIGuide = vgap.assistant.getGatherResourcesUIGuide(planet, shipcost);
            if (!gatherResourcesUIGuide.onlyCheck()) {
                let massagedCost = { trit: shipcost.tri, dur: shipcost.dur, moly: shipcost.mol, mc: shipcost.cost };
                let title = `Gather ${isSecond ? "More " : ""}Ship Materials`;
                let text = `We need resources for a Nebula Class Cruiser on ${planet.id}: ${planet.name}. Our freighter can collect mined minerals from other planets and deliver them.`;
                if (isSecond)
                    text = "We need a little more firepower before we attempt to take on missions from the Portal. We should get resources together for another Nebula Class Cruiser."
                text += "<br/><br/>" + vgap.createCompactBuildStarbaseResourceTable(planet, massagedCost).prop("outerHTML");
                let objective = {
                    title: title,
                    text: text,
                    imgpath: cutSceneImage(planet.id, 21),
                    helpfunc: () => {
                        vgap.assistant.setUIGuide(gatherResourcesUIGuide);
                    }
                };
                tasks.push({ cls: hsTaskClass, text: title, action: function () { vgap.logAction(`task - ${title}`); shtml.showObjectiveMore(objective); } });
            }
            else if (vgap.currentTurnLoaded()) {
                let uiguide = {};
                uiguide.planet = planet;
                uiguide.starbase = starbase;
                uiguide.check = function () {
                    if (starbase.isbuilding)
                        return true;

                    let selectSB = vgap.assistant.selectStarbaseUIGuide(starbase);
                    if (selectSB.onlyCheck()) {
                        if (vgap.isMoreOpen("spacedock")) {
                            if (starbase.buildhullid != 5) {
                                if ($("#Hulls5").length > 0)
                                    vgap.assistant.highlight("#Hulls5");
                                else
                                    vgap.assistant.highlight("#BuildShipHulls");
                            }
                            else if (starbase.buildengineid != 7) {
                                if ($("#Engines7").length > 0)
                                    vgap.assistant.highlight("#Engines7");
                                else
                                    vgap.assistant.highlight("#BuildShipEngines");
                            }
                            else if (starbase.buildbeamid != 4) {
                                if ($("#Beams4").length > 0)
                                    vgap.assistant.highlight("#Beams4");
                                else
                                    vgap.assistant.highlight("#BuildShipBeams");
                            }
                            else if (starbase.buildtorpedoid != 6) {
                                if ($("#Launchers6").length > 0)
                                    vgap.assistant.highlight("#Launchers6");
                                else
                                    vgap.assistant.highlight("#BuildShipAux");
                            }
                            else {
                                if ($("#BuildButton:visible").length > 0)
                                    vgap.assistant.highlight("#BuildButton");
                                else
                                    vgap.assistant.highlight("#BuildPartOK");
                            }
                        }
                        else if (vgap.isMoreOpen("starbaseoptions")) {
                            vgap.assistant.highlight("#BuildShip", { hintText: "Enter Space Dock" });
                        }
                        else if (!vgap.moreOpen) {
                            vgap.assistant.highlight(vgap.useMobileUI() ? "#starbaseHudSpaceDock" : "#SpaceDockbar #NoBuildYet", { hintText: "Starbase Controls" });
                        }
                        else {
                            vgap.assistant.highlight(vgap.starbaseScreen.closebutton);
                        }
                    }
                    else {
                        selectSB.check();
                    }

                    return false;
                };
                let title = `Build ${isSecond ? "Another" : "A"} Ship`;
                let text = "Now that we have collected the needed resources, let's build a new ship! The Nebula Class Cruiser is a capable mid-range warship that should serve us well.";
                if (isSecond)
                    text = "A second Nebula Class Cruiser should give us the strength we need to launch a mission from the Portal. Let's build it now!";
                let objective = {
                    title: title,
                    text: text,
                    imgpath: cutSceneImage(5, 10),
                    helpfunc: () => {
                        vgap.assistant.setUIGuide(uiguide);
                    }
                };
                tasks.push({ cls: hsTaskClass, text: title, action: function () { vgap.logAction(`task - ${title}`); shtml.showObjectiveMore(objective); } });

            }

        }

        //start horwasp incursion
        if (!vgap.isPersistentTaskComplete("horwaspincursion")) {
            let portal = vgap.getPortal();
            if (warships.length >= 2 && portal && warships.filter(o => vgap.isSamePoint(o.x, o.y, portal.x, portal.y)).length >= 2) {
                let uiguide = {};
                uiguide.check = function () {
                    if (vgap.isMoreOpen("horwasplevel1")) {
                        vgap.assistant.highlight("#enterportal");
                    } else if (vgap.isMoreOpen("portalmissions")) {
                        vgap.assistant.highlight(".econtentrow"); //assumes first item is correct one
                    } else {
                        let selectPortal = vgap.assistant.selectPortalUIGuide(portal);
                        if (selectPortal.onlyCheck()) {
                            if (vgap.moreOpen && !vgap.isMoreOpen("portalmissions")) {
                                // Only on mobile - where you can check finished games
                                vgap.assistant.highlight($("#rightBottomButtons div").eq(0));
                            } else {
                                vgap.assistant.highlight(vgap.useMobileUI() ? "#portalHudMissions" : "#AvailableMissionsbar .ival");
                            }
                        } else {
                            selectPortal.check();
                        }
                    }

                    return false;
                };
                let title = "Start A Horwasp Incursion";
                let text = "The Horwasp Plague, a vile race of insect-like creatures... spreading across the Nuniverse and consuming all life in their way... The Galactic Council offers bounties for removing these pests. We should send our ships through the Portal to earn some for ourselves. ";
                let objective = {
                    title: title,
                    text: text,
                    imgpath: raceFull(12),
                    helpfunc: () => {
                        vgap.assistant.setUIGuide(uiguide);
                    }
                };
                tasks.push({
                    cls: hsTaskClass, text: title, action: function () {
                        vgap.logAction(`task - ${title}`);
                        shtml.showObjectiveMore(objective);
                    }
                });
            }

            //move ships to portal
            if (warships.length >= 2 && portal && warships.filter(sh => vgap.assistant.getMoveShipToUIGuide(sh, portal, sh.engineid, false).onlyCheck()).length < 2) {
                let uiguide = {};
                let ship1guide = vgap.assistant.getMoveShipToUIGuide(warships[0], portal, warships[0].engineid, false);
                let ship2guide = vgap.assistant.getMoveShipToUIGuide(warships[1], portal, warships[1].engineid, false);
                uiguide.check = function () {
                    return ship1guide.check() && ship2guide.check();
                };
                let title = "Move Warships To Portal";
                let text = "Now that our combat ships are ready, send them to the Portal. Once there, we can send them on a mission to earn more Gigacredits.";
                let objective = {
                    title: title,
                    text: text,
                    imgpath: genericObjectImage(80),
                    helpfunc: () => {
                        vgap.assistant.setUIGuide(uiguide);
                    }
                };
                tasks.push({
                    cls: hsTaskClass, text: title, action: function () {
                        vgap.logAction(`task - ${title}`);
                        shtml.showObjectiveMore(objective);
                    }
                });
            }
        }

        //start timeline level
        let tl1 = vgap.homesector.sections.find(o => o._level && o._level.id == 101001);
        if (tasks.length < 3 && vgap.mystarbases.length >= 1 && tl1 && !tl1.isunlocked && !tl1._currentgamehist && nu.data.account && nu.data.account.kincredits >= tl1._level.megacreditscost) {
            let uiguide = {};
            uiguide.check = function () {

                if (vgap.activeScreen() != null || vgap.moreOpen || vgap.cutSceneOpen) {
                    vgap.assistant.hideLight();
                }
                else {
                    vgap.assistant.lightmap(tl1.center);
                }

                return false;
            };
            let title = "Start The Timeline";
            let text = "The Planets Nu Timeline lets you play through key moments in the history of the Echo Cluster. Each attempt at a Timeline Level will cost some Gigacredits, but completing the challenge successfully will unlock a new Sub-Sector!";
            let objective = {
                title: title,
                text: text,
                imgpath: genericObjectImage(0),
                helpfunc: () => {
                    vgap.assistant.setUIGuide(uiguide);
                }
            };
            tasks.push({ cls: hsTaskClass, text: title, action: function () { vgap.logAction(`task - ${title}`); shtml.showObjectiveMore(objective); } });
        }

        //end home sector stuff
    }

    tasks = tasks.concat(vgap.idleTasks())

    // for levels, show victory objective
    if (vgap.settings.levelid > 0 && vgap.settings.storyid == 0) {
        if (vgap.settings.levelid > 1 || vgap.settings.turn > 1) {
            var goal = vgap.planetsToWin();
            var planets = vgap.myplanets.length;
            tasks.push({
                cls: "infotask", text: planets + " / " + goal + " planets owned.", action: function () {
                    vgap.logAction("task - Planets owned");
                    vgap.showLevelGoalMessage();
                }
            });
        }
    }

    if (vgap.haveCutScenes() && !vgap.haveUnwatchedVcrs()) tasks.push(vgap.cutScenesTask());

    if (vgap.leveltasks.length > 0) {
        var text = "Objectives";
        if (vgap.leveltaskschanged)
            text = "<span class=NeutralText>Objectives</span>";
        tasks.push({
            cls: "infotask", text: text, action: function () {
                vgap.logAction("task - Objectives");
                let objectiveScene = vgap.getObjectiveScene();
                vgap.assistant.showCutScene(objectiveScene.title, objectiveScene.text, cutSceneImage(objectiveScene.imgid, objectiveScene.imgtype));
            }
        });
    }

    if (vgap.isHomeSector() && !vgap.inHistory) {
        if (vgap.players.find(o => o.status == 101)) {
            tasks.push({
                cls: "infotask", text: "Switch Race", action: function () {
                    vgap.logAction("task - Switch Race");
                    vgap.closeLeft();
                    shtml.showRaceSwitch();
                }
            });
        }
    }

    tasks = tasks.concat(vgap.endTurnTasks(required));
    return tasks;
}
