/**
 * # Summary
 * 날자 표시용 그리드 컬럼 클래스 .
 *
 * # 날자형 데이터 정의
 *
 * 서버사이드에서 전달되는 날자데이터를 표시한다
 * 아래 형태의 데이터를 'YYYY-MM-DD'형태로 그리드에 표시한다.
 *
 *  -   YYYYMMDD : 20110109
 *  -   YYYY-MM-DD : 2011-09-01
 *  -   YYYY-MM-DD : 2011-09-01 hh:m:s
 *
 * # 포맷 변경
 * 아래 처럼 포맷을 지정하여 표시형식을 변경가능함
 *
 *  format: 'Y-m-d H:i:s',
 *
 * # 날자 데이터의 서버사이드 전달
 * 아래 샘플처럼 Util.getDatasetParam(grid.store)를 사용하거나
 * model.getData()를 통해 데이터를 추출 할경우  eui.Config클래스의
 * modelGetDataDateFormat에 정의 된 형태로 설정된다
 *
 *  기본값
 *
 *  modelGetDataDateFormat: 'Ymd',
 *
 *
 * ## 사용예
 *     columns: [
 *          {
 *              // "OUTPUT_DT" : "20101011",
 *              text: 'YYYYMMDD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'OUTPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              //  "INPUT_DT" : "10/12/2012",
 *              text: 'MM/DD/YYYY',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'INPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "UPDATE_DT" : "2012-02-19",
 *              text: 'YYYY-MM-DD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'UPDATE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "RELEASE_DT" : "2012-01-10 13:12:34"
 *              width: 200,
 *              text: 'YYYY-MM-DD HH:MI:S',
 *              format: 'Y-m-d H:i:s',
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'RELEASE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          }
 *      ]
 *
 * # Sample
 *
 *     @example
 *     var store = Ext.create('Ext.data.Store', {
 *         fields: [
 *              {
 *                  name: "OUTPUT_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "INPUT_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "UPDATE_DT",
 *                  type: "date"
 *              },
 *              {
 *                  name: "RELEASE_DT",
 *                  type: "date"
 *              }
 *         ],
 *         data : [
 *          {
 *              "OUTPUT_DT" : "20101011",
 *              "INPUT_DT" : "10/12/2012",
 *              "UPDATE_DT" : "2012-02-19",
 *              "RELEASE_DT" : "2012-01-10 13:12:34"
 *          },
 *          {
 *              "OUTPUT_DT" : "20101011",
 *              "INPUT_DT" : "10/12/2012",
 *              "UPDATE_DT" : "2012-02-19",
 *              "RELEASE_DT" : "2012-01-10 13:12:34"
 *          }
 *         ]
 *     });
 *
 *     Ext.create('eui.grid.Panel', {
 *      store: store,
 *      defaultListenerScope: true,
 *      plugins: {
 *          ptype: 'cellediting',   // 셀에디터를 추가.
 *          clicksToEdit: 2         // 더블클릭을 통해 에디터로 변환됨.
 *      },
 *      tbar: [
 *          {
 *              showRowAddBtn: true,    // 행추가 버튼 활성화
 *              showSaveBtn: true,      // 저장 버튼 활성화
 *              xtype: 'commandtoolbar' // eui.toolbar.Command 클래스
 *      }
 *      ],
 *      listeners: {
 *          savebtnclick: 'onRowSave'
 *      },
 *      columns: [
 *          {
 *              // "OUTPUT_DT" : "20101011",
 *              text: 'YYYYMMDD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'OUTPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              //  "INPUT_DT" : "10/12/2012",
 *              text: 'MM/DD/YYYY',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'INPUT_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "UPDATE_DT" : "2012-02-19",
 *              text: 'YYYY-MM-DD',
 *              width: 100,
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'UPDATE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          },
 *          {
 *              // "RELEASE_DT" : "2012-01-10 13:12:34"
 *              width: 200,
 *              text: 'YYYY-MM-DD HH:MI:S',
 *              format: 'Y-m-d H:i:s',
 *              xtype: 'euidatecolumn',
 *              dataIndex: 'RELEASE_DT',
 *              editor: {
 *                  xtype: 'euidate'
 *              }
 *          }
 *        ],
 *        height: 400,
 *        renderTo: document.body,
 *        onRowSave: function (grid) {
 *          // validation check
 *          if (!grid.store.recordsValidationCheck()) {
 *              return;
 *          }
 *          Ext.Msg.show({
 *              title: '확인',
 *              buttons: Ext.Msg.YESNO,
 *              icon: Ext.Msg.QUESTION,
 *              message: '저장하시겠습니까?',
 *              fn: function (btn) {
 *                  if (btn === 'yes') {
 *                      Util.CommonAjax({
 *                          method: 'POST',
 *                          url: 'resources/data/success.json',
 *                          params: Util.getDatasetParam(grid.store),
 *                          pCallback: function (v, params, result) {
 *                              if (result.success) {
 *                                  Ext.Msg.alert('저장성공', result.message);
 *                                  grid.store.reload();
 *                              } else {
 *                                  Ext.Msg.alert('저장실패', result.message);
 *                              }
 *                          }
 *                      });
 *                  }
 *              }
 *          });
 *        }
 *     });
 *
 * See also the {@link #listConfig} option for additional configuration of the dropdown.
 *
 */
Ext.define('eui.grid.column.Date', {
    extend: 'Ext.grid.column.Date',
    alias: 'widget.euidatecolumn',
    format: 'Y-m-d',
	align : 'center',
	width : 100,
    mixins: [
        'eui.mvvm.GridRenderer'
    ],
    initComponent: function() {
        var me = this;
        if(!me.renderer){
            me.renderer = me.dateRenderer
        }
        me.callParent(arguments);
    }
});