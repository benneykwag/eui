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
    ],
    init: function () {
        eui.Config.initLocaleMessage();
        Ext.ux.ajax.SimManager.init({
            delay: 300,
            defaultSimlet: null
        }).register({
            'Numbers': {
                data: [[123,'One Hundred Twenty Three'],
                    ['1', 'One'], ['2', 'Two'], ['3', 'Three'], ['4', 'Four'], ['5', 'Five'],
                    ['6', 'Six'], ['7', 'Seven'], ['8', 'Eight'], ['9', 'Nine']],
                stype: 'json'
            }
        });
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'Eui.sample.view.main.Main',
    launch: function () {

    }
});
