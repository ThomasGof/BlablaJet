document.addEventListener("DOMContentLoaded", function () {

    require([
        "esri/widgets/Sketch/SketchViewModel",
        "esri/geometry/Polyline",
        "esri/geometry/Point",
        "esri/Graphic",
        "esri/Map",
        "esri/views/MapView",
        "esri/views/SceneView",
        "esri/widgets/BasemapToggle",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/geometry/geometryEngine",
        "esri/widgets/Expand",
        // "esri/widgets/Legend",
        "esri/widgets/Search",
        "esri/core/watchUtils"
    ], function (
        SketchViewModel,
        Polyline,
        Point,
        Graphic,
        Map,
        MapView,
        SceneView,
        BasemapToggle,
        FeatureLayer,
        GraphicsLayer,
        geometryEngine,
        Expand,
        // Legend,
        Search,
        watchUtils
    ) {
        // App 'globals'  Application globale
        // Déclaration des variable
        let BDDzoneRecherche1, rechercheAdresse1;
        let BDDzoneRecherche2, rechercheAdresse2;
        let BDDtrajet1, BDDtrajet2;

        let pointcentre1,
            point1,
            line1,
            cercle1,
            centreFixer1,
            etiquette1;

        let pointcentre2,
            point2,
            line2,
            lineTrajet,
            cercle2,
            centreFixer2,
            etiquette2,
            etiquetteTrajet;

        let unit = "kilometers";

        // Créer des calques
        const graphicsLayer1 = new GraphicsLayer();
        const graphicsLayer2 = new GraphicsLayer();
        const graphicsLayer3 = new GraphicsLayer();
        const graphicsLayer4 = new GraphicsLayer();

        // const featureLayer = new FeatureLayer({
        //     portalItem: {
        //         id: "83c37666a059480bb8a7cb73f449ff52"
        //     },
        //     outFields: ["*"]
        // });
        // const featureLayer = new FeatureLayer({
        //     url:
        //         "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0",
        //     outFields: ["*"],
        //     popupEnabled: false,
        //     id: "incidentsLayer"

        // });
        const featureLayer = new FeatureLayer({
            // create an instance of esri/layers/support/Field for each field object
            title: "National Monuments",
            fields: [
                {
                    name: "ObjectID",
                    alias: "ObjectID",
                    type: "oid"
                },
                {
                    name: "Name",
                    alias: "Name",
                    type: "string"
                },
                {
                    name: "Type",
                    alias: "Type",
                    type: "string"
                }
            ],
            objectIdField: "ObjectID",
            geometryType: "point",
            spatialReference: { wkid: 4326 },
            source: [], // adding an empty feature collection
            renderer: {
                type: "simple",
                symbol: {
                    type: "web-style", // autocasts as new WebStyleSymbol()
                    styleName: "Esri2DPointSymbolsStyle",
                    name: "landmark"
                }
            },
            popupTemplate: {
                title: "{Name}"
            }
        });

        // Créer des map
        const map = new Map({
            // basemap: "dark-gray",
            basemap: "topo-vector",
            // basemap: "streets",
            ground: "world-elevation",
            layers: [featureLayer, graphicsLayer2, graphicsLayer1, graphicsLayer3, graphicsLayer4]
        });

        // Créer des view (vue sur le map)

        // const view = new MapView({
        //     container: "viewDiv",
        //     map: map,
        //     zoom: 7,
        //     center: [1.0000, 48.0000],
        //     constraints: {
        //         maxScale: 200000,
        //         minScale: 40000000
        //     }
        // }); 
        const view = new SceneView({
            container: "viewDiv",
            map: map,
            zoom: 7,
            center: [1.0000, 48.0000]
        });


        var toggle = new BasemapToggle({
            view: view,
            nextBasemap: "hybrid"
        });
        view.ui.add(toggle, "bottom-right");


        const statDefinitions1 = [
            // "FEM85C10","FEM80C10","FEM75C10","FEM70C10","FEM65C10","FEM60C10","FEM55C10","FEM50C10","FEM45C10",
            // "FEM40C10","FEM35C10","FEM30C10","FEM25C10","FEM20C10","FEM15C10","FEM10C10","FEM5C10","FEM0C10",
            // "MALE85C10","MALE80C10","MALE75C10","MALE70C10","MALE65C10","MALE60C10","MALE55C10","MALE50C10","MALE45C10",
            // "MALE40C10","MALE35C10","MALE30C10","MALE25C10","MALE20C10","MALE15C10","MALE10C10","MALE5C10","MALE0C10"
        ]
        // .map(function (fieldName) {
        //         return {
        //             onStatisticField: fieldName,
        //             outStatisticFieldName: fieldName + "_TOTAL",
        //             statisticType: "sum"
        //         };
        //     });
        console.log(statDefinitions1);

        const statDefinitions2 = [
            // "FEM85C10","FEM80C10","FEM75C10","FEM70C10","FEM65C10","FEM60C10","FEM55C10","FEM50C10","FEM45C10",
            // "FEM40C10","FEM35C10","FEM30C10","FEM25C10","FEM20C10","FEM15C10","FEM10C10","FEM5C10","FEM0C10",
            // "MALE85C10","MALE80C10","MALE75C10","MALE70C10","MALE65C10","MALE60C10","MALE55C10","MALE50C10","MALE45C10",
            // "MALE40C10","MALE35C10","MALE30C10","MALE25C10","MALE20C10","MALE15C10","MALE10C10","MALE5C10","MALE0C10"
        ]
        // .map(function (fieldName) {
        //         return {
        //             onStatisticField: fieldName,
        //             outStatisticFieldName: fieldName + "_TOTAL",
        //             statisticType: "sum"
        //         };
        //     });

        // Update UI (Mise à jour de UI(user interface(interface utilisateur)))
        setUpAppUI1();
        setUpAppUI2();
        setUpSketch1();
        setUpSketch2();

        function setUpAppUI1() {
            // Lorsque la couche est chargée, créez un observateur pour déclencher le dessin du polygone tampon
            view.whenLayerView(featureLayer).then(function (layerView) {
                BDDtrajet1 = layerView;

                rechercheAdresse1 = watchUtils.pausable(
                    layerView,
                    "updating",
                    function (val) {
                        if (!val) {
                            drawBufferPolygon1();
                        }
                    }
                );
            });
            view.when(function () {
                chartExpand = new Expand({
                    expandIconClass: "esri-icon-chart",
                    expanded: false,
                    view: view,
                    content: document.getElementById("chartPanel")
                });

                const searchDepard = new Search({
                    view: view,
                    resultGraphicEnabled: false,
                    popupEnabled: false
                });

                // Reprendre la fonction drawBufferPolygon (); l'utilisateur a recherché un nouvel emplacement et
                // doit mettre à jour le polygone tampon et réexécuter la requête de statistiques
                searchDepard.on("search-complete", function () {
                    rechercheAdresse1.resume();
                });

                // Ajouter nos composants à l'interface utilisateur
                view.ui.add(chartExpand, "bottom-left");
                view.ui.add(searchDepard, "top-right");
            });
        }
        function setUpAppUI2() {
            view.whenLayerView(featureLayer).then(function (layerView) {
                BDDtrajet2 = layerView;

                rechercheAdresse2 = watchUtils.pausable(
                    layerView,
                    "updating",
                    function (val) {
                        if (!val) {
                            drawBufferPolygon2();
                        }
                    }
                );
            });
            view.when(function () {
                const searchArriver = new Search({
                    view: view,
                    resultGraphicEnabled: false,
                    popupEnabled: false
                });
                searchArriver.on("search-complete", function () {
                    rechercheAdresse2.resume();
                });

                view.ui.add(searchArriver, "top-right");
            });
        }










        /*****************************************************************
         * Créer BDDzoneRecherche et câbler des écouteurs d'événements
         *****************************************************************/

        function setUpSketch1() {
            BDDzoneRecherche1 = new SketchViewModel({
                view: view,
                layer: graphicsLayer1
            });

            // Écoutez l'événement de mise à jour de BDDzoneRecherche afin que le graphique de la pyramide des âges
            // soie actulaliser lorsque les graphiques sont mis à jour
            BDDzoneRecherche1.on("update", onMove1);
        }
        function setUpSketch2() {
            BDDzoneRecherche2 = new SketchViewModel({
                view: view,
                layer: graphicsLayer2,
            });

            // Écoutez l'événement de mise à jour de BDDzoneRecherche afin que le graphique de la pyramide des âges
            // soie actulaliser lorsque les graphiques sont mis à jour
            BDDzoneRecherche2.on("update", onMove2);
        }










        /*********************************************************************
         * Les graphiques de bord ou de centre sont déplacés. Recalculez le tampon avec
         * informations de géométrie mises à jour et réexécutez les statistiques de requête.
         *********************************************************************/

        function onMove1(event) {
            // Si le graphique de bord se déplace, conservez le graphique central
            // à son emplacement initial. Déplacer uniquement le graphique du bord
            if (event.toolEventInfo && event.toolEventInfo.mover.attributes.edge) {

                const toolType = event.toolEventInfo.type;
                if (toolType === "move-start") {
                    centreFixer1 = pointcentre1.geometry;
                }
                // garder le graphique central à son emplacement initial lorsque le point de bord se déplace
                else if (toolType === "move" || toolType === "move-stop") {
                    pointcentre1.geometry = centreFixer1;
                }
            }

            // le graphique du centre ou du bord est déplacé, recalculez le tampon
            const vertices1 = [
                [pointcentre1.geometry.x, pointcentre1.geometry.y],
                [point1.geometry.x, point1.geometry.y]
            ];
            // console.log(vertices1);

            // requête de statistiques côté client des fonctionnalités qui coupent le tampon
            calculateBuffer1(vertices1);

            // l'utilisateur clique sur la vue ... méthode de mise à jour des appels avec les graphiques du centre et des bords
            if (event.state === "cancel" || event.state === "complete") {
                BDDzoneRecherche1.update([point1, pointcentre1], {
                    tool: "move"
                });
            }
        }
        function onMove2(event) {
            // Si le graphique de bord se déplace, conservez le graphique central
            // à son emplacement initial. Déplacer uniquement le graphique du bord
            if (event.toolEventInfo && event.toolEventInfo.mover.attributes.edge) {

                const toolType = event.toolEventInfo.type;
                if (toolType === "move-start") {
                    centreFixer2 = pointcentre2.geometry;
                }
                // garder le graphique central à son emplacement initial lorsque le point de bord se déplace
                else if (toolType === "move" || toolType === "move-stop") {
                    pointcentre2.geometry = centreFixer2;
                }
            }
            // le graphique du centre ou du bord est déplacé, recalculez le tampon
            const vertices2 = [
                [pointcentre2.geometry.x, pointcentre2.geometry.y],
                [point2.geometry.x, point2.geometry.y]
            ];
            const verticesTrajet = [
                [pointcentre1.geometry.x, pointcentre1.geometry.y],
                [pointcentre2.geometry.x, pointcentre2.geometry.y]
            ];

            // requête de statistiques côté client des fonctionnalités qui coupent le tampon
            calculateBuffer2(vertices2);
            calculateBufferTrajet(verticesTrajet);

            // l'utilisateur clique sur la vue ... méthode de mise à jour des appels avec les graphiques du centre et des bords
            if (event.state === "cancel" || event.state === "complete") {
                BDDzoneRecherche2.update([point2, pointcentre2], {
                    tool: "move"
                });
            }
        }













        /*********************************************************************
         * Le bord ou le point central est en cours de mise à jour. Recalculez le tampon avec
         * informations de géométrie mises à jour.
         *********************************************************************/

        function calculateBuffer1(vertices1) {
            // Mettre à jour la géométrie de la polyligne en fonction de l'emplacement des bords et des points centraux
            line1.geometry = new Polyline({
                paths: vertices1,
                spatialReference: view.spatialReference
            });

            // Recalculez la longueur de la polyligne et le polygone tampon
            const length1 = geometryEngine.geodesicLength(
                line1.geometry,
                unit
            );
            const buffer1 = geometryEngine.geodesicBuffer(
                pointcentre1.geometry,
                length1,
                unit
            );

            // Mettre à jour le cercle1
            cercle1.geometry = buffer1;

            // Recherchez les tranches d'âge des femmes et des hommes des secteurs de recensement qui se croisent
            // le polygone tampon sur le client
            queryLayerViewAgeStats1(buffer1).then(function (newData) {
                // Créer un diagramme de pyramide des âges à partir du résultat renvoyé
                updateChart(newData);
            });

            // Mettre à jour le graphique de l'étiquette pour afficher la longueur de la polyligne
            etiquette1.geometry = point1.geometry;
            etiquette1.symbol = {
                type: "text",
                color: 'rgba(0, 0, 0, 1)',
                text: length1.toFixed(2) + " kilometers \n Zone de recherche",       // distance de la zone de recherche en kilométre
                xoffset: 50,
                yoffset: 10,
                font: {
                    // diffusion automatique en tant que police
                    size: 14,
                    family: "sans-serif"
                }
            };
        }

        function calculateBuffer2(vertices2) {
            // Mettre à jour la géométrie de la polyligne en fonction de l'emplacement des bords et des points centraux
            line2.geometry = new Polyline({
                paths: vertices2,
                spatialReference: view.spatialReference
            });

            // Recalculez la longueur de la polyligne et le polygone tampon
            const length2 = geometryEngine.geodesicLength(
                line2.geometry,
                unit
            );
            const buffer2 = geometryEngine.geodesicBuffer(
                pointcentre2.geometry,
                length2,
                unit
            );

            // Mettre à jour le cercle1
            cercle2.geometry = buffer2;

            // Recherchez les tranches d'âge des femmes et des hommes des secteurs de recensement qui se croisent
            // le polygone tampon sur le client
            queryLayerViewAgeStats2(buffer2).then(function (newData) {
                // Créer un diagramme de pyramide des âges à partir du résultat renvoyé
                updateChart(newData);
            });

            // Mettre à jour le graphique de l'étiquette pour afficher la longueur de la polyligne
            etiquette2.geometry = point2.geometry;
            etiquette2.symbol = {
                type: "text",
                color: 'rgba(0, 0, 0, 1)',
                text: length2.toFixed(2) + " kilometers \n Zone de recherche",       // distance de la zone de recherche en kilométre
                xoffset: 50,
                yoffset: 10,
                font: {
                    // diffusion automatique en tant que police
                    size: 14,
                    family: "sans-serif"
                }
            };
        }

        function calculateBufferTrajet(verticesTrajet) {
            // Mettre à jour la géométrie de la polyligne en fonction de l'emplacement des bords et des points centraux
            lineTrajet.geometry = new Polyline({
                paths: verticesTrajet,
                spatialReference: view.spatialReference
            });

            // Recalculez la longueur de la polyligne et le polygone tampon
            const lengthTrajet = geometryEngine.geodesicLength(
                lineTrajet.geometry,
                unit
            );

            // Mettre à jour le graphique de l'étiquette pour afficher la longueur de la polyligne
            etiquetteTrajet.geometry = pointcentre2.geometry;
            etiquetteTrajet.symbol = {
                type: "text",
                color: 'rgba(220, 0, 0, 1)',
                text: 'Distance :\n' + lengthTrajet.toFixed(2) + " kilometers",       // distance de la zone de recherche en kilométre
                xoffset: 50,
                yoffset: -20,
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

        function queryLayerViewAgeStats1(buffer1) {
            // Stockage des données pour le graphique
            let femaleAgeData1 = ['nb de point de depard', 0],
                maleAgeData1 = ['nb de point d arriver', 0];
            console.log(femaleAgeData1);
            console.log(maleAgeData1);

            // Requête spatiale côté client:
            // Obtenez une somme de groupes d'âge pour les secteurs de recensement qui coupent le tampon polygonal
            const query = BDDtrajet1.layer.createQuery();
            query.outStatistics = statDefinitions1;
            query.geometry = buffer1;

            // Recherchez les fonctionnalités sur le client à l'aide de BDDtrajet.queryFeatures
            return BDDtrajet1
                .queryFeatures(query)
                .then(function (results) {
                    // La requête de statistiques renvoie une fonctionnalité avec «stats» comme attributs
                    const attributes = results.features[0].attributes;
                    // Parcourez les attributs et enregistrez les valeurs pour les utiliser dans la pyramide des âges.
                    for (var key in attributes) {
                        if (key.includes("FEM")) {
                            femaleAgeData1.push(attributes[key]);
                        } else {
                            // Rendre l'ensemble de la population de tous les groupes d'âge masculins négatif afin que
                            // les données seront affichées à gauche du groupe d'âge des femmes
                            maleAgeData1.push(-Math.abs(attributes[key]));
                        }
                    }
                    // Informations de retour, séparées par sexe
                    return [femaleAgeData1, maleAgeData1];
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        function queryLayerViewAgeStats2(buffer2) {
            // Stockage des données pour le graphique
            let femaleAgeData2 = ['nb de point de depard', 0],
                maleAgeData2 = ['nb de point d arriver', 0];
            console.log(femaleAgeData2);
            console.log(maleAgeData2);

            // Requête spatiale côté client:
            // Obtenez une somme de groupes d'âge pour les secteurs de recensement qui coupent le tampon polygonal
            const query = BDDtrajet2.layer.createQuery();
            query.outStatistics = statDefinitions2;
            query.geometry = buffer2;

            // Recherchez les fonctionnalités sur le client à l'aide de BDDtrajet.queryFeatures
            return BDDtrajet2
                .queryFeatures(query)
                .then(function (results) {
                    // La requête de statistiques renvoie une fonctionnalité avec «stats» comme attributs
                    const attributes = results.features[0].attributes;
                    // Parcourez les attributs et enregistrez les valeurs pour les utiliser dans la pyramide des âges.
                    for (var key in attributes) {
                        if (key.includes("FEM")) {
                            femaleAgeData2.push(attributes[key]);
                        } else {
                            // Rendre l'ensemble de la population de tous les groupes d'âge masculins négatif afin que
                            // les données seront affichées à gauche du groupe d'âge des femmes
                            maleAgeData2.push(-Math.abs(attributes[key]));
                        }
                    }
                    // Informations de retour, séparées par sexe
                    return [femaleAgeData2, maleAgeData2];
                })
                .catch(function (error) {
                    console.log(error);
                });
        }












        /***************************************************
         * Dessinez le polygone tampon lorsque l'application se charge ou
         * lorsque l'utilisateur recherche un nouvel emplacement
         **************************************************/

        function drawBufferPolygon1() {
            // Lorsque pause () est appelée sur la poignée de surveillance, le rappel représenté par 
            // la montre n'est plus invoquée, mais est toujours disponible pour une utilisation ultérieure
            // cette poignée de montre sera reprise lorsque l'utilisateur cherchera un nouvel emplacement
            rechercheAdresse1.pause();

            // Emplacement initial pour le centre, le bord et les polylignes sur la vue
            const viewCenter1 = view.center.clone();
            const centerScreenPoint1 = view.toScreen(viewCenter1);
            const centerPoint1 = view.toMap({
                x: centerScreenPoint1.x + 00,
                y: centerScreenPoint1.y - 00
            });
            const edgePoint1 = view.toMap({
                x: centerScreenPoint1.x + 450,
                y: centerScreenPoint1.y - 225
            });

            // Stocker les sommets mis à jour
            const vertices1 = [
                [centerPoint1.x, centerPoint1.y],
                [edgePoint1.x, edgePoint1.y]
            ];

            // Créez pour la première fois des graphiques au centre, aux bords, à la polyligne et au tampon
            if (!pointcentre1) {
                const polyline1 = new Polyline({
                    paths: vertices1,
                    spatialReference: view.spatialReference
                });

                // obtenir la longueur de la polyligne initiale et créer un tampon
                const length1 = geometryEngine.geodesicLength(polyline1, unit);
                const buffer1 = geometryEngine.geodesicBuffer(
                    centerPoint1,
                    length1,
                    unit
                );

                // Créez les graphiques représentant la ligne et le tampon
                const pointSymbol1 = {
                    type: "simple-marker",
                    style: "circle",
                    size: 10,
                    color: 'rgba(3, 102, 3, 1)'
                };
                pointcentre1 = new Graphic({
                    geometry: centerPoint1,
                    symbol: pointSymbol1,
                    attributes: {
                        center: "center"
                    }
                });

                point1 = new Graphic({
                    geometry: edgePoint1,
                    symbol: pointSymbol1,
                    attributes: {
                        edge: "edge"
                    }
                });

                line1 = new Graphic({
                    geometry: polyline1,
                    symbol: {
                        type: "simple-line",
                        color: 'rgba(3, 102, 3, 1)',
                        width: 2.5
                    }
                });

                cercle1 = new Graphic({
                    geometry: buffer1,
                    symbol: {
                        type: "simple-fill",
                        color: 'rgba(255, 255, 255, 0.2)',
                        outline: {
                            color: "rgba(3, 102, 3, 1)",
                            width: 2
                        }
                    }
                });
                etiquette1 = labelLength(edgePoint1, length1);


            }
            // Déplacer les graphiques du centre et des bords vers le nouvel emplacement renvoyé par la recherche
            else {
                // Ajouter des graphiques au calque
                graphicsLayer1.addMany([pointcentre1, point1]);
                // une fois que les graphiques au centre et aux bords sont ajoutés au calque,
                // appeler la méthode de mise à jour de sketch passer dans les graphiques afin que les utilisateurs
                // peut simplement faire glisser ces graphiques pour ajuster le tampon
                setTimeout(function () {
                    BDDzoneRecherche1.update([point1, pointcentre1], {
                        tool: "move"
                    });
                }, 1000);

                graphicsLayer1.addMany([
                    cercle1,
                    line1,
                    etiquette1
                ]);
                pointcentre1.geometry = centerPoint1;
                point1.geometry = edgePoint1;
            }

            // Fonctions de requête qui coupent le tampon
            calculateBuffer1(vertices1);
        }
        function drawBufferPolygon2() {
            // Lorsque pause () est appelée sur la poignée de surveillance, le rappel représenté par 
            // la montre n'est plus invoquée, mais est toujours disponible pour une utilisation ultérieure
            // cette poignée de montre sera reprise lorsque l'utilisateur cherchera un nouvel emplacement
            rechercheAdresse2.pause();

            // Emplacement initial pour le centre, le bord et les polylignes sur la vue
            const viewCenter2 = view.center.clone();
            const centerScreenPoint2 = view.toScreen(viewCenter2);
            const centerPoint2 = view.toMap({
                x: centerScreenPoint2.x + 00,
                y: centerScreenPoint2.y - 00
            });
            const edgePoint2 = view.toMap({
                x: centerScreenPoint2.x + 450,
                y: centerScreenPoint2.y - 225
            });

            // Stocker les sommets mis à jour
            const vertices2 = [
                [centerPoint2.x, centerPoint2.y],
                [edgePoint2.x, edgePoint2.y]
            ];
            const verticesTrajet = [
                [centerPoint2.x, centerPoint2.y],
                [centerPoint2.x, centerPoint2.y]
            ];

            // Créez pour la première fois des graphiques au centre, aux bords, à la polyligne et au tampon
            if (!pointcentre2) {
                const polyline2 = new Polyline({
                    paths: vertices2,
                    spatialReference: view.spatialReference
                });
                const polylineTrajet = new Polyline({
                    paths: verticesTrajet,
                    spatialReference: view.spatialReference
                });

                // obtenir la longueur de la polyligne initiale et créer un tampon
                const length2 = geometryEngine.geodesicLength(polyline2, unit);
                const lengthTrajet = geometryEngine.geodesicLength(polylineTrajet, unit);
                const buffer2 = geometryEngine.geodesicBuffer(
                    centerPoint2,
                    length2,
                    unit
                );

                // Créez les graphiques représentant la ligne et le tampon
                const pointSymbol2 = {
                    type: "simple-marker",
                    style: "circle",
                    size: 10,
                    color: 'rgba(80, 20, 2, 0.8)'
                };
                pointcentre2 = new Graphic({
                    geometry: centerPoint2,
                    symbol: pointSymbol2,
                    attributes: {
                        center: "center"
                    }
                });

                point2 = new Graphic({
                    geometry: edgePoint2,
                    symbol: pointSymbol2,
                    attributes: {
                        edge: "edge"
                    }
                });

                line2 = new Graphic({
                    geometry: polyline2,
                    symbol: {
                        type: "simple-line",
                        color: 'rgba(80, 20, 2, 0.8)',
                        width: 2.5
                    }
                });

                cercle2 = new Graphic({
                    geometry: buffer2,
                    symbol: {
                        type: "simple-fill",
                        color: 'rgba(0, 0, 0, 0.2)',
                        outline: {
                            color: "rgba(80, 20, 2, 0.8)",
                            width: 2
                        }
                    }
                });
                lineTrajet = new Graphic({
                    geometry: polylineTrajet,
                    symbol: {
                        type: "simple-line",
                        color: 'rgba(80, 20, 2, 0.8)',
                        width: 2.5
                    }
                });

                etiquetteTrajet = labelLength(centreFixer1, lengthTrajet);
                etiquette2 = labelLength(edgePoint2, length2);

            }
            // Déplacer les graphiques du centre et des bords vers le nouvel emplacement renvoyé par la recherche
            else {
                // Ajouter des graphiques au calque
                graphicsLayer2.addMany([pointcentre2, point2]);
                // une fois que les graphiques au centre et aux bords sont ajoutés au calque,
                // appeler la méthode de mise à jour de sketch passer dans les graphiques afin que les utilisateurs
                // peut simplement faire glisser ces graphiques pour ajuster le tampon
                setTimeout(function () {
                    BDDzoneRecherche2.update([point2, pointcentre2], {
                        tool: "move"
                    });
                }, 1000);

                graphicsLayer2.addMany([
                    cercle2,
                    line2,
                    lineTrajet,
                    etiquetteTrajet,
                    etiquette2
                ]);
                pointcentre2.geometry = centerPoint2;
                point2.geometry = edgePoint2;
            }

            // Fonctions de requête qui coupent le tampon
            calculateBuffer2(vertices2);
            calculateBufferTrajet(verticesTrajet)
        }









        // Fonction d'assistance pour le formatage des étiquettes numériques avec des virgules
        function numberWithCommas(value) {
            value = value || 0;
            return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        // Étiqueter la polyligne avec sa longueur
        function labelLength(geom, length1) {
            return new Graphic({
                geometry: geom,
                symbol: {
                    type: "text",
                    color: "#FFEB00",
                    text: length1.toFixed(2) + " kilometers \n Zone de recherche",
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
        function labelLength(geom, length2) {
            return new Graphic({
                geometry: geom,
                symbol: {
                    type: "text",
                    color: "#FFEB00",
                    text: length2.toFixed(2) + " kilometers \n Zone de recherche",
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
        function labelLength(geom, lengthTrajet) {
            return new Graphic({
                geometry: geom,
                symbol: {
                    type: "text",
                    color: "#FFEB00",
                    text: lengthTrajet.toFixed(2) + " kilometers \n Trajet",
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














        /*********************************************************************
         * Ajouter des points à la BDD futureLayer avec la fonction() addFeatures
         * et la éditer sur la carte avec la boucle for
         *********************************************************************/

        // fires when "Add Features" button is clicked
        function addFeatures() {
            // data to be added to the map
            const data = [
                {
                    LATITUDE: 48.0000,
                    LONGITUDE: 1.0000,
                    TYPE: "National Monument",
                    NAME: "Cabrillo National Monument"
                },
                {
                    LATITUDE: 48.8534,
                    LONGITUDE: 2.3488,
                    TYPE: "National Monument",
                    NAME: "Cesar E. Chavez National Monument"
                },
                {
                    LATITUDE: 48.2000,
                    LONGITUDE: 2.8000,
                    TYPE: "National Monument",
                    NAME: "Devils Postpile National Monument"
                },
                // {
                //   LATITUDE: 35.2915,
                //   LONGITUDE: -115.0935,
                //   TYPE: "National Monument",
                //   NAME: "Castle Mountains National Monument"
                // },
                // {
                //   LATITUDE: 41.7588,
                //   LONGITUDE: -121.5267,
                //   TYPE: "National Monument",
                //   NAME: "Lava Beds National Monument"
                // },
                // {
                //   LATITUDE: 37.897,
                //   LONGITUDE: -122.5811,
                //   TYPE: "National Monument",
                //   NAME: "Muir Woods National Monument"
                // },
                // {
                //   LATITUDE: 41.8868,
                //   LONGITUDE: -121.3717,
                //   TYPE: "National Monument",
                //   NAME: "Tule Lake National Monument"
                // }
            ];

            // create an array of graphics based on the data above
            var graphics = [];
            var graphic;
            for (var i = 0; i < data.length; i++) {
                graphic = new Graphic({
                    geometry: {
                        type: "point",
                        latitude: data[i].LATITUDE,
                        longitude: data[i].LONGITUDE
                    },
                    attributes: data[i]
                });
                graphics.push(graphic);
            }

            // addEdits object tells applyEdits that you want to add the features
            const addEdits = {
                addFeatures: graphics
            };

            // apply the edits to the layer
            applyEditsToLayer(addEdits);
        }









        /*********************************************************************
        * Supprimer la BDD futureLayer avec la fonction() removeFeatures
        *********************************************************************/

        // fires when "Remove Features" button clicked
        function removeFeatures() {
            // query for the features you want to remove
            featureLayer.queryFeatures().then(function (results) {
                // edits object tells apply edits that you want to delete the features
                const deleteEdits = {
                    deleteFeatures: results.features
                };
                // apply edits to the layer
                applyEditsToLayer(deleteEdits);
            });
        }









        function applyEditsToLayer(edits) {
            featureLayer
                .applyEdits(edits)
                .then(function (results) {
                    // if edits were removed
                    if (results.deleteFeatureResults.length > 0) {
                        console.log(
                            results.deleteFeatureResults.length,
                            "features have been removed"
                        );
                        addBtn.disabled = false;
                        removeBtn.disabled = true;
                    }
                    // if features were added - call queryFeatures to return
                    //    newly added graphics
                    if (results.addFeatureResults.length > 0) {
                        var objectIds = [];
                        results.addFeatureResults.forEach(function (item) {
                            objectIds.push(item.objectId);
                        });
                        // query the newly added features from the layer
                        featureLayer
                            .queryFeatures({
                                objectIds: objectIds
                            })
                            .then(function (results) {
                                console.log(
                                    results.features.length,
                                    "features have been added."
                                );
                                addBtn.disabled = true;
                                removeBtn.disabled = false;
                            });
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        }


        let search = document.getElementById('search');

        k = 0;
        search.addEventListener("click", function () {

            if (k === 0) {
                addFeatures();
                k++;
            } else if (k === 1) {
                removeFeatures();
                k = 0;
            }
        });
    });

























    let inputD = document.getElementsByClassName('esri-input esri-search__input')[0];
    let inputA = document.getElementsByClassName('esri-input esri-search__input')[1];
    // console.log(inputDepardContainer);
    // let inputDepard = document.createElement("input");
    // inputDepard.setAttribute('placeholder', 'Adresse de Dépard');
    // inputDepardContainer.innerHTML = inputDepard;

    let adresseD = document.getElementById('adresseD');
    let adresseA = document.getElementById('adresseA');

    let z = 0;
    adresseD.addEventListener("click", function () {
        adresseD.style.display = 'none';
        adresseA.style.display = 'none';
    });
    adresseA.addEventListener("click", function () {
        alert('Remplisez dabord le lieu de dépard');
    });

    const anim0 = gsap.from("#head", { duration: 3.5, opacity: 0, x: "random(3000,4000)", y: "random(1500,2500)", scale: 0.3, stagger: 0.5, paused: true });
    const anim1 = gsap.from("#nav", { duration: 2.5, opacity: 0, x: "-1000", stagger: 0.5, paused: true });
    const anim2 = gsap.from("#adresseD", { duration: 4, opacity: 0, paused: true });
    const anim3 = gsap.from("#adresseA", { duration: 4, opacity: 0, paused: true });
    const anim4 = gsap.from("#search", { duration: 4, opacity: 0, paused: true });
    anim0.play();
    setTimeout(() => {
        anim1.play();
        anim2.play();
        anim3.play();
        anim4.play();
    }, 3500);

    setTimeout(() => {
        document.getElementsByClassName('esri-widget--button')[4].click();
        // document.getElementsByClassName('esri-widget--button')[4].click();
    }, 6000);

    let search = document.getElementById('search');
    let nav = document.getElementById('nav');

    search.addEventListener('mouseenter', function () {
        search.style.transition = '1s';
        search.style.top = '-9vh';
    })
    nav.addEventListener('mouseenter', function () {
        search.style.transition = '1s';
        search.style.top = '0';
        adresseD.style.display = 'flex';
        adresseA.style.display = 'flex';
    })


});