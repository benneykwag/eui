Ext.define('eui.ux.file.FilePanel', {
    extend: 'Ext.tab.Panel',
    alias: 'widget.euifilepanel',
    defaultListenerScope: true,
    config: {
        extraParams: null
    },

    defaultBindProperty: 'extraParams',

    setExtraParams: function (params) {
        this.extraParams = params;
        this.down('filemanager grid').store.getProxy().extraParams = params;
        this.down('filemanager grid').store.load();
        this.down('uploaddialog').items.items[0].uploadManager.uploader.params = params
    },
    initComponent: function () {
        var me = this,
            uploadPanel = Ext.create('Ext.ux.upload.Panel', {
                uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                uploaderOptions: {
                    params: me.extraParams,
                    url: Config.baseUrlPrifix||'' + Config.fileuploadUrl
                },
                synchronous: true
            });
        Ext.apply(me, {
            items: [
                {
                    xtype: 'filemanager',
                    fileAutoLoad: false,
                    title: 'File List',
                    fileParams: me.extraParams
                },
                {
                    title: 'File Add',
                    xtype: 'uploaddialog',
                    panel: uploadPanel,
                    listeners: {
                        uploadcomplete: 'onComplete'
                    }
                }
            ]
        })
        this.callParent(arguments);
    },

    onComplete: function (uploadPanel, manager, items, errorCount) {
        this.down('filemanager grid').store.load();
    }
});