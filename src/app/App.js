define([
    'agrc/widgets/locate/FindAddress',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMap',

    'app/config',
    'app/Identify',

    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom',
    'dojo/dom-style',
    'dojo/on',
    'dojo/text!app/templates/App.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'esri/dijit/Print',
    'esri/geometry/Extent',

    'ijit/widgets/layout/SideBarToggler',

    'layer-selector'
], function (
    FindAddress,
    MagicZoom,
    BaseMap,

    config,
    Identify,

    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    dom,
    domStyle,
    on,
    template,
    array,
    declare,
    lang,

    Print,
    Extent,

    SideBarToggler,

    BaseMapSelector
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // childWidgets: Object[]
        //      container for holding custom child widgets
        childWidgets: null,

        // map: agrc.widgets.map.Basemap
        map: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.info('app.App::constructor', arguments);

            config.app = this;
            this.childWidgets = [];

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app.App::postCreate', arguments);

            // set version number
            this.version.innerHTML = config.version;

            this.initMap();

            this.childWidgets.push(
                new SideBarToggler({
                    sidebar: this.sideBar,
                    map: this.map,
                    centerContainer: this.centerContainer
                }, this.sidebarToggle),
                new FindAddress({
                    map: this.map,
                    apiKey: config.apiKey,
                    zoomLevel: 17,
                    wkid: 3857
                }, this.geocodeNode),
                new MagicZoom({
                    map: this.map,
                    apiKey: config.apiKey,
                    wkid: 3857,
                    searchField: 'NAME',
                    placeHolder: 'place name...',
                    maxResultsToDisplay: 10,
                    'class': 'first'
                }, this.gnisNode),
                new MagicZoom({
                    map: this.map,
                    apiKey: config.apiKey,
                    searchLayer: 'SGID10.Boundaries.Municipalities',
                    searchField: 'NAME',
                    placeHolder: 'city name...',
                    wkid: 3857,
                    maxResultsToDisplay: 10
                }, this.cityNode),
                this.printer = new Print({
                    map: this.map,
                    url: config.exportWebMapUrl,
                    templates: [{
                        label: 'Portrait (PDF)',
                        format: 'PDF',
                        layout: 'Letter ANSI A Portrait',
                        options: {
                            legendLayers: []
                        }
                    }, {
                        label: 'Landscape (PDF)',
                        format: 'PDF',
                        layout: 'Letter ANSI A Landscape',
                        options: {
                            legendLayers: []
                        }
                    }]
                }, this.printDiv)
            );

            this.inherited(arguments);

            this.setupConnections();
        },
        setupConnections: function () {
            // summary:
            //      Fires when
            console.log('app.App::setupConnections', arguments);

            on.once(this.egg, 'dblclick', lang.hitch(this, 'showLevel'));
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app.App::startup', arguments);

            var that = this;
            array.forEach(this.childWidgets, function (widget) {
                console.log(widget.declaredClass);
                that.own(widget);
                widget.startup();
            });

            this.printer.on('print-complete', function () {
                domStyle.set(that.popupBlockerBlurb, 'display', 'block');
            });

            this.inherited(arguments);
        },
        showLevel: function () {
            // summary:
            //      shows the current map level
            console.log('app.App::showLevel', arguments);

            var parent = this.egg.parentNode;

            var node = document.createElement('span');
            node.setAttribute('class', 'version');
            node.setAttribute('style', 'padding-right:15px;margin-left:-43px;');
            node.innerHTML = 'level: ' + this.map.getLevel() + ' ';

            parent.insertBefore(node, this.egg.nextSibling);

            this.map.on('extent-change', function _showLevel(changeEvt) {
                node.innerHTML = 'level: ' + changeEvt.lod.level + ' ';
            });
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.info('app.App::initMap', arguments);

            this.map = new BaseMap(this.mapDiv, {
                useDefaultBaseMap: false,
                showAttribution: false,
                extent: new Extent({
                    xmax: -12010849.397533866,
                    xmin: -12898741.918094235,
                    ymax: 5224652.298632992,
                    ymin: 4422369.249751998,
                    spatialReference: {
                        wkid: 3857
                    }
                })
            });

            this.childWidgets.push(
                new BaseMapSelector({
                    map: this.map,
                    quadWord: config.quadWord,
                    baseLayers: ['Hybrid', 'Lite', 'Terrain', 'Topo', 'Color IR']
                }),
                new Identify({map: this.map})
            );
        }
    });
});
