/**
 * @class Ext.grid.plugin.ColumnResizing
 * @extends Ext.Component
 * Description
 */
Ext.define('Ext.grid.plugin.ColumnResizing', {
    extend: 'Ext.Component',

    alias: 'plugin.gridcolumnresizing',

    config: {
        grid: null,

        /**
         * @cfg {Boolean} realtime
         * When true the whole column will resize in real-time as the user drags. When false only the header will resize
         * until the interaction is done.
         */
        realtime: false
    },

    resizerCls: Ext.baseCSSPrefix + 'grid-with-column-resize',

    init: function (grid) {
        this.setGrid(grid);
        this._resizeMarker = grid.resizeMarker;
        this._resizeMarkerParent = this._resizeMarker.parent();
    },

    updateGrid: function (grid, oldGrid) {
        var cls = this.resizerCls;

        if (oldGrid) {
            oldGrid.getHeaderContainer().renderElement.un({
                touchstart: 'onContainerTouchStart',
                touchmove: 'onContainerTouchMove',
                touchend: 'onContainerTouchEnd',
                scope: this,
                priority: 100
            });
            oldGrid.removeCls(cls);
        }

        if (grid) {
            grid.getHeaderContainer().renderElement.on({
                touchstart: 'onContainerTouchStart',
                touchmove: 'onContainerTouchMove',
                touchend: 'onContainerTouchEnd',
                scope: this
            });
            grid.addCls(cls);
        }
    },

    onContainerTouchStart: function (e) {
        var target = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-column'),
            resizer = e.getTarget('.' + Ext.baseCSSPrefix + 'grid-column-resizer'),
            grid = this.getGrid(),
            column;

        if (resizer && !e.multitouch && target && !this._resizeColumn) {
            column = Ext.Component.fromElement(target);

            if (column && column.getResizable()) {
                this._startColumnWidth = column.getComputedWidth();
                this._minColumnWidth = column.getMinWidth();
                this._resizeColumn = column;
                this._startX = e.getX();
                column.renderElement.addCls(Ext.baseCSSPrefix + 'grid-column-resizing');
                // Prevent drag and longpress gestures being triggered by this mousedown
                e.cancelGesture();

                if (!this.getRealtime()) {
                    this._resizeMarker.show();
                    this._resizeMarker.setLeft(column.el.getOffsetsTo(this._resizeMarkerParent)[0] + this._startColumnWidth);
                } else {
                    column.setWidth(this._startColumnWidth);
                }
            }
        } else if (e.multitouch && this._resizeColumn) {
            this.endResize();
        }
    },

    onContainerTouchMove: function (e) {
        // Single touch only
        if (e.isMultitouch) {
            this.endResize();
            return;
        }

        if (this._resizeColumn) {
            var column = this._resizeColumn,
                resizeAmount = e.getX() - this._startX;

            if (column) {
                this.currentColumnWidth = Math.max(Math.ceil(this._startColumnWidth + resizeAmount), this._minColumnWidth);

                if (this.getRealtime()) {
                    column.setWidth(this.currentColumnWidth);
                    column.renderElement.setWidth(this.currentColumnWidth);
                } else {
                    this._resizeMarker.setLeft(column.el.getOffsetsTo(this._resizeMarkerParent)[0] + this.currentColumnWidth);
                }

                e.stopEvent();
            }
        }
    },

    onContainerTouchEnd: function (e) {
        if (this._resizeColumn) {
            e.stopEvent();
            this.endResize();
        }
    },

    endResize: function () {
        var column = this._resizeColumn,
            grid = this.getGrid();
        if (column) {
            if (!this.getRealtime()) {
                grid.resizeMarker.hide();
            }
            column.setWidth(this.currentColumnWidth);
            column.renderElement.removeCls(Ext.baseCSSPrefix + 'grid-column-resizing');
            delete this._resizeColumn;
        }
    }
});