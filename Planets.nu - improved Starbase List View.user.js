// ==UserScript==
// @name            Planets.nu - improved Starbase List View
// @author          Frankie Garcia
// @license         Lesser Gnu Public License, version 3
// @homepage        https://greasyfork.org/es/users/473836-karkass
// @description     Miscellaneous Improvements to the Starbase List View
// @match           http://*.planets.nu/*
// @match           https://*.planets.nu/*
// @match           http://planets.nu/*
// @match           https://planets.nu/*
// @version 0.1
// ==/UserScript==
// 0.1 - Include starbases misions

function wrapper() { // wrapper for injection
    oldShowStarbases = vgapDashboard.prototype.showStarbases;

    /**
     * Displays the starbases in the dashboard.
     *
     * @param {number} view - the view mode (0: Status, 1: Resource View, 2: Notes View)
     */
    vgapDashboard.prototype.showStarbases = function (view) {
        vgap.playSound("button");
        vgap.closeSecond();

        this.content.empty();

        //filter messages
        var html = "";

        if (!view)
            view = 0;

        var filterMenu = $("<ul class='FilterMenu'></ul>").appendTo(this.content);
        $("<li " + (view == 0 ? "class='SelectedFilter'" : "") + ">Status</li>").tclick(function () { vgap.dash.showStarbases(0); }).appendTo(filterMenu);
        $("<li " + (view == 1 ? "class='SelectedFilter'" : "") + ">Resource View</li>").tclick(function () { vgap.dash.showStarbases(1); }).appendTo(filterMenu);
        $("<li " + (view == 2 ? "class='SelectedFilter'" : "") + ">Notes View</li>").tclick(function () { vgap.dash.showStarbases(2); }).appendTo(filterMenu);


        //loop through all planets and show the ones owned by this player
        html += "<div class='DashPane' style='height:" + ($("#DashboardContent").height() - 70) + "px;'>";

        html += "<table id='PlanetTable' align='left' border='0' style='CleanTable' width='100%' style='cursor:pointer;min-width:1000px;'><thead>";
        html += "<th></th><th align='left'>Id</th><th align='left'>Name</th>";
        if (vgap.editmode)
            html += "<th align='left'>Owner</th>";
        if (view == 1)
            html += "<th title='Megacredits' align='left'>MC</th><th title='Supplies' align='left'>S</th><th title='Neutronium' align='left'>N</th><th title='Duranium' align='left'>D</th><th title='Tritanium' align='left'>T</th><th title='Molybdenum' align='left'>M</th><th title='Ground Neutronium (unmined)' align='left'>GN</th><th title='Ground Duranium (unmined)' align='left'>GD</th><th title='Ground Tritanium (unmined)' align='left'>GT</th><th title='Ground Molybdenum (unmined)' align='left'>GM</th>";
        if (view == 0)
            html += "<th title='Defense' align='left'>Def</th><th title='Fighters' align='left'>F</th><th title='Damage' align='left'>Dam</th><th title='Hull Tech Level' align='left'>H</th><th title='Engine Tech Level' align='left'>E</th><th title='Beam Tech Level' align='left'>B</th><th title='Torpedo Tech Level' align='left'>T</th><th align='left' class='sorter-text'>FC</th><th title='Mission' align='left'>Mission</th><th title='Megacredits' align='left'>MC</th><th title='Building Hull' align='left'>Building</th><th title='Building Engines' align='left'>Engines</th><th title='Building Beams' align='left'>Beams</th><th title='Building Torpedos' align='left'>Torps</th><th title='Ready Checkbox Status' align='left'>R</th>";
        if (view == 2)
            html += "<th title='Notes' align='left'>Notes</th>";



        html += "</thead><tbody id='StarbaseRows'>";
        html += "</tbody></table>";
        html += "</div>";
        this.pane = $(html).appendTo(this.content);

        for (var i = 0; i < vgap.mystarbases.length; i++) {
            var starbase = vgap.mystarbases[i];
            var planet = vgap.getPlanet(starbase.planetid);
            var base = vgap.getStarbase(planet.id) != null ? "X" : "";
            var mission_list = returnSBMissionArray_SB(starbase);
            html = "<tr class='RowSelect'><td><img class='TinyIcon' src='" + starbase.img + "'/></td><td>" + planet.id + "</td><td>" + planet.name + "</td>";
            if (vgap.editmode)
                html += "<td>" + planet.ownerid + "</td>";
            if (view == 1)
                html += "<td>" + planet.megacredits + "</td><td>" + planet.supplies + "</td><td>" + planet.neutronium + "</td><td>" + planet.duranium + "</td><td>" + planet.tritanium + "</td><td>" + planet.molybdenum + "</td><td>" + planet.groundneutronium + "</td><td>" + planet.groundduranium + "</td><td>" + planet.groundtritanium + "</td><td>" + planet.groundmolybdenum + "</td></tr>";
            if (view == 0) {
                html += "<td>" + starbase.defense + "</td><td>" + starbase.fighters + "</td><td>" + starbase.damage + "</td><td>" + starbase.hulltechlevel + "</td><td>" + starbase.enginetechlevel + "</td><td>" + starbase.beamtechlevel + "</td><td>" + starbase.torptechlevel + "</td><td>" + planet.friendlycode + "</td>";
                // dtolman - improved ship list view plugin adapted code
                html += "<td><select id='Dropdown" + i + "' onChange='setSBMission_SB(this)'>";
                for (var k = 0; k < mission_list.length; k++) {
                    if (starbase.mission == mission_list[k].id)
                        html += "<option value='" + k + "' selected=>" + mission_list[k].name + "</option>"
                    else
                        html += "<option value='" + k + "'>" + mission_list[k].name + "</option>"
                }
                html += "</select></td>";
                //-------------------MCtoDevelop-----------------------
                var dev = planet.developmentlevel;
                var moneyneed = 100000 * 2 * (2 ** (dev - 1));
                if (planet.megacredits > moneyneed) {
                    html += "<td style='color:green' title='Can raise Dev level'>" + planet.megacredits + "</td>";
                } else {
                    html += "<td>" + planet.megacredits + "</td>";
                }
                //-------------------MCtoDevelop-----------------------
                if (starbase.isbuilding) {
                    html += "<td>" + vgap.getHull(starbase.buildhullid).name + "</td><td>" + (starbase.buildengineid ? vgap.getEngine(starbase.buildengineid).name : "") + "</td>";
                    if (starbase.buildbeamcount > 0 && starbase.buildbeamid > 0)
                        html += "<td>" + vgap.getBeam(starbase.buildbeamid).name + " (" + starbase.buildbeamcount + ")</td>";
                    else
                        html += "<td></td>";
                    if (starbase.buildtorpcount > 0 && starbase.buildtorpedoid > 0)
                        html += "<td>" + vgap.getTorpedo(starbase.buildtorpedoid).name + " (" + starbase.buildtorpcount + ")</td>";
                    else
                        html += "<td></td>";
                }
                else {
                    html += "<td></td><td></td><td></td><td></td>";
                }
                //html += "<td>" + (starbase.readystatus > 0 ? (starbase.readystatus == 1 ? "v" : "vv") : "") + "</td>";
                html += "<td>" + (starbase.readystatus > 0 ? "<div class='readyCheckBox readyCheckBox" + starbase.readystatus + "' >" + starbase.readystatus + "</div>" : "") + "</td>";

            }
            if (view == 2) {

                var note = vgap.getNote(starbase.planetid, 1);
                if (note != null) {
                    html += '<td>' + note.body.replace(/\n/g, "<br/>") + '</td>';
                }
                else {
                    html += '<td></td>';
                }
            }
            html += "</tr>";

            var rowHtml = $(html); // Convertir el HTML en un objeto jQuery
            var select = function (id) { return function () { vgap.map.selectStarbase(id); }; };

            //Añadir la función de clic a las celdas que no sean menu desplegable de las filas cuando view == 0
            if (view == 0) {
                rowHtml.find("td:not(:has(select))").click(select(planet.id));
            } else {
                rowHtml.click(select(planet.id));
            }
            rowHtml.appendTo("#StarbaseRows");

        }

        //this.content.fadeIn();
        $("#PlanetTable").tablesorter();
        this.pane.jScrollPane();

        vgap.CurrentView = "showStarbases";
        vgap.showStarbasesViewed = 1;

    };

    returnSBMissionArray_SB = function (starbase) {
        var missions = [
            { id: 0, name: "Nothing" },
            { id: 1, name: "Refuel" },
            { id: 2, name: "Max Defense" },
            { id: 3, name: "Load Torps" },
            { id: 4, name: "Unload Freigthers" },
            { id: 5, name: "Repair Base" },
            { id: 6, name: "Force Surrender" }
        ];

        var planet = vgap.getPlanet(starbase.planetid);

        if (vgap.advActive(38) || vgap.tradeStationNearby(planet)) {
            missions.push(
                { id: 7, name: "Send MC" },
                { id: 8, name: "Receive MC" }
            );
        }

        if (vgap.tradeStationNearby(planet)) {
            missions.push(
                { id: 16, name: "Send Dur" },
                { id: 17, name: "Receive Dur" },
                { id: 18, name: "Send Tri" },
                { id: 19, name: "Receive Tri" },
                { id: 20, name: "Send Mol" },
                { id: 21, name: "Receive Mol" }
            );

            if (vgap.gameUsesSupplies()) {
                missions.push(
                    { id: 22, name: "Send Supplies" },
                    { id: 23, name: "Receive Supplies" }
                );
            }
        }

        if (vgap.advActive(39)) {
            missions.push({ id: 9, name: "Lay Mines" });
        }

        if (vgap.advActive(39) && vgap.player.raceid == 7) {
            missions.push({ id: 10, name: "Lay Web Mines" });
        }

        if (vgap.advActive(40) || vgap.advActive(41)) {
            missions.push({ id: 11, name: "Mine Sweep" });
        }

        if (vgap.advActive(57) && vgap.pl.isOwnedByEmpire(planet)) {
            missions.push(
                { id: 12, name: "Enviar Figthers", desc: nu.t.sendfightersdef },
                { id: 13, name: "Recibir Figthers", desc: nu.t.recfightersdef }
            );
        }

        if (vgap.isHomeSector()) {
            let homeworldFound = false;

            for (let i = 0; i < vgap.myplanets.length; i++) {
                if (vgap.myplanets[i].flag == 1) {
                    homeworldFound = true;
                }
            }

            if (!homeworldFound) {
                missions.push({ id: 15, name: "Hacer Homeworld", desc: "Make this starbase and planet your Homeworld." });
            } else {
                let section = vgap.getArray(vgap.homesector.sections, 18);

                if (section && section.isunlocked && !vgap.getCommandCenter()) {
                    missions.push({ id: 14, name: "Upgrade", desc: "Make this starbase and planet your Central Command Center." });
                }
            }
        }

        return missions;
    };
    setSBMission = function (selectElement) {
        var selectedIndex = selectElement.selectedIndex;
        var starbaseIndex = parseInt(selectElement.id.replace("Dropdown", ""));
        var starbase = vgap.mystarbases[starbaseIndex];
        var mission_list = returnSBMissionArray(starbase);
        starbase.mission = mission_list[selectedIndex].id;
        vgap.getPlanet(starbase.planetid).changed = 1;
        vgap.save();
        vgap.map.draw();
    };




} //Wrapper for injection

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);