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
        'Eui.sample.*'
    ],
    init: function () {
        eui.Config.initLocaleMessage();
    },

    // The name of the initial view to create. With the classic toolkit this class
    // will gain a "viewport" plugin if it does not extend Ext.Viewport. With the
    // modern toolkit, the main view will be added to the Viewport.
    //
//    mainView: 'Eui.sample.view.main.Main'
    launch: function () {
        Ext.create('Ext.grid.Panel', {
            title: 'Simpsons',
            width: 500,
            height: 200,
            store: Ext.create('Ext.data.Store', {
                fields: ['name', 'email', 'phone', 'progress'],
                data: [
                    { 'name': 'Lisa', "email": "lisa@simpsons.com", "phone": "555-111-1224", 'progress': 25 },
                    { 'name': 'Bart', "email": "bart@simpsons.com", "phone": "555-222-1234", 'progress': 50 },
                    { 'name': 'Homer', "email": "home@simpsons.com", "phone": "555-222-1244", 'progress': 75 },
                    { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254", 'progress': 100 }
                ]
            }),
            columns: [
                { header: 'Name', dataIndex: 'name' },
                { header: 'Email', dataIndex: 'email', flex: 1 },
                { header: 'Phone', dataIndex: 'phone' },
                {
                    header: 'Progress',
                    dataIndex: 'progress',
                    width: 110,
                    renderer: function (v, m, r) {
                        var id = Ext.id();
                        Ext.defer(function () {
                            Ext.widget('progressbar', {
                                renderTo: id,
                                value: v / 100,
                                width: 100
                            });
                        }, 50);
                        return Ext.String.format('<div id="{0}"></div>', id);
                    }
                }
            ],
            renderTo: document.body
        });
    }
});
