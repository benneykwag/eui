Ext.define("eui.mvvm.GridViewController", {
    extend: 'Ext.Mixin',
    mixinId: 'gridviewcontroller',
    mixinConfig: {

    },

    config: {

    },

    // 그리드 행 추가
    onRowAdd: function (grid, data, idx) {
        console.log(arguments);
        return;
        var store = grid.getStore();
        if (Ext.isEmpty(idx)) {
            store.add(data);
        } else {
            store.insert(idx, data);
        }

        var index = store.indexOf(data);
        grid.getView().focusRow(index);
        Ext.get(Ext.get(grid.getView().getRow(index)).id).select('.x-grid-row-checker').elements[0].click()
    },


    /***
     * 선택된 로우를 삭제처리한다.
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowDel: function (button, srvOpt, callback) {

        var me = this,
            controller = this.getMyViewController(button),
            dataPrefix = srvOpt.prefix,
            grid = button.up('grid'),
            sel = button.up('grid').getSelection(),
            model = grid.getSelection()[0]; //선택된 레코드
        var list;

        if (!model || !model.isModel) {
            Ext.Msg.alert('Erorr', '삭제할 항목을 선택하여 주십시오');
            return;
        }
        if (Ext.isArray(sel) && sel.length > 1) {
            list = [];
            Ext.Array.each(sel, function (itm) {
                list.push(itm.getData());
            });
        }

        if (!Ext.isFunction(callback)) {
            callback = function () {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            }
        }

        Ext.Msg.show({
            title: '삭제',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '삭제하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                    // 위치 고민...
                    grid.store.remove(sel);
                    srvOpt.params = {};
                    srvOpt.params[dataPrefix] = {
                        deleteData: list || [model.getData()]
                    };
                    srvOpt.params['__scopeGrid'] = grid;
                    srvOpt.pCallback = callback;
                    srvOpt.pScope = controller;

                    Util.CommonAjax(srvOpt);
                }
            }
        });

    },

    getMyViewController: function(component){
    	 if(Util.getOwnerCt(component).xtype === 'window'){
            return  Util.getOwnerCt(component).items.items[0].getController();
        }else{
            // hbasecontainer
             return   Util.getOwnerCt(component).getController();
        }
        return null;
    },
    
    /***
     * private 내부 처리용.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowDataUpdate: function (button, srvOpt, callback) {
        var grid = button.up('grid'),
            dataPrefix = srvOpt.prefix,
            controller = this.getMyViewController(button),
            modifyRecords = grid.store.getModifiedRecords();
        
        if (!Ext.isDefined(callback)) {
            callback = function () {
                grid.store.load();
                Ext.Msg.alert('확인', '처리가 완료되었습니다.');
            }
        }

        srvOpt.params = {};
        srvOpt.params[dataPrefix] = Util.getDatasetParam(grid.store);
        srvOpt.params['__scopeGrid'] = grid;
        srvOpt.pCallback = callback;
        srvOpt.pScope = controller;

        Util.CommonAjax(srvOpt);
    },
    /***
     * 그리드 공통 "등록"
     * 그리드의 수정된 데이터를 전송하고 서버사이드에서는 입력처리한다
     * @param button
     * @param serviceUrl    삭제 주소
     * @param dataPrefix    내부 구분
     * @param callback      후처리
     */
    onRowReg: function (button, cfg, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;

        Ext.each(modifyRecords, function (rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, cfg, callback);
    },

    /***
     * 그리드 공통 "수정"
     * 신규 레코드가 존재할 경우 진행하지 않는다.
     * 수정된 레코듬만 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowMod: function (button, srvOpt, callback) {
        var grid = button.up('grid'),
            newRecords = grid.store.getNewRecords(),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;

        if (newRecords.length > 0) {
            Ext.Msg.alert('확인', '등록이 필요합니다.');
            return;
        }

        Ext.each(modifyRecords, function (rec) {
            if (!rec.phantom) {
                i++;
            }
        });
        if (i === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }

        this.onRowDataUpdate(button, srvOpt, callback);
    },

    /***
     * 그리드 공통 "저장"
     * 입력 , 수정된 데이터가 대상이다.
     * @param button
     * @param serviceUrl
     * @param dataPrefix
     * @param callback
     */
    onRowSave: function (button, srvOpt, callback) {
        var grid = button.up('grid'),
            modifyRecords = grid.store.getModifiedRecords(),
            i = 0;

        if (modifyRecords.length === 0) {
            Ext.Msg.alert('확인', '대상 레코드가 존재하지 않습니다.');
            return;
        }
        this.onRowDataUpdate(button, srvOpt, callback);
    }
});