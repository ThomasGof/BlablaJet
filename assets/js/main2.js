document.addEventListener("DOMContentLoaded", function () {

    require([
        "esri/widgets/Sketch/SketchViewModel",
        "esri/geometry/Polyline",
        "esri/geometry/Point",
        // "esri/widgets/Sketch/SketchViewModel",
        // "esri/geometry/Polyline",
        // "esri/geometry/Point",
        "esri/Graphic",
        "esri/Map",
        "esri/views/MapView",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/geometryEngine",
        "esri/widgets/Expand",
        "esri/widgets/Legend",
        "esri/widgets/Search",
        "esri/core/watchUtils"
    ], function (
        SketchViewModel,
        Polyline,
        Point,
        // SketchViewModel,
        // Polyline,
        // Point,
        Graphic,
        Map,
        MapView,
        FeatureLayer,
        GraphicsLayer,
        geometryEngine,
        Expand,
        Legend,
        Search,
        watchUtils
    ) {
        // App 'globals'  Application globale
        // Déclaration des variable
        let sketchViewModel, featureLayerView, pausableWatchHandle, chartExpand;

        let centerGraphic,
            edgeGraphic,
            polylineGraphic,
            bufferGraphic,
            centerGeometryAtStart,
            labelGraphic;

        const unit = "kilometers";

        // Créer des calques
        const graphicsLayer = new GraphicsLayer();
        const graphicsLayer2 = new GraphicsLayer();

        const featureLayer = new FeatureLayer({
            portalItem: {
                id: "83c37666a059480bb8a7cb73f449ff52"
            },
            outFields: ["*"]
        });

        // Créer des map
        const map = new Map({
            basemap: "dark-gray",
            layers: [featureLayer, graphicsLayer2, graphicsLayer]
        });

        // Créer des view
        const view = new MapView({
            container: "viewDiv",
            map: map,
            zoom: 6,
            center: [1.0000, 48.0000],
            constraints: {
                maxScale: 0,
                minScale: 6000000
            }
        });

        // Configurer la définition des statistiques pour client-side query(requete)
        // Population totale de groupes d'âge selon le sexe dans les secteurs de recensement
        const statDefinitions = ["FEM85C10","FEM80C10","FEM75C10","FEM70C10","FEM65C10","FEM60C10","FEM55C10","FEM50C10","FEM45C10","FEM40C10","FEM35C10","FEM30C10","FEM25C10","FEM20C10","FEM15C10","FEM10C10","FEM5C10","FEM0C10",
            "MALE85C10","MALE80C10","MALE75C10","MALE70C10","MALE65C10","MALE60C10","MALE55C10","MALE50C10","MALE45C10","MALE40C10","MALE35C10","MALE30C10","MALE25C10","MALE20C10","MALE15C10","MALE10C10","MALE5C10","MALE0C10"
        ].map(function (fieldName) {
            return {
                onStatisticField: fieldName,
                outStatisticFieldName: fieldName + "_TOTAL",
                statisticType: "sum"
            };
        });

        // Update(Mise à jour) UI
        setUpAppUI();
        setUpSketch();

        function setUpAppUI() {
            // Lorsque la couche est chargée, créez un observateur pour déclencher le dessin du polygone tampon
            view.whenLayerView(featureLayer).then(function (layerView) {
                featureLayerView = layerView;

                pausableWatchHandle = watchUtils.pausable(
                    layerView,
                    "updating",
                    function (val) {
                        if (!val) {
                            drawBufferPolygon();
                        }
                    }
                );

                // Afficher les directions lors du chargement de layerView
                watchUtils.whenFalseOnce(layerView, "updating", function () {
                    view.popup.open({
                        title: "Point de Dépard",
                        content:
                            "Faites glisser ce point pour déplacer le tampon.<br/> " +
                            "Ou faites glisser le <b>2eme Point</b> pointez pour redimensionner le tampon(la zone de recherche).",  
                        location: centerGraphic.geometry
                    });
                    view.popup.alignment = "top-left";
                });
            });

            view.when(function () {
                // Afficher le graphique dans un widget Expand
                chartExpand = new Expand({
                    // expandIconClass: "esri-icon-chart",
                    // expandTooltip: "Population pyramid chart",
                    expandTooltip: "Show Legend",
                    expanded: false,
                    view: view,
                    content: document.getElementById("chartPanel")
                });

                const search = new Search({
                    view: view,
                    resultGraphicEnabled: false,
                    popupEnabled: false
                });

                // Reprendre la fonction drawBufferPolygon (); l'utilisateur a recherché un nouvel emplacement et
                // doit mettre à jour le polygone tampon et réexécuter la requête de statistiques
                search.on("search-complete", function () {
                    pausableWatchHandle.resume();
                });

                // Widget de légende
                // const legend = new Legend({
                //     view: view,
                //     layerInfos: [
                //         {
                //             layer: featureLayer,
                //             title: "Densité de population par secteurs de recensement en 2010 "
                //         }
                //     ]
                // });

                // // Afficher la légende dans un widget Expand
                // const legendExpand = new Expand({
                //     expandTooltip: "Show Legend",
                //     expanded: false,
                //     view: view,
                //     content: legend
                // });

                // Ajouter nos composants à l'interface utilisateur
                view.ui.add(chartExpand, "bottom-left");
                view.ui.add(search, "top-right");
                // view.ui.add(legendExpand, "bottom-right");
            });

            // Fermez la fenêtre contextuelle d'aide lorsque la vue est focalisée
            view.watch("focused", function (newValue) {
                if (newValue) {
                    view.popup.close();
                }
            });
        }










        /*****************************************************************
         * Créer SketchViewModel et câbler des écouteurs d'événements
         *****************************************************************/

        function setUpSketch() {
            sketchViewModel = new SketchViewModel({
                view: view,
                layer: graphicsLayer
            });

            // Écoutez l'événement de mise à jour de SketchViewModel afin que le graphique de la pyramide des âges
            // soie actulaliser lorsque les graphiques sont mis à jour
            sketchViewModel.on("update", onMove);
        }










        /*********************************************************************
         * Les graphiques de bord ou de centre sont déplacés. Recalculez le tampon avec
         * informations de géométrie mises à jour et réexécutez les statistiques de requête.
         *********************************************************************/

        function onMove(event) {
            // Si le graphique de bord se déplace, conservez le graphique central
            // à son emplacement initial. Déplacer uniquement le graphique du bord
            if ( event.toolEventInfo && event.toolEventInfo.mover.attributes.edge ) {

                const toolType = event.toolEventInfo.type;              
                if (toolType === "move-start") {
                    centerGeometryAtStart = centerGraphic.geometry;
                }
                // garder le graphique central à son emplacement initial lorsque le point de bord se déplace
                else if (toolType === "move" || toolType === "move-stop") {
                    centerGraphic.geometry = centerGeometryAtStart;
                }
            }

            // le graphique du centre ou du bord est déplacé, recalculez le tampon
            const vertices = [
                [centerGraphic.geometry.x, centerGraphic.geometry.y],
                [edgeGraphic.geometry.x, edgeGraphic.geometry.y]
            ];
            console.log(vertices);

            // requête de statistiques côté client des fonctionnalités qui coupent le tampon
            calculateBuffer(vertices);

            // l'utilisateur clique sur la vue ... méthode de mise à jour des appels avec les graphiques du centre et des bords
            if (event.state === "cancel" || event.state === "complete") {
                sketchViewModel.update([edgeGraphic, centerGraphic], {
                    tool: "move"
                });
            }
        }












        /*********************************************************************
         * Le bord ou le point central est en cours de mise à jour. Recalculez le tampon avec
         * informations de géométrie mises à jour.
         *********************************************************************/

        function calculateBuffer(vertices) {
            // Mettre à jour la géométrie de la polyligne en fonction de l'emplacement des bords et des points centraux
            polylineGraphic.geometry = new Polyline({
                paths: vertices,
                spatialReference: view.spatialReference
            });

            // Recalculez la longueur de la polyligne et le polygone tampon
            const length = geometryEngine.geodesicLength(
                polylineGraphic.geometry,
                unit
            );
            const buffer = geometryEngine.geodesicBuffer(
                centerGraphic.geometry,
                length,
                unit
            );

            // Mettre à jour le polygone tampon
            bufferGraphic.geometry = buffer;

            // Recherchez les tranches d'âge des femmes et des hommes des secteurs de recensement qui se croisent
            // le polygone tampon sur le client
            queryLayerViewAgeStats(buffer).then(function (newData) {
                // Créer un diagramme de pyramide des âges à partir du résultat renvoyé
                updateChart(newData);
            });

            // Mettre à jour le graphique de l'étiquette pour afficher la longueur de la polyligne
            labelGraphic.geometry = edgeGraphic.geometry;
            labelGraphic.symbol = {
                type: "text",
                color: 'rgba(255, 255, 255, 1)',
                text: length.toFixed(2) + " kilometers",       // distance de la zone de recherche en kilométre
                xoffset: 50,
                yoffset: 10,
                font: {
                    // diffusion automatique en tant que police
                    size: 14,
                    family: "sans-serif"
                }
            };
        }












        /*********************************************************************
         * Interrogation spatiale de la vue de la couche d'entités des secteurs de recensement pour les statistiques
         * en utilisant le polygone tampon mis à jour.
         *********************************************************************/

        function queryLayerViewAgeStats(buffer) {
            // Stockage des données pour le graphique
            let femaleAgeData = [10,10],
                maleAgeData = [10,10];
                console.log(femaleAgeData);
                console.log(maleAgeData);

            // Requête spatiale côté client:
            // Obtenez une somme de groupes d'âge pour les secteurs de recensement qui coupent le tampon polygonal
            const query = featureLayerView.layer.createQuery();
            query.outStatistics = statDefinitions;
            query.geometry = buffer;

            // Recherchez les fonctionnalités sur le client à l'aide de FeatureLayerView.queryFeatures
            return featureLayerView
                .queryFeatures(query)
                .then(function (results) {
                    // La requête de statistiques renvoie une fonctionnalité avec «stats» comme attributs
                    const attributes = results.features[0].attributes;
                    // Parcourez les attributs et enregistrez les valeurs pour les utiliser dans la pyramide des âges.
                    for (var key in attributes) {
                        if (key.includes("FEM")) {
                            femaleAgeData.push(attributes[key]);
                        } else {
                            // Rendre l'ensemble de la population de tous les groupes d'âge masculins négatif afin que
                            // les données seront affichées à gauche du groupe d'âge des femmes
                            maleAgeData.push(-Math.abs(attributes[key]));
                        }
                    }
                    // Informations de retour, séparées par sexe
                    return [femaleAgeData, maleAgeData];
                })
                .catch(function (error) {
                    console.log(error);
                });
        }












        /***************************************************
         * Dessinez le polygone tampon lorsque l'application se charge ou
         * lorsque l'utilisateur recherche un nouvel emplacement
         **************************************************/
        
        function drawBufferPolygon() {
            // Lorsque pause () est appelée sur la poignée de surveillance, le rappel représenté par 
            // la montre n'est plus invoquée, mais est toujours disponible pour une utilisation ultérieure
            // cette poignée de montre sera reprise lorsque l'utilisateur cherchera un nouvel emplacement
            pausableWatchHandle.pause();

            // Emplacement initial pour le centre, le bord et les polylignes sur la vue
            const viewCenter = view.center.clone();
            const centerScreenPoint = view.toScreen(viewCenter);
            const centerPoint = view.toMap({
                x: centerScreenPoint.x + 120,
                y: centerScreenPoint.y - 120
            });
            const edgePoint = view.toMap({
                x: centerScreenPoint.x + 240,
                y: centerScreenPoint.y - 120
            });

            // Stocker les sommets mis à jour
            const vertices = [
                [centerPoint.x, centerPoint.y],
                [edgePoint.x, edgePoint.y]
            ];

            // Créez pour la première fois des graphiques au centre, aux bords, à la polyligne et au tampon
            if (!centerGraphic) {
                const polyline = new Polyline({
                    paths: vertices,
                    spatialReference: view.spatialReference
                });

                // obtenir la longueur de la polyligne initiale et créer un tampon
                const length = geometryEngine.geodesicLength(polyline, unit);
                const buffer = geometryEngine.geodesicBuffer(
                    centerPoint,
                    length,
                    unit
                );

                // Créez les graphiques représentant la ligne et le tampon
                const pointSymbol = {
                    type: "simple-marker",
                    style: "circle",
                    size: 10,
                    color: 'rgba(3, 102, 3, 1)'
                };
                centerGraphic = new Graphic({
                    geometry: centerPoint,
                    symbol: pointSymbol,
                    attributes: {
                        center: "center"
                    }
                });

                edgeGraphic = new Graphic({
                    geometry: edgePoint,
                    symbol: pointSymbol,
                    attributes: {
                        edge: "edge"
                    }
                });

                polylineGraphic = new Graphic({
                    geometry: polyline,
                    symbol: {
                        type: "simple-line",
                        color: 'rgba(3, 102, 3, 1)',
                        width: 2.5
                    }
                });

                bufferGraphic = new Graphic({
                    geometry: buffer,
                    symbol: {
                        type: "simple-fill",
                        color: 'rgba(0, 0, 0, 0.2)',
                        outline: {
                            color: "rgba(3, 102, 3, 1)",
                            width: 2
                        }
                    }
                });
                labelGraphic = labelLength(edgePoint, length);

                // Ajouter des graphiques au calque
                graphicsLayer.addMany([centerGraphic, edgeGraphic]);
                // une fois que les graphiques au centre et aux bords sont ajoutés au calque,
                // appeler la méthode de mise à jour de sketch passer dans les graphiques afin que les utilisateurs
                // peut simplement faire glisser ces graphiques pour ajuster le tampon
                setTimeout(function () {
                    sketchViewModel.update([edgeGraphic, centerGraphic], {
                        tool: "move"
                    });
                }, 1000);

                graphicsLayer2.addMany([
                    bufferGraphic,
                    polylineGraphic,
                    labelGraphic
                ]);
            }
            // Déplacer les graphiques du centre et des bords vers le nouvel emplacement renvoyé par la recherche
            else {
                centerGraphic.geometry = centerPoint;
                edgeGraphic.geometry = edgePoint;
            }

            // Fonctions de requête qui coupent le tampon
            calculateBuffer(vertices);
        }

        // Créer un diagramme de pyramide des âges pour les secteurs de recensement qui coupent le polygone tampon
        // Le graphique est créé à l'aide de la bibliothèque Chart.js
        // let chart;

        // function updateChart(newData) {
        //     chartExpand.expanded = true;

        //     const femaleAgeData = newData[0];
        //     const maleAgeData = newData[1];

        //     if (!chart) {
        //         // Obtenez l'élément canvas et rendez-y le graphique
        //         const canvasElement = document.getElementById("chart");

        //         chart = new Chart(canvasElement.getContext("2d"), {
        //             type: "horizontalBar",
        //             data: {
        //                 // les groupes d'âge
        //                 labels: ["85+","80-84","75-79","70-74","65-69","60-64","55-59","50-54","45-49","40-44","35-39","30-34","25-29","20-24","15-19","10-14","5-9","0-4"],
        //                 datasets: [
        //                     {
        //                         label: "Female",
        //                         backgroundColor: "#B266FF",
        //                         borderColor: "#7F00FF",
        //                         borderWidth: 0.25,
        //                         data: femaleAgeData
        //                     },
        //                     {
        //                         label: "Male",
        //                         backgroundColor: "#0080FF",
        //                         borderColor: "#004C99",
        //                         borderWidth: 0.25,
        //                         data: maleAgeData
        //                     }
        //                 ]
        //             },
        //             options: {
        //                 responsive: false,
        //                 legend: {
        //                     position: "bottom"
        //                 },
        //                 title: {
        //                     display: true,
        //                     text: "Population pyramid"
        //                 },
        //                 scales: {
        //                     yAxes: [
        //                         {
        //                             categorySpacing: 0,
        //                             barThickness: 10,
        //                             stacked: true,
        //                             scaleLabel: {
        //                                 display: true,
        //                                 labelString: "Age group"
        //                             }
        //                         }
        //                     ],
        //                     xAxes: [
        //                         {
        //                             ticks: {
        //                                 callback: function (value) {
        //                                     const val = Math.abs(parseInt(value));
        //                                     return numberWithCommas(val);
        //                                 }
        //                             },
        //                             scaleLabel: {
        //                                 display: true,
        //                                 labelString: "Population"
        //                             }
        //                         }
        //                     ]
        //                 },
        //                 tooltips: {
        //                     callbacks: {
        //                         label: function (tooltipItem, data) {
        //                             return (
        //                                 data.datasets[tooltipItem.datasetIndex].label +
        //                                 ": " +
        //                                 numberWithCommas(Math.abs(tooltipItem.xLabel))
        //                             );
        //                         }
        //                     }
        //                 }
        //             }
        //         });
        //     } else {
        //         chart.data.datasets[0].data = femaleAgeData;
        //         chart.data.datasets[1].data = maleAgeData;
        //         chart.update();
        //     }
        // }

        // Fonction d'assistance pour le formatage des étiquettes numériques avec des virgules
        function numberWithCommas(value) {
            value = value || 0;
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Étiqueter la polyligne avec sa longueur
        function labelLength(geom, length) {
            return new Graphic({
                geometry: geom,
                symbol: {
                    type: "text",
                    color: "#FFEB00",
                    text: length.toFixed(2) + " kilometers",
                    xoffset: 50,
                    yoffset: 10,
                    font: {
                        // diffusion automatique en tant que police
                        size: 14,
                        family: "sans-serif"
                    }
                }
            });
        }
        let input = document.getElementsByTagName('input')[0];
        
        console.log(input);
        imput.placeholder = 'Adresse de Dépard';
    
        // input.setAttribute('placeholder', 'Adresse de Dépard');
    });
    let inp = document.querySelectorAll('.esri-search_form > input').setAttribute('placeholder', 'Adresse de Dépard');
});