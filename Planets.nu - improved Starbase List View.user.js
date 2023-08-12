// ==UserScript==
// @name            Planets.nu - improved Starbase List View
// @description     Miscellaneous Improvements to the Starbase List View
// @match           http://*.planets.nu/*
// @match           https://*.planets.nu/*
// @match           http://planets.nu/*
// @match           https://planets.nu/*
// @version 0.1
// ==/UserScript==
// 0.1 - Include starbases misions

function wrapper () { // wrapper for injection
    oldShowStarbases =  vgapDashboard.prototype.showStarbases;

    vgapDashboard.prototype.showStarbases = function (view) {
        vgap.playSound("button");
        vgap.closeSecond();

        this.content.empty();

        //filter messages
        var html = "";

        if (!view)
            view = 0;

        var filterMenu = $("<ul class='FilterMenu'></ul>").appendTo(this.content);
        $("<li " + (view == 0 ? "class='SelectedFilter'" : "") + ">Status</li>").tclick(function() { vgap.dash.showStarbases(0); }).appendTo(filterMenu);
        $("<li " + (view == 1 ? "class='SelectedFilter'" : "") + ">Resource View</li>").tclick(function() { vgap.dash.showStarbases(1); }).appendTo(filterMenu);
        $("<li " + (view == 2 ? "class='SelectedFilter'" : "") + ">Notes View</li>").tclick(function() { vgap.dash.showStarbases(2); }).appendTo(filterMenu);


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
            html = "<tr class='RowSelect'><td><img class='TinyIcon' src='" + starbase.img + "'/></td><td>" + planet.id + "</td><td>" + planet.name + "</td>";
            if (vgap.editmode)
                html += "<td>" + planet.ownerid + "</td>";
            if (view == 1)
                html += "<td>" + planet.megacredits + "</td><td>" + planet.supplies + "</td><td>" + planet.neutronium + "</td><td>" + planet.duranium + "</td><td>" + planet.tritanium + "</td><td>" + planet.molybdenum + "</td><td>" + planet.groundneutronium + "</td><td>" + planet.groundduranium + "</td><td>" + planet.groundtritanium + "</td><td>" + planet.groundmolybdenum + "</td></tr>";
            if (view == 0) {
                html += "<td>" + starbase.defense + "</td><td>" + starbase.fighters + "</td><td>" + starbase.damage + "</td><td>" + starbase.hulltechlevel + "</td><td>" + starbase.enginetechlevel + "</td><td>" + starbase.beamtechlevel + "</td><td>" + starbase.torptechlevel + "</td><td>" + planet.friendlycode + "</td>";
                // dtolman - improved ship list view plugin adapted code
                var mission_list = returnSBMissionArray(starbase);
                html += "<td><select id='Dropdown" + i + "' onChange='setSBMission(this)'>";
                for (var k = 0; k < 15; k++) {
                    if (starbase.mission == k)
                        html += "<option value='" + k + "' selected=>" + mission_list[k] + "</option>"
                    else
                        html += "<option value='" + k + "'>" + mission_list[k] + "</option>"
                }
                html += "</select></td>";
                //-------------------MCtoDevelop-----------------------
				var dev = planet.developmentlevel;
				var moneyneed = 100000*2*(2**(dev-1));
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
            var select;
            if (view == 0)
                select = function(id) { return function() {}; };
            else
                select = function(id) { return function() { vgap.map.selectStarbase(id); }; };
            $(html).click(select(planet.id)).appendTo("#StarbaseRows");
            /* var rowHtml = $(html); // Convertir el HTML en un objeto jQuery

            //Añadir la función de clic a las celdas de las filas cuando view == 0
            if (view == 0) {
                rowHtml.find("td:not(:has(select))").click(select(planet.id));
            } else {
                rowHtml.click(function() {
                    vgap.map.selectStarbase(planet.id);
                });
            }
            rowHtml.appendTo("#StarbaseRows"); */
        }

        //this.content.fadeIn();
        $("#PlanetTable").tablesorter();
        this.pane.jScrollPane();

        vgap.CurrentView = "showStarbases";
        vgap.showStarbasesViewed = 1;

    };

    function isHomeSector() {
        return vgap.game.gametype === 100;
    };

    // List of SB missions
    returnSBMissionArray = function (starbase) {
        var missions = new Array();

        // Codigo para saber si planetoide esta dentro de tradenetwork
        var sb_planet = vgap.getPlanet(starbase.planetid);

        missions.push("Nothing");
        missions.push("Refuel");
        missions.push("Max Defense");
        missions.push("Load Torps");
        missions.push("Unload Freigthers");
        missions.push("Repair Base");
        missions.push("Force Surrender");
        if (isHomeSector() && (vgap.tradeStationNearby(sb_planet))) {
            missions.push("Send MC");
            missions.push("Receive MC");
            missions.push("Send Dur");
            missions.push("Receive Dur");
            missions.push("Send Tri");
            missions.push("Receive Tri");
            missions.push("Send Mol");
            missions.push("Receive Mol");
        } else {
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
            missions.push("Invalid");
        }
        return missions;
    };

    setSBMission = function(ms__ms) {
        var ms_length = ms__ms.id.length;
        var ms_ID = ms__ms.id.substring(8,ms_length);
        var starbase = vgap.mystarbases[ms_ID];
        var mission_list = returnSBMissionArray(starbase);
        if (mission_list[ms__ms.value] == "Invalid") 
            alert ("Invalid Mission Selected");
        else
            vgap.mystarbases[ms_ID].mission = ms__ms.value;

        vgap.dash.showStarbases(0);

        if (vgaPlanets.prototype.version < 3)
            vgap.map.updateZoom();
        //        vgap.map.draw();
    };


} //Wrapper for injection

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);