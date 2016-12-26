/***
 * CSV 파일 그리드 업로드
 */

Ext.define('eui.ux.grid.CsvUploader', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.csvuploader',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    margin: 5,

    onSearch: function (result, headers) {
        var me = this,
            grid = me.down('grid');
        var store = Ext.create('Ext.data.Store', {
            fields: [],
            data: result
        });
        grid.bindStore(store);
//            this.getViewModel().get('excelStore').setData(exceljson);
        grid.store.load({
            params: {
            },
            callback: function (records, operation, success) {
                if (Ext.isEmpty(records) || records.length === 0) {
                    return;
                }
                var keys = Object.keys(records[0].getData());
                var columns = [];
                var formFields = [];
                var firstRecord = grid.store.getAt(0);
                var addColumn = function (key, idx) {
                    /*++ 2016. 11. 24 Add By. syyoon ++*/
                    //if (key.indexOf('field') !== -1) {
//                    var langKey = Util.getLocaleValue(key),
//                        langSize = 100;
//
//                    if (langKey.length < firstRecord.get(key).length) {
//                        langKey = firstRecord.get(key);
//                    }
//                    if (langKey === 0) {
//                        langSize = 200;
//                    } else {
//                        langSize = langKey.length * 10;
//                        if (langSize < 100) {
//                            langSize = 100;
//                        }
//                    }
                    columns.push({
                        minWidth: 100,
                        text: headers[idx],
                        dataIndex: key
                    });

                    //}
                };

                Ext.each(formFields, addColumn);
                Ext.each(formFields, function (itm) {
                    Ext.Array.remove(keys, itm);
                });
                Ext.each(keys, addColumn);
                grid.reconfigure(this.store, columns);
            }
        });
    },

    onSave: function (btn) {
        var me = this,
            grid = me.down('grid');
        var data = me.getGridData(grid),
            param = {
                data: data
            };
        if (me.__PARAMS.params) {
            Ext.apply(param, me.__PARAMS.params);
        }

        Util.CommonAjax({
            url: me.__PARAMS.url,
            params: param,
            pCallback: function (scope, param, result) {
                if (result.success) {
                    me.ownerCt.fireEvent('complete', me.ownerCt, data)
                } else {
                    me.ownerCt.fireEvent('fail', me.ownerCt, data)
                    Ext.Msg.alert('저장실패', result.message);
                }
            }
        });

    },

    getGridData: function (grid, data) {
        var list = grid.getStore().getData().items,
            ret = [];
        Ext.Array.each(list, function (itm) {
            ret.push(Ext.applyIf({__rowStatus: 'I' }, itm.getData(), data));
        });
        return ret;
    },

    toJson: function () {

        var me = this;
        var file = Ext.getCmp('uploadExcel').getEl().down('input[type=file]').dom.files[0];
        var reader = new FileReader();
//        var encodeList = document.getElementById("encoding");
//		var encoding = encodeList.options[encodeList.selectedIndex].value;
        //문서변환
        reader.readAsText(file, "EUC-KR");
        reader.onload = function (oFREvent) {
            myCsv = oFREvent.target.result;

            var lines = myCsv.split("\n");

            var result = [];

            var headers = lines[0].split("|");
            for (var i = 1; i < lines.length; i++) {
                var obj = {};
                if (lines[i]) {
                    var currentline = lines[i].split("|");

                    for (var j = 0; j < headers.length; j++) {
                        var header = headers[j].trim();
                        /* ++ 2016. 11. 24 Add by. syyoon
                         * 엑셀업로드를 호출한 Front에서 Grid가 있는지 체크
                         * Grid에서 엑셀업로드 기능을 호출하면 me.__PARAMS안에 name, dataIndex, text가 들어있음
                         * 없으면 field0, field1, field2.... 순서대로 셋팅됨
                         * ++*/
                        if (typeof(me.__PARAMS.DATAINDEX) == "undefined") {
                            obj['field' + j] = '' + currentline[j];
                        } else {
                            if (me.__PARAMS.DATAINDEX[j] == null) {
                                obj['field' + j] = '' + currentline[j];
                            } else {
                                obj[me.__PARAMS.DATAINDEX[j]] = '' + currentline[j];
                            }
                        }
                        // 기존 방식
                        //obj['field'+j] = ''+currentline[j];
                    }
                    result.push(obj);
                }
            }

            /*불러오기*/
//            console.log(result);
            me.onSearch(result, headers);
//            Ext.getCmp('display').setData(json);
        }
//		reader.readAsBinaryString(file);
    },

    initComponent: function () {
        var me = this;
        Ext.apply(me, {
            defaults: {
                margin: 5
            },

            items: [
                {
                    title: 'Excel Upload',
                    xtype: 'euiform',
                    tableColumns: 1,
                    items: [
                        {
                            xtype: 'euidisplay',
                            value: '제어판 -> 국가 및 언어 -> 숫자탭의 "목록 구분 기호"를 "|"로 꼭 변경하세요'
                        },
                        {
                            fieldLabel: '파일',
                            xtype: 'filefield',
                            cellCls: 'fo-table-row-td',
                            colspan: 3,
                            regex: (/.(csv)$/i),
                            regexText: 'Only CSV files allowed for upload',
                            id: 'uploadExcel'
                        }
                    ],
                    buttons: [
                        {
                            xtype: 'button',
                            text: 'Upload',
                            handler: function () {
                                me.toJson();
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'Save',
                            handler: function () {
                                me.onSave();
                            }
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    flex: 1,
                    height: 400,
                    usePagingToolbar: false,
                    bind: {
                        store: '{excelStore}'
                    },
                    listeners: {
                        itemdblclick: {
                            fn: me.parentCallBack,
                            scope: me
                        }
                    },
                    forceFit: true,
                    columns: {
                        defaults: {
                            width: 120
                        },
                        items: [
                            {
                                text: '-',
                                dataIndex: 'temp'
                            }
                        ]
                    }
                }
            ]
        });
        this.callParent(arguments);
        this.on('afterrender', function () {
            var me = this;
            /* ++ 부모 그리드에서 dataIndex, name, text 던져준 파라미터 호출  - 2016. 11. 23 Add By. syyoon
             * 주석처리 2016. 11. 24 Add by. syyoon++*/
            /*var dataIndex = me.__PARAMS.DATAINDEX;
             var name = me.__PARAMS.NAME;
             var text = me.__PARAMS.TEXT;
             var columns = [];

             var grid = me.down('hgrid');


             for(var i = 1; i < dataIndex.length; i++){
             columns.push({
             minWidth: 100,
             text: text[i],
             name : name[i],
             dataIndex: dataIndex[i]
             });
             }

             grid.reconfigure(this.store, columns);*/
            /* -- 2016. 11. 23 수정 내역 끝 -- */
        })
    }

});
//
//Arrival Date|
//BL NO.|
//TERMS|
//ORIGN|
//DEST.|
//VENDOR CODE|
//CUR|
//THC |
//Trucking Charge |
//H/D Charge |
//Pick Up Over Time |
//Storage Charge |
//CC Fee |
//CC Over Time |
//VIP CHARGE |
//Other charge |
//D/O Fee |
//    P/F |
//Import Tax |
//Vendor Invoice. No |
//    VAT (%)|
//Total (including VAT)|
//CUSTOMER CODE|
//CUR|
//    Air-Freight |
//FSC |
//CC Fee |
//Trucking Charge |
//    H/D Charge |
//Storage Charge |
//    P/F |
//Import Tax |
//Vendor Invoice. No |
//    VAT (%)|
//Total