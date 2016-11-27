/**
 * The legend base class adapater for modern toolkit.
 */
Ext.define('Ext.chart.legend.LegendBase', {
    extend: 'Ext.dataview.DataView',
    config: {
        itemTpl: [
            '<span class=\"', Ext.baseCSSPrefix, 'legend-item-marker {[ values.disabled ? Ext.baseCSSPrefix + \'legend-inactive\' : \'\' ]}\" style=\"background:{mark};\"></span>{name}'
        ],
        inline: true,

        horizontalHeight: 48,
        verticalWidth: 150,

        position: ''
    },

    constructor: function (config) {
        this.callParent([config]);

        var scroller = this.getScrollable(),
            onDrag = scroller.onDrag;
        scroller.onDrag = function (e) {
            e.stopPropagation();
            onDrag.call(this, e);
        };
    },

    //<debug>
    applyPosition: function(position) {
        if (!position) {
            Ext.raise('Legend position must be "top", "right", "bottom" or "left".');
        }
        return position;
    },
    //</debug>

    updatePosition: function(position) {
        this.setDocked(position);
    },

    updateDocked: function (docked, oldDocked) {
        var me = this;

        me.callParent([docked, oldDocked]);
        if (docked === 'top' || docked === 'bottom') {
            me.setLayout({type: 'hbox', pack: 'center'});
            me.setInline(true);
            // TODO: Remove this when possible
            me.setWidth(null);
            me.setHeight(me.getHorizontalHeight());
            if (me.getScrollable()) {
                me.setScrollable({direction: 'horizontal'});
            }
        } else {
            me.setLayout({pack: 'center'});
            me.setInline(false);
            // TODO: Remove this when possible
            me.setWidth(me.getVerticalWidth());
            me.setHeight(null);
            if (me.getScrollable()) {
                me.setScrollable({direction: 'vertical'});
            }
        }
    },

    onItemTap: function (container, target, index, e) {
        this.callParent(arguments);
        this.toggleItem(index);
    }
});
