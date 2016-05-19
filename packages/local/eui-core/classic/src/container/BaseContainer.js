Ext.define('eui.container.BaseContainer', {
    extend: 'Ext.container.Container',
    alias: 'widget.spbasecontainer',
    mixins: [
//        'com.ux.mixin.BaseContainer'
    ],
    scrollable: 'y',
    layout: {
        type :'vbox',
        align: 'stretch'
    },
    style: {
        'background-color': 'white'
    },
    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    }
});