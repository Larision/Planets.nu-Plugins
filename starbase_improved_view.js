// ==UserScript==
// @name           Planets.nu - improved Starbase List View
// @description    Miscellaneous Improvements to the Starbase List View
// @match        https://planets.nu/home
// @match        https://play.planets.nu/*
// @match        https://planets.nu/*
// @match	       https://test.planets.nu/*
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
            html += "<th title='Defense' align='left'>Def</th><th title='Fighters' align='left'>F</th><th title='Damage' align='left'>Dam</th><th title='Hull Tech Level' align='left'>H</th><th title='Engine Tech Level' align='left'>E</th><th title='Beam Tech Level' align='left'>B</th><th title='Torpedo Tech Level' align='left'>T</th><th align='left' class='sorter-text'>FC</th><th title='Mission' align='left'>Mission</th><th title='Building Hull' align='left'>Building</th><th title='Building Engines' align='left'>Engines</th><th title='Building Beams' align='left'>Beams</th><th title='Building Torpedos' align='left'>Torps</th><th title='Ready Checkbox Status' align='left'>R</th>";
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

            var html = "<tr class='RowSelect'><td><img class='TinyIcon' src='" + starbase.img + "'/></td><td>" + planet.id + "</td><td>" + planet.name + "</td>";
            if (vgap.editmode)
                html += "<td>" + planet.ownerid + "</td>";
            if (view == 1)
                html += "<td>" + planet.megacredits + "</td><td>" + planet.supplies + "</td><td>" + planet.neutronium + "</td><td>" + planet.duranium + "</td><td>" + planet.tritanium + "</td><td>" + planet.molybdenum + "</td><td>" + planet.groundneutronium + "</td><td>" + planet.groundduranium + "</td><td>" + planet.groundtritanium + "</td><td>" + planet.groundmolybdenum + "</td></tr>";
            if (view == 0) {
                html += "<td>" + starbase.defense + "</td><td>" + starbase.fighters + "</td><td>" + starbase.damage + "</td><td>" + starbase.hulltechlevel + "</td><td>" + starbase.enginetechlevel + "</td><td>" + starbase.beamtechlevel + "</td><td>" + starbase.torptechlevel + "</td><td>" + planet.friendlycode + "</td>";
                const missionList = {
                    0: "Nothing",
                    1: "Refuel",
                    2: "Max Defense",
                    3: "Load Torps",
                    4: "Unload Freigthers",
                    5: "Repair Base",
                    6: "Force Surrender",
                    7: "Send MC",
                    8: "Receive MC",
                    9: "Send DUR",
                    10: "Receive DUR",
                    11: "Send TRI",
                    12: "Receive TRI",
                    13: "Send MOL",
                    14: "Receive MOL"
                };
                const mission = starbase.mission;
                const xxx = missionList[mission];
                html += "<td>" + xxx + "</td>";
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
            var select = function(id) { return function() { vgap.map.selectStarbase(id); }; };
            $(html).click(select(planet.id)).appendTo("#StarbaseRows");
        }

        //this.content.fadeIn();
        $("#PlanetTable").tablesorter();
        this.pane.jScrollPane();

        vgap.CurrentView = "showStarbases";
        vgap.showStarbasesViewed = 1;

    };
} //Wrapper for injection

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);