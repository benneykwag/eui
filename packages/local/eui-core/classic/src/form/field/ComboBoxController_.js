Ext.define('eui.form.field.ComboBoxController_', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.spcombo_',

    getLastSelectedRecord: function (combo) {
        if (!combo) {
            combo = this.getView();
        }
        var grid = combo.column.up('tablepanel'),
            selModel = grid.getSelectionModel(),
            rec = selModel.getLastSelected();
        return rec;
    },

    onSelect: function (combo, record) {
        var me = this;
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var rec = me.getLastSelectedRecord();
            rec.set(combo.valueColumnDataIndex, record.get(combo.originalValueField));
        }

        me.nextBindFields(record);
    },

    /***
     * lastQuery를 지우면 콤보를 매번재로드한다.
     * 이전 조건이 변경될 경우면 재로드하도록 해야한다.
     */
    beforeCheckParamValue: function (qe) {
        var me = this,
            combo = this.getView(),
            extraParams = combo.store.getProxy().extraParams,
            currentParams = this.getComboData();

        /***
         * useLocalFilter : true일 경우는 queryMode가 local이다.
         * 최초 로드를 위해 인위적으로 store를 로드한다.
         * 최초 값이 설정되었을 경우 이미 로드했으므로 로드하지 않는다.(checkAutoLoad => false)
         */
        if (combo.useLocalFilter && qe.combo.lastQuery == undefined && !combo.checkAutoLoad()) {
            combo.store.load({
                callback: function () {
                    combo.expand()
                }
            });
        }

        /***
         *
         * 초기 값이 설정될 경우(value, bind) autoLoad:true로 데이터를 로딩하도록 checkAutoLoad() 메소드가 결정한다.
         * 이 후 트리거를 클릭하면 lastQuery가 undefined이므로 다시 로딩하게 된다.
         * 즉 값이 설정되어 최초 로드한 이후에도 불필요하게 재로드 되는 것을 방지.
         * 조건 1: queryMode는 remote일 경우다.
         * 조건 2: 사용자에 의해 한번도 쿼리하지 않았다.
         * 조건 3: checkAutoLoad()메소드는 값이 존재할 경우 true를 반환 할 것이다.
         */
        if (combo.queryMode == 'remote' && (qe.combo.lastQuery == undefined) && combo.checkAutoLoad()) {
            qe.combo.lastQuery = '';
        }

        // 이 콤보를 참조하고 있는 콤보가 있을 경우.
        if (combo.ownerNextBindVar && combo.column) {
            var ownerCombo = Ext.getCmp(combo.ownerNextBindFieldId),
                rec = me.getLastSelectedRecord(ownerCombo),
                searfield = (ownerCombo.valueColumnDataIndex ? ownerCombo.valueColumnDataIndex : ownerCombo.column.dataIndex);

            ownerCombo.setValue(rec.get(searfield))
            currentParams[combo.ownerNextBindParam] = ownerCombo.getValue();
        }

        // 참조하고 있는 모든 필드 등의 값이 변경되었다면 콤보는 재로드 해야한다.
        // 조건에 부합 할 경우 lastQuery를 지우도록 해 재로드가 가능하게 한다.

        if (Ext.Object.toQueryString(extraParams)
            != Ext.Object.toQueryString(currentParams)) {
            Ext.apply(combo.store.getProxy().extraParams, currentParams);

            delete qe.combo.lastQuery;
            if (qe.combo.useLocalFilter) {
                qe.combo.store.load();
            }
        }
    },

    getGrid: function (combo) {
        if(!combo){
            combo = this.getView();
        }
        return combo.column.up('tablepanel');
    },

    /*enableEditor: function (editor) {
        var grid = editor.column.up('tablepanel'),
            rec = this.getLastSelectedRecord(editor),
            row = grid.store.indexOf(rec);
        if (rec) {
            grid.editingPlugin.startEditByPosition({row: row, column: editor.column.fullColumnIndex});
            return true;
        }
        return false;
    },*/

    enableEditor: function (column) {
        var grid = column.up('tablepanel'),
            selModel = grid.getSelectionModel(),
            rec = selModel.getLastSelected(),
            row = grid.store.indexOf(rec);
        if (rec) {
            grid.editingPlugin.startEditByPosition({row: row, column: column.fullColumnIndex});
            return true;
        }
        return false;
    },

    getAllBindFormFields: function (combo) {
        return Ext.Array.filter(Ext.ComponentQuery.query('[bind][isFormField]'), function (field) {
            var retValue = true;
            if (combo.getId() == field.getId()) {
                retValue = false;
            }
            if (field.column) {
                retValue = false;
            }
            return retValue;
        });
    },

    getAllEditorColumns: function (combo) {
        var me = this;
        var ret =   Ext.Array.filter(Ext.Array.clone(Ext.ComponentQuery.query('gridcolumn')), function (column) {
            var retValue = false;
//            column = Ext.clone(column);
                if(me.getGrid().getId()== column.ownerCt.grid.getId() ){
                    retValue = true;
                }
//            if (column.getEditor(me.getLastSelectedRecord(combo))) {
//                retValue = true;
//            }
            return retValue;
        });
        return ret;
    },

    setNextBindSpCombo: function (combo, record, fieldArr, fieldParam, field) {
            field.setValue(null);

        if (record) {   // select이벤트에 의해 연계처리.
            /***
             * 역방향으로 자신을 참조하고 있는 대상을 알기위한 정보설정.
             */
            field.ownerNextBindVar = fieldArr[0];
            field.ownerNextBindParam = fieldParam;
            field.ownerNextBindFieldId = combo.getId();

            field.proxyParams[fieldParam] = record.get((field.column ? combo.originalValueField : combo.valueField));

            // 그리드 에디터일 경우
            var enableEditor = true;
            if (field.column) {
                enableEditor = this.enableEditor(field.column);
            }
            if (combo.nextBindComboExpand && enableEditor) {
                Ext.defer(function () {
                    Ext.get(field.getId()).select('.x-form-arrow-trigger').elements[0].click();
                }, 500)
            }

        } else {    // clear
            if (field.column) {
                me.enableEditor(field);
                Ext.defer(function () {
                    field.column.up('tablepanel').editingPlugin.completeEdit();
                }, 100)

            }
            field.clearValue();
        }
    },

    nextBindFields: function (record) {
        var me = this,
            combo = this.getView();
        if (!combo.nextBindFields) {
            return;
        }

        var targetFields = me.getAllBindFormFields(combo);
        if(combo.column) {
            Ext.each(me.getAllEditorColumns(combo), function (column) {
                if (column.config.editor) {
                    targetFields.push(column.getEditor())
                }
            });
        }
        console.log('targetFields', targetFields)
        Ext.each(combo.nextBindFields, function (bindFieldInfo) {
            var fieldArr = bindFieldInfo.split('|'),
                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);

            Ext.each(targetFields, function (field) {
                var className = Ext.ClassManager.getNameByAlias('widget.' + field.xtype);
                var viewClass = Ext.ClassManager.get(className);

                if (field.isFormField && field.getBind()) {

                    if (field.getBind().hasOwnProperty('value') && fieldArr[0] == field.getBind().value.stub.path) {

//                        // 연계 콤보
                        if (viewClass.prototype.xtypesMap['spcombo']) {
                            console.log('xtype:', field, fieldArr[0])
                            me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field);
                        } else {    // 일반적인 폼필드.
                            field.setValue(null);
                        }
                    }
                } else {
//                    var className2 = Ext.ClassManager.getNameByAlias('widget.' + field.config.editor.xtype);
//                    var viewClass2 = Ext.ClassManager.get(className2);
//                    console.log(className2, viewClass2.prototype.xtypesMap, '컬럼에서 작동할 경우: ', fieldArr[0], field.config.editor.bind);
//                    if (viewClass2.prototype.xtypesMap['spcombo']) {
//                        me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field, field);
//                    }
////                    if (fieldArr[0] == field.getBind().value.stub.path) {
////                        // 연계 콤보
////                        if (viewClass.prototype.xtypesMap['spcombo']) {
////                            me.setNextBindSpCombo(combo, record, fieldArr, fieldParam, field);
////                        } else {    // 일반적인 폼필드.
////                            field.setValue(null);
////                        }
////                    }
                }
            });
        });

    },

    clearValue: function () {
        var me = this,
            combo = this.getView();
        // 그리드 내부에서 사용시 코드(CD)에 해당하는 컬럼.
        if (combo.column && combo.valueColumnDataIndex) {
            var rec = me.getLastSelectedRecord();
            rec.set(combo.valueColumnDataIndex, null);
        }

        me.nextBindFields(null)
    },

    // 서버에 전달되는 내부정의 파라메터를 반환한다.
    // 1. groupCode :
    // 2. 연계정보를 다시 읽는다.
    //    다른 폼필드의 값을 연계할 경우는 뷰모델의 변수를 이용한다.
    getComboData: function () {
        var me = this,
            param = {},
            combo = this.getView();

        param[combo.defaultParam] = combo[combo.defaultParam];

        // 나의 바인드 변수를 참조하고 있는 컬럼의 에디터를 찾는다.
        // 현재 선택된 레코드의 값으로 에디터의
        if (combo.column) {

//            var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field) {
//                var retValue = true;
////                if (field.getEditor()) {
////                    retValue = true;
////                }
//                return retValue;
//            });

            //            Ext.each(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
//                Ext.each(combo.column.up('tablepanel').columns, function (field, idx) {
//                    var field2 = Ext.clone(field);
////                    if(field['editor']){
//                        console.log('editor:', combo.getId(), field2.editor, idx);
////                        Ext.each(field.editor.nextBindFields, function (bindFieldInfo) {
////                            var fieldArr = bindFieldInfo.split('|'),
////                                fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
////
////                            if(fieldParam == combo.name){
////                                debugger;
////                            }
////                        });
////                    }
//                });


//            console.log('editorColumns2', combo.getId(), editorColumns)
//            Ext.each(editorColumns, function (nextfield) {
//                Ext.each(nextfield.getEditor().nextBindFields, function (bindFieldInfo) {
//                    var fieldArr = bindFieldInfo.split('|'),
//                        fieldParam = (fieldArr.length == 1 ? fieldArr[0] : fieldArr[1]);
//
//                    if(fieldParam == combo.name){
//                        debugger;
//                    }
//                });
//
//            })
        }


        /***
         * 외부 폼필드 연계 처리
         * 뷰모델의 바인드를 이용.
         * 바인드변수명:파라메터명@설정값
         */
        Ext.each(combo.relBindVars, function (bindVar) {
            var bindVarArr = bindVar.split('|'),
                bindFieldName = (bindVarArr.length == 1 ? bindVarArr[0] : bindVarArr[1]),
                bindFieldName = bindFieldName.split('@')[0],
                bindValue = bindVar.split('@');

            param[bindFieldName] = (bindValue.length == 2 ? bindValue[1] : me.getViewModel().get(bindVarArr[0]));
        });


        Ext.apply(param, combo.getProxyParams())
        return param;
    },

    createStore: function (component, options) {
        var me = this,
            view = this.getView(),
            store = Ext.create('Ext.data.Store', {
                autoDestroy: true,
                autoLoad: false,//view.checkAutoLoad(),
                storeId: view.generateUUID(),
                fields: options.fields,

                proxy: {
                    type: view.proxyType,
                    noCache: false, // to remove param "_dc"
                    pageParam: false, // to remove param "page"
                    startParam: false, // to remove param "start"
                    limitParam: false, // to remove param "limit"
                    headers: { 'Content-Type': 'application/json;charset=utf-8' },
                    paramsAsJson: true,
                    actionMethods: {
                        create: 'POST',
                        read: 'POST',
                        update: 'POST',
                        destroy: 'POST'
                    },
                    url: options.url,
                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        transform: options.transform || false
                    },
                    extraParams: options.params
                }
            });
        component.bindStore(store);

        return store;
    },


    init: function () {

        var me = this,
            view = this.getView();

        // 외부에서 store 정의 된 경우 이후 처리안함.
        if (view.store.storeId != 'ext-empty-store') {
            return;
        }
//        var editorColumns = Ext.Array.filter(Ext.ComponentQuery.query('gridcolumn'), function (field, idx) {
//            var retValue = true;
//            console.log('editor:', idx, field.getEditor())
////            if (field.getEditor()) {
////                retValue = true;
////            }
//            return retValue;
//        });
//        Ext.defer(function () {
//        if(view.getId() === 'NEXT12') {

//        }
//        },1000)

//        console.log('editorColumns1', view.getId(), editorColumns)
        view.setProxyParams();
        if (view.useLocalFilter) {
            view.queryMode = 'local';
        }
        // 공통 코드를 사용하지 않을 경우.
//        if (!Ext.isEmpty(view.groupCode)) {
        // 공통 코드를 사용할 경우.
        me.createStore(view, {
            url: view.proxyUrl,
            fields: [],
            params: me.getComboData()
        });
//        }
    }
});