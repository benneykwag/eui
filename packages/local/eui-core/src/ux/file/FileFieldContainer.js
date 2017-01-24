Ext.define('eui.ux.file.FileFieldContainer', {
    extend: 'eui.form.FieldContainer',
    xtype: 'filefieldcontainer',
    layout: 'fit',
    defaultBindProperty: 'params',
    config: {
        params: null
    },
    items: [{
        xtype: 'tabpanel',
        height: 200,
        items: [{
                xtype: 'filemanager',
                title: 'File List',
                fileAutoLoad: false,
                width: 700,
                fileParams: null
            },
            {
                title: 'File Add',
                layout: 'fit',
                width: 700,
                items: {
                    xtype: 'uploadpanel',
                    uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                    initComponent: function () {
                        var me = this;
                        Ext.apply(me, {
                            uploaderOptions: {
                                params: null,
                                url: Config.fileuploadUrl
                            }
                        });
                        Ext.ux.upload.Panel.prototype.initComponent.call(me);
                    },
                    synchronous: true,
                    listeners: {
                        beforeupload: function () {
                            var maxSize = Config.fileuploadMaxSize || 1048576,
                                totalSize = 0,
                                size, errorMsg = '',
                                msgFormat = '파일 최대 업로드 용량({0})을 초과하였습니다';
                            this.queue.each(function(itm) {
                                size = itm && itm.config && itm.config.fileApiObject && itm.config.fileApiObject.size;
                                totalSize += Ext.isNumber(size) ? size : 0;
                            });

                            if (totalSize > maxSize) {
                                var fn = Ext.util.Format.fileSize;
                                errorMsg = Ext.String.format(msgFormat, fn(maxSize));
                                Ext.Msg.show({
                                    icon: Ext.Msg.WARNING,
                                    buttons: Ext.Msg.OK,
                                    message: errorMsg
                                });
                                return false;
                            }
                        },
                        uploadcomplete: function(uploadPanel, manager, items, errorCount) {
                            var tab = this.up('tabpanel');

                            if (errorCount) {
                                Ext.Msg.show({
                                    title: 'WARNING',
                                    icon: Ext.Msg.WARNING,
                                    message: '업로드를 실패하였습니다.',
                                    buttons: Ext.Msg.OK
                                });
                            } else {
                                Ext.Msg.show({
                                    title: 'INFO',
                                    icon: Ext.Msg.INFO,
                                    message: '업로드를 완료하였습니다.',
                                    buttons: Ext.Msg.OK
                                });
                                tab = tab.setActiveItem(0);
                                this.onRemoveAll();
                                tab.down('grid').getStore().reload();
                            }
                        }
                    }
                }
            }
        ]
    }],
    setParams: function(params) {
        var me = this,
            filegrid, uploadpanel,
            fn = function() {
                filegrid = me.down('filemanager filegrid');
                uploadpanel = me.down('uploadpanel');
                // ID_ATTACH_FILE 값이 Integer, String인 경우
                if (!Ext.isObject(params)) {
                    params = {
                        ID_ATTACH_FILE: params
                    }
                }
                filegrid.fileParams = params;
                filegrid.store.proxy.setExtraParams(params);
                uploadpanel.uploadManager.uploader.params = params;
                if (!Ext.isEmpty(params)) {
                    filegrid.store.load();
                }
            };
        this.callParent(arguments);
        if (me.rendered) {
            fn();
        } else {
            me.on('afterrender', function() {
                fn();
                me.un(fn);
            });
        }
    }
});
