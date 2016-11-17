Ext.define('Eui.sample.view.template.tmp005.TMP005V02', {
    extend: 'eui.tree.Panel',
    xtype: 'TMP005V02',
    height: 300,
    rootVisible: false,
    useArrows: true,
    margin: 10,
    store: {
    	type: 'tree',
    	fields: [
           
        ],
        proxy: {
            type: 'ajax',
            //the store will get the content from the .json file
            url: 'resources/data/template/data02.json',
            reader: {
                type: 'json',
                rootProperty: 'children'
            }
        },
        folderSort: true
    },
    
    // 컬럼 정보 정의.
    columns: [
    	{
            xtype: 'treecolumn', //this is so we know which column will show the tree
            text: '메뉴명',
            width: 200,
            sortable: true,
            dataIndex: 'MENU_NAME',
            locked: true
        },
        {
        	text: '레벨',
        	xtype: 'euicolumn',
        	dataIndex: 'LEVEL'
        },
        {
        	text: '순서',
        	xtype: 'euicolumn',
        	dataIndex: 'SORT'
        },
        {
        	text: '상위메뉴ID',
        	xtype: 'euicolumn',
        	dataIndex: 'PARENT_ID'
        },
        {
        	text: '사용여부',
        	xtype: 'euicheckcolumn',
        	listeners: {
        		checkchange: 'onUseChange'
        	},
        	dataIndex: 'USE_YN'
        }
    ],


    // 처리 메소드

    /***
     * 로우를 추가한다.
     * 후처리 전처리 하지 않을 경우 정의하지 않는다.
     * @param grid
     */
    addRecord: function (grid) {
        console.log(' 콜백처리...', arguments)
        grid.onRowAdd(grid, {
        }, 1, function () {    // callback이 필요할 경우 구현한다.
            console.log(' 콜백처리...', arguments)
        });
    },

    /***
     * 로우를 선택할 경우..
     * @param grid
     * @param record
     */
    onGridSelect: function (grid, record) {
//        this.getViewModel().set("customerRecord", record);
    },

    /***
     * 레코드 삭제..
     * @param grid
     */
    onRecDelete: function (grid) {
        grid.onRowDelete(grid, function (store, records) {
            store.remove(records);
        }, grid);
    },

    /***
     * 그리드 최종 저장.
     * @param grid
     */
    onRowSave: function (grid) {
        Ext.Msg.show({
            title: '확인',
            buttons: Ext.Msg.YESNO,
            icon: Ext.Msg.QUESTION,
            message: '저장하시겠습니까?',
            fn: function (btn) {
                if (btn === 'yes') {
                    Util.CommonAjax({
                        method: 'POST',
                        url: 'TMP0041W.do',
                        params: Util.getDatasetParam(grid.store),
                        pCallback: function (v, params, result) {
                            if (result.success) {
                                Ext.Msg.alert('저장성공', result.message);
                            } else {
                                Ext.Msg.alert('저장실패', result.message);
                            }
                        }
                    });
                }
            }
        });
    }
});