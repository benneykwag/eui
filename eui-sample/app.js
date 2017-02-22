


Ext.application({
    name: 'Eui.sample',

    extend: 'Eui.sample.Application',
    requires: [
    ],
    init: function () {
        eui.Config.initLocaleMessage();
        eui.Util.global_setOverride();
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'Eui.sample.view.main.Main',
    launch : function() {
    }
});
