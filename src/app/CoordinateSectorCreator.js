define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/_base/declare',
    'dojo/query',
    'dojo/number',
    'dojo/_base/event',
    'dojo/on',
    'dojo/dom-attr',
    'dojo/dom-class',
    'dojo/text!app/templates/CoordinateSectorCreator.html',

    'esri/geometry/Point',
    'esri/SpatialReference'
], function (
    _TemplatedMixin,
    _WidgetBase,

    declare,
    query,
    number,
    events,
    on,
    domAttr,
    domClass,
    template,

    Point,
    SpatialReference
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Creates circle sectors from coordinates.
        templateString: template,
        baseClass: 'coordinate-sector-creator',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app.CoordinateSectorCreator::postCreate', arguments);

            this.setupConnections();

            this.inherited(arguments);
        },
        zoom: function () {
            // summary:
            //      zooms the map to the point created by _getPoint
            //  summary:
            //      the point created by the user input or returned by
            //      the geometry service
            console.log('agrc.widgets.locate.ZoomToCoords::zoom', arguments);
            console.log(this.map.spatialReference.wkid);

            if (!this.map) {
                throw 'This widget requires an esri/map to be useful.';
            }

            // disable zoom button
            domClass.add(this.zoomNode, 'disabled');
            domAttr.set(this.zoomNode, 'disabled', true);

            // reset errors
            domClass.remove(this.errorNode, ['alert', 'alert-danger', 'text-center']);
            this.errorNode.innerHTML = '';

            var point = this._getPoint();

            if (point.spatialReference.wkid === this.map.spatialReference.wkid) {
                this.map.centerAndZoom(point, this.zoomLevel);

                this.emit('zoom', {
                    bubbles: true,
                    cancelable: true,
                    point: point
                });

                // enable zoom button
                domClass.remove(this.zoomNode, 'disabled');
                domAttr.remove(this.zoomNode, 'disabled');

                return;
            }

            this._geometryService.project([point], this.map.spatialReference);
        },
        setupConnections: function () {
            // summary:
            //      wire events, and such
            on(this.formNode, 'submit', function (evt) {
                events.stop(evt);
            }),
            console.log('app.CoordinateSectorCreator::setupConnections', arguments);

        },
        _getPoint: function () {
            var sr = new SpatialReference({
                wkid: this.map.spatialReference.wkid
            });
            var point = new Point(-111, 40, sr);
            return point;
        }
    });
});
