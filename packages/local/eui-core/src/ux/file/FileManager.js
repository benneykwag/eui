Ext.define('eui.ux.file.FileManager', {
    extend: 'Ext.panel.Panel',
    xtype: 'filemanager',
    modal: true,
    requires: [
        'Ext.ux.upload.uploader.FormDataUploader',
//        'Ext.ux.upload.uploader.ExtJsUploader',
        'Ext.ux.upload.Panel',
        'eui.ux.file.FileGrid',
        'eui.ux.file.FileForm',
        'eui.ux.file.FileManagerController'
    ],
    defaultListenerScope: true,
    controller: 'filemanager',

    layout: 'fit',

    title: '파일매니저',
    fileAutoLoad: true,
    draggable: false,
    resizable: false,

    config: {
        fileParams : {}
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            items: [
                {
                    xtype: 'filegrid',
                    listeners: {
                        render: function () {
                            if(me.fileAutoLoad){
                                this.store.load();
                            }
                        }
                    },
                    fileParams : me.getFileParams()
                }
//                ,
//                {
//                    xtype: 'fileform',
//                    height: 70
//                }
            ]
        });
        me.callParent(arguments);
    },

    listeners: {
        fileuploadcomplete: function(){
            console.log('fileuploadcomplete', arguments);
        }
    },

    onRender: function (cmp) {
        var me = this,
            statusbar = this.down('filegrid'),
            form = this.down('form');
        statusbar.bbar = [
        ];

//        this.addHiddenFieldParams(me.fileParams);
        this.callParent(arguments);
    },
    
    addHiddenFieldParams: function (fileParams) {
        this.setFileParams(fileParams);
        var form = this.down('fileform');
        for (var test in fileParams) {
            var value = fileParams[test];
            form.add({
                xtype: 'iddenfield',
                name: test,
                value : value
            })
        }
    }

});