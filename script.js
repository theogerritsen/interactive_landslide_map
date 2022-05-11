// événement lors du clique sur la croix du div d'info pour fermer le div
$('#btn').click(function(){
        $(".infoOnLoad").toggle("slide");
});

// même chose pour le bouton Understood
function closeDiv(){
        $(".infoOnLoad").toggle("slide");
};

// on ajoute une classe active à notre div légende pour l'animation CSS

function openLegends() {
    document.querySelector("#legends").classList.toggle("active");
}
// ajout des variables
var map, layerSwitcher, overlays, styleFunction;


// clé pour mapbox tile
const key = 'pk.eyJ1IjoidGhlb2dlcnJpdHNlbiIsImEiOiJja3R2Zzkybzkwa25oMm5tcGp1MWY0enh1In0.n_ye_r9ELbLqxyWl-giSlA';

// définition du view lors du load de la page
var view = new ol.View({
    projection: 'EPSG:3857',
    center: [0.0,40.0],
    zoom: 2,
});

const attribution = new ol.control.Attribution({
    collapsible: false,
});

// Ajout des fonds de carte
var base_maps = new ol.layer.Group({
    'title': 'Base maps',
    layers: [
        // Fond de carte OSM
        new ol.layer.Tile({
            title: 'OSM',
            type: 'base',
            visible: false,
            source: new ol.source.OSM({
                attributions: ['Basemap :' + " <a href='https://www.openstreetmap.org/#map=8/46.825/8.224' target='_blank'>OpenStreetMap contributors</a>" +
                ' <b>|</b> ',
                'Raster Tiles:' + " <a href='https://geoserver.org/' target='_blank'>GeoServer</a>" + 
                ' <b>|</b> ',
                'Data: ' + " <a href='https://ourworldindata.org/' target='_blank'>Our World in Data</a>"
            ]
            })
        }),
        // Fond de carte satellite ESRI
        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: false,
            source: new ol.source.XYZ({
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attributions: ['Basemap :' + " <a href='https://www.esri.com/en-us/home' target='_blank'>ESRI</a>" +
                ' <b>|</b> ',
                'Raster Tiles:' + " <a href='https://geoserver.org/' target='_blank'>GeoServer</a>" + 
                ' <b>|</b> ',
                'Data: ' + " <a href='https://ourworldindata.org/' target='_blank'>Our World in Data</a>"
            ]
            })
        }),
        // fond de carte mapbox personnalisé 
        new ol.layer.Tile({
            title: 'mapboxGL DEM',
            type: 'base',
            visible: true,
            source: new ol.source.XYZ({
                url: 'https://api.mapbox.com/styles/v1/theogerritsen/cl26ch4n1004h14nvm9lnrwyf/tiles/256/{z}/{x}/{y}@2x?access_token=' + key,
                attributions: ['Basemap :' + " <a href='https://www.mapbox.com/' target='_blank'>mapboxGL</a>" +
                    ' <b>|</b> ',
                    'Raster Tiles:' + " <a href='https://geoserver.org/' target='_blank'>GeoServer</a>" + 
                    ' <b>|</b> ',
                    'Data: ' + " <a href='https://ourworldindata.org/' target='_blank'>Our World in Data</a>"
                ]
            })
        })
    ]
});

// Controle des couches à afficher
overlays = new ol.layer.Group({
    'title': 'Overlays',
    layers: [
        new ol.layer.Tile({
            title: 'Economical exposure',
            source: new ol.source.TileWMS({
                url: 'https://db1.unepgrid.ch/geoserver/wms',
                params: {
                    'LAYERS': 'preview:ls_ecoexp2'
                },
                attributions: ["<b>|</b> <a href='http://129.194.11.165:8080/geonetwork/srv/fre/catalog.search#/metadata/c51c4d7c-8f94-4aa6-bd24-e867cd25513d' target='_blank'>Economical Exposure</a>"],
                serverType: 'geoserver'
            }),
            // on ajoute un visible false pour ne pas la montrer lors du load de la page
            visible: false
        }),
        new ol.layer.Tile({
            title: 'Physical exposure',
            source: new ol.source.TileWMS({
                url: 'https://db1.unepgrid.ch/geoserver/wms',
                params: {
                    'LAYERS': 'preview:ls_physexp2'
                },
                attributions: ["<b>|</b> <a href='http://129.194.11.165:8080/geonetwork/srv/fre/catalog.search#/metadata/c3d010a0-862f-48a9-a361-e9f8a8014f5e' target='_blank'>Physical exposure</a>"],
                serverType: 'geoserver'
            }),
            visible: false
        }),
        new ol.layer.Tile({
            title: 'Frequency',
            source: new ol.source.TileWMS({
                url: 'https://db1.unepgrid.ch/geoserver/wms',
                params: {
                    'LAYERS': 'preview:ls_pr'
                },
                attributions: ["<b>|</b> <a href='http://129.194.11.165:8080/geonetwork/srv/fre/catalog.search#/metadata/31e287fa-ae88-4a98-8638-daba40ae3d3c' target='_blank'>Frequency</a>"],
                serverType: 'geoserver'
            }),
            visible: false
        }),
            new ol.layer.Tile({
                title: 'Overall risk',
                source: new ol.source.TileWMS({
                    url: 'https://db1.unepgrid.ch/geoserver/wms',
                    params: {
                        'LAYERS': 'preview:ls_risk'
                    },
                    attributions: ["<b>|</b> <a href='http://129.194.11.165:8080/geonetwork/srv/fre/catalog.search#/metadata/1e722624-7dd3-43e8-9f81-470bd5bd0e8b' target='_blank'>Risk</a>"],
                    serverType: 'geoserver'
            }),
            // on la met en visible pour que ce soit la première couche affichée lors du load de la page
            visible: true
        })
    ]
});

// Ajout de la carte au div
map = new ol.Map({
    target: 'map',
    view: view,
    controls: ol.control.defaults({attribution: false}).extend([attribution])
});

// Ajout du fond de carte et des overlays
map.addLayer(base_maps);
map.addLayer(overlays);

// Position du curseur en lat long 
var mouse_position = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.toStringHDMS,
    projection: "EPSG:4326"
});
map.addControl(mouse_position);

// Contrôle du zoom
var zoom = new ol.control.Zoom({
    zoomInLabel: '+',
    zoomOutLabel: '-'
});

map.addControl(zoom);

// Ajout du slider de zoom
var slider = new ol.control.ZoomSlider();
map.addControl(slider);

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
});
map.addControl(layerSwitcher);

////////////////////////////////////
////// SLIDER TEMPOREL ///////////////
//////////////////////////////////////

// on va chercher la default value du range
var x = document.getElementById("myRange").defaultValue;


// variable contenant la couche de symboles affichées
var currentLayer;

// on va fonctionner de manière rétro active :
// on va stocker le nom de la couche affichée actuelle dans une variable
// pour qu'on puisse l'enlever au moment du changement de l'input (slider)

// on va chercher la valeur du slider lors de son changement
// on prend ici input à la place de change pour que les symboles
// s'updatent dès qu'on drag le slider et non pas quand on le lâche
$('input').on('input', function(){

    var val = this.value;
    // on actualise notre variable avec le nom de la couche actuelle
    currentLayer = map.getLayers().getArray()[2];
    // on enlève la couche actuelle
    map.removeLayer(currentLayer);
    // on ajoute la couche qui correspond à la valeur indiquée par le slider
    choseData(val);
    $("#date_value").html($(this).val());
});

// fonction pour choisir la couche à afficher selon la valeur de l'input
function choseData(val) {
    switch(val) {
        case '1950':
            return map.addLayer(deaths_1950);
        case '1960':
            return map.addLayer(deaths_1960);
        case '1970':
            return map.addLayer(deaths_1970);
        case '1980':
            return map.addLayer(deaths_1980);
        case '1990':
            return map.addLayer(deaths_1990);
        case '2000':
            return map.addLayer(deaths_2000);
        case '2010':
            return map.addLayer(deaths_2010);
    };
};

///////////////////////////////////////////////////
/////////////////// DATA ////////////////////////
///////////////////////////////////////////////////
styleFunction = function (feature, resolution) {
    // on  va définir la taille des cercles qui sont supérieures à notre max
    // défini plus haut
    if (feature.get('deaths') > max)  {
        
        return new ol.style.Style({
            image: new ol.style.Circle({
            radius: 60,
            fill: fill,
            stroke: stroke
            }), 
        });
    }
        
    for (i = 0; i < 50; i++) {

        // on va ici définir la taille du cercle de chaque donnée selon notre échelle
        // définie plus haut : c-a-d allant de 0 a 150 avec un saut de 3
        // pour cela, il faut parcourir nos données avec un boucle et les intégrer
        // dans l'intervalle (de 3) correspondante avec 50 intervalles
        // on va donc créer une condition dans la boucle pour cette intervalle :
        // si la valeur de notre donnée est supérieur à l'incrémentation * diff(3)
        // et la valeur est inférieur ou égale à l'incrémentation + 1 * 3
        // donc si on prend i = 1 :
        // si la valeur > 1*3 = 3
        // et <= à 1+1*3 = 6
        // on lui applique le style (taille du cercle) correspondant
        // cette manière nous donne donc des intervalles de 3 à chaque fois
        if (feature.get('deaths') > (i*diff) && feature.get('deaths') <= ((i+1)*diff) ) {
        
            return new ol.style.Style({
                image: new ol.style.Circle({
            // on définit le radius en pixel comme notre incrémentation + 5
            // on ajoute 5 pour avoir un seuil minimum pour améliorer la visibilité
                radius: i+5,
                fill: fill,
                stroke: stroke
                }),
            });
        }    
    }
};
// on ajoute chacune de nos couches KML

const deaths_1950 =  new ol.layer.Vector({
    name:'Landslide_1950',
    source: new ol.source.Vector({
        // on va chercher le data
        url: 'data/ls_deaths_1950.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        // pour chaque entité trouvée, on ajoute le style
        // défini plus bas
        return styleFunction(feature, resolution);
    }
});

const deaths_1960 =  new ol.layer.Vector({
    name:'Landslide_1960',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_1960.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});

const deaths_1970 =  new ol.layer.Vector({
    name:'Landslide_1970',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_1970.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});

const deaths_1980 =  new ol.layer.Vector({
    name:'Landslide_1980',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_1980.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});

const deaths_1990 =  new ol.layer.Vector({
    name:'Landslide_1990',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_1990.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});

const deaths_2000 =  new ol.layer.Vector({
    name:'Landslide_2000',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_2000.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});

const deaths_2010 =  new ol.layer.Vector({
    name:'Landslide_2010',
    source: new ol.source.Vector({
        url: 'data/ls_deaths_2010.kml',
        format: new ol.format.KML({extractStyles: false})
    }),
    style: function (feature, resolution) {
        return styleFunction(feature, resolution);
    }
});


// on met notre maximum à 150
var max  = 150;
const maximum = [];
// nos cercles auront 50 tailles différentes avec un saut de 3
var diff = max/50;
var fill = new ol.style.Fill({color: 'rgba(105, 200, 255, 0.6)'});
var stroke = new ol.style.Stroke({color: 'rgba(105, 200, 255, 0.4)', width: 2});

// on ajoute la couche qu'on veut montrer on load
map.addLayer(deaths_2010)

///////////////////////////////////////////
/////////// barplot d3 ////////////////////
////////////////////////////////////////

// on définit les marges de notre div
const margin = {top: 100, right: 20, bottom: 0, left: 40};
// on va chercher la largeur et hauteur de notre div
const width = document.getElementById("container").offsetWidth;
const height = document.getElementById("container").offsetHeight;

// on ajoute les barplots à notre div
const barplot = d3.select('#barplot').append("svg")
    .attr("class", "svg")
    .append("g")
    .attr("class", "essai")
    .attr("transform", "translate(" + margin.left +"," + margin.top +")");

const scaleX = d3.scaleBand()
    // le range indique que nos données vont s'étaler sur toute la largeur de notre graphique
    .range([0, width*0.8])
    .padding(0.1);

const scaleY = d3.scaleLinear()
    .range([height, 0]);

// promesse pour charger nos données
const promises = [];

promises.push(d3.csv("data/data.csv"));

Promise.all(promises).then(function(values) {
    const year_deaths = values[0];

    map.on('click', function(evt){

        // on enlève la classe active à notre légende pour que le div disparaisse si on clique sur un symbole
        document.querySelector("#legends").classList.remove("active");

        // on utilise forEachFeatureAtPixel ce qui permet de voir s'il y a un feature sur le pixel sur lequel le user
        // a cliquer et de lier ce feature à notre data par la suite
        var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });
        // si il y a un feature :
        if (feature) {
            
            // on va chercher le nom du pays qui correspond au feature cliqué
            const country_selected = feature.get('LONG_NAME');
            // on enlève le potentiel graph déjà présent
            barplot.selectAll("g").remove();
            // même chose pour chaque titre du graph
            barplot.selectAll("text").remove();

            // on va chercher nos valeurs pour l'axe x (années)
            scaleX.domain(year_deaths.map(h => h.year_deaths));

            // on définit notre axe y entre 0 et le max du pays sélectionné
            scaleY.domain([0, d3.max(year_deaths, h => +h[country_selected])]);

            barplot.append("g")
            .attr("transform", "translate(0,"+height+")")
            .style("class", "axis")
            .call(d3.axisBottom(scaleX).tickSize([1]))
            .selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "2.2em")
                .attr("dy", "1em")
                .style("font-size", "14px");
            
            // titre de chaque barplot
            barplot.append("text")
                .attr("x", width*0.4)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .style("fill", "#cfcfcf")
                .style("font-weight", "300")
                .style("font-size", "20px")
                .text(country_selected+"'s landslide related deaths");

            // on ajoute l'axe Y à notre SVG avec 6 ticks (graduation)
            barplot.append("g")
                .call(d3.axisLeft(scaleY).ticks(6))
                .attr("font-size", "12px")
                .selectAll(".bar")
                .data(year_deaths)
                // on peut maintenant créer notre bar plot
            .enter().append("rect")
                .attr("class", "bar")
                // on définit notre x comme étant les dizaines d'année
                .attr("x", h => scaleX(h.year_deaths))
                // largeur des barres
                .attr("width", scaleX.bandwidth())
                // on commence avec un y = 0 pour que les barplots montent progressivement
                // avec la transition
                .attr("y", h => scaleY(0))
                    // on définit la hauteur des barres par rapport au score de chaque pays
                .attr("height", h => height - scaleY(0))

            // on va gérer ici la valeur des décès qu'on affichera au-dessus de chaque barre
            barplot.selectAll(".text")
                .data(year_deaths)
            .enter().append("text")
                .attr("class", "text")
                .attr("text-anchor", "middle")
                .style("fill", "#e7e7e7")
                .style("font-size", "18px")
                // on met les valeurs au milieu de chaque barplot
                .attr("x", h => scaleX(h.year_deaths) + scaleX.bandwidth()/2)
                // on remet y = 0 pour le text pour gérer la transition
                .attr("y", h => scaleY(0))
                .text(h => h[country_selected])
            // transition de 0.5 seconde pour construire les barplots et le text
            barplot.selectAll(".bar")
                .transition()
                .duration(500)
                .attr("y", h => scaleY(h[country_selected]))
                .attr("height", h => height - scaleY(h[country_selected]))

            barplot.selectAll(".text")
                .transition()
                .duration(500)
                .attr("y", h => scaleY(h[country_selected])-10)
        }
    })
});