/*
 * This file is generated and updated by Sencha Cmd. You can edit this file as
 * needed for your application, but these edits will have to be merged by
 * Sencha Cmd when upgrading.
 *
 */
Ext.application({
    name: 'Eui.sample',

    extend: 'Eui.sample.Application',
    requires: [
        'Eui.sample.view.grid.Basic',
        'Eui.sample.view.form.Panel',
        'Eui.sample.view.main.Main'
    ],
    init: function () {
        eui.Config.initLocaleMessage();
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'Eui.sample.view.grid.Basic'
});
