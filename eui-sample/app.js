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
//        Ext.ux.ajax.SimManager.init({
//            delay: 300,
//            defaultSimlet: null
//        }).register({
//            'resources/data/companys.json': {
//                data: [
//                    {
//                        "name":"마이크로소프트2",
//                        "code":"MICROSOFT"
//                    },
//                    {
//                        "name":"B회사",
//                        "code":"BCMP"
//                    },
//                    {
//                        "name":"C회사",
//                        "code":"CCMP"
//                    },
//                    {
//                        "name":"D회사",
//                        "code":"DCMP"
//                    }
//                ],
//                stype: 'json'
//            }
//        });
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
    mainView: 'Eui.sample.view.main.Main',
    launch: function () {

    }
});
