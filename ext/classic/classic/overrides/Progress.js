/**
 * @class Ext.Progress
 */
Ext.define('Ext.overrides.Progress', {
    override: 'Ext.Progress',

    config: {
        ui: 'default'
    },

    updateWidth: function (width, oldWidth) {
        var me = this;

        me.callParent([width, oldWidth]);
        width -= me.element.getBorderWidth('lr');
        me.backgroundEl.setWidth(width);
        me.textEl.setWidth(width);
    },

    privates: {
        startBarAnimation: function(o) {
            this.barEl.animate(o);
        },

        stopBarAnimation: function() {
            this.barEl.stopAnimation();
        }
    }
});
