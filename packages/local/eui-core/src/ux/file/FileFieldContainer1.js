
Ext.define('eui.ux.file.FileFieldContainer1', {
    extend: 'eui.form.FieldContainer',
    xtype: 'filefieldcontainer1',
    layout: 'fit',
    defaultBindProperty: 'params',
    config: {
        params: null
    },
    items: [
        {
            xtype: 'tabpanel',
            height: 200,
            items: [
                {
                    title: 'File List',
                    layout: 'fit',
                    width: 700,
                    items: [
                        {
                            xtype: 'filegrid',
                            fileAutoLoad: false,
                            fileParams: null,
                            columns: [
                                {
                                    text: 'Filename',
                                    flex: 1,
                                    dataIndex: 'NM_FILE'
                                },
                                {
                                    text: 'Size',
                                    align: 'right',
                                    width: 70,
                                    dataIndex: 'SIZE_FILE',
                                    renderer: function(value) {
                                        return Ext.util.Format.fileSize(value);
                                    }
                                },
                                {
                                    text: 'Add User',
                                    align: 'center',
                                    width: 70,
                                    dataIndex: 'ID_REV_PRSN'
                                },
                                {
                                    xtype: 'datecolumn',
                                    format: 'Y.m.d G:i a',
                                    width: 150,
                                    text: 'Add Date',
                                    align: 'center',
                                    dataIndex: 'DT_REV'
                                },
                                {
                                    xtype: 'actioncolumn',
                                    text: 'Down',
                                    width: 40,
                                    items: [
                                        {
                                            icon: 'resources/images/customui/icon/COM.png',
                                            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                                                Util.fileClick(record.get('ID_FILE_DTIL'), record.get('ID_ATCH_FILE'), record.get('NM_FILE'));
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'actioncolumn',
                                    text: 'Del',
                                    width: 40,
                                    items: [
                                        {
                                            icon: 'resources/images/customui/icon/COM.png',
                                            handler: function(view, rowIndex, colIndex, item, e, record, row) {
                                                var store = this.up('grid').store;
                                                store.remove(record);
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    title: 'File Add',
                    layout: 'fit',
                    width: 700,
                    items: {
                        xtype: 'uploadpanel',
                        uploader: 'Ext.ux.upload.uploader.FormDataUploader',
                        initComponent: function() {
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
                            beforeupload: function() {
                              var maxSize = Config.fileuploadMaxSize || 1048576,
                                  totalSize = 0,
                                  size, extension, isValidExtension = true,
                                  validExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'hwp', 'dwg', 'pdf'],
                                  errorMsg = '',
                                  invalidExtensionFormat = '부적합한 확장자의 파일이 포함되어 있습니다. <br>업로드 가능 확장자)&nbsp;',
                                  msgFormat = '파일 최대 업로드 용량({0})을 초과하였습니다';
                              this.queue.each(function(itm) {
                                extension = itm.fileApiObject.name.split('.')[itm.fileApiObject.name.split('.').length -1];
                                isValidExtension = isValidExtension && Ext.Array.contains(validExtensions, extension);
                                  size = itm && itm.config && itm.config.fileApiObject && itm.config.fileApiObject.size;
                                  totalSize += Ext.isNumber(size) ? size : 0;
                              });
                              if (!isValidExtension) {
                                Ext.Msg.show({
                                  title: 'WARNING',
                                      icon: Ext.Msg.WARNING,
                                      buttons: Ext.Msg.OK,
                                      message: invalidExtensionFormat + validExtensions.join(', ')
                                });
                                return false;
                              }
                              if (totalSize > maxSize) {
                                  var fn = Ext.util.Format.fileSize;
                                  errorMsg = Ext.String.format(msgFormat, fn(maxSize));
                                  Ext.Msg.show({
                                    title: 'WARNING',
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
        }
    ],
    setParams: function(params) {
        var me = this,
            filegrid, uploadpanel,
            fn = function() {
                filegrid = me.down('filegrid');
                uploadpanel = me.down('uploadpanel');
                // ID_ATTACH_FILE 값이 Integer, String인 경우
                if (!Ext.isObject(params)) {
                    params = {
                        ID_ATTACH_FILE: params
                    };
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
