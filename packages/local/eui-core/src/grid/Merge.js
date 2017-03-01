/***
 *
 * ## Summary
 *
 * rowspan, colspan과 합계 , 총계를 지원한다. addSumRows, addTotalRow 변수에 의해 총계, 소계,합계를 보여줄 수 있다.
 * 기본은 모두 보여주지 않고 머지만 처리한다.
 * 이 클래스는 뷰모델의 store만 처리하므로 create에 의해 스토어를 생성 변수로 대입하지 않도록 한다. 아래 샘플처럼 뷰모델을
 * 정의하고 해당 뷰모델 내부 스토어를 바인딩 하여 사용한다.
 *
 *     @example
 *     Ext.create('eui.grid.Merge', {
 *         title: '셀머지',
 *         addSumRows: true,
 *         addTotalRow: true,
 *         viewModel: {
 *              stores: {
 *                  mystore: {
 *                      autoLoad: true,
 *                      sorters: [
 *                          'col3'
 *                      ],
 *                      fields:[
 *                          {
 *                              name: "col1",
 *                              type: "string"
 *                          },
 *                          {
 *                              name: "col2",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col1')+'@'+record.get('col2');
 *                              }
 *                          },
 *                          {
 *                              name: "col3",
 *                              type: "string",
 *                              convert: function (v, record) {
 *                                  return record.get('col2')+'@'+record.get('col3');
 *                              }
 *                          }
 *                      ],
 *                      proxy: {
 *                          type: 'ajax',
 *                          url: 'eui-core/resources/data/statdata1.json',
 *                          reader: {
 *                              type: 'json',
 *                              rootProperty: 'data'
 *                          },
 *                          writer: {
 *                              type: 'json',
 *                              allowSingle: false,  // #2
 *                              writeAllFields: true    // #3
 *                          }
 *                      }
 *                  }
 *              }
 *         },
 *         bind: {
                store: '{mystore}'
            },
 *         groupFields: [
 *              {
 *                  field: 'col1',
 *                  mergeConfig: [
 *                      {
 *                          field: 'col2',
 *                          cond: 'colspan',
 *                          value: 2
 *                      },
 *                      {
 *                          field: 'col3',
 *                          cond: 'hidden',
 *                          value: true
 *                      }
 *                  ]
 *              },
 *              {
 *                  field: 'col2',
 *                  mergeConfig: []
 *              }
 *          ],
 *          lastMergeColumn: ['col3'],
 *          sumFields: ['col4', 'col5'],
 *         columns: [
 *              {
 *                  text: '구분',
 *                  columns: [
 *                      {
 *                          text: "수입/지출",
 *                          dataIndex: 'col1',
 *                          renderer: function (v) {
 *                              if(v == '합'){
 *                                  return '총계'
 *                              }
 *                              return v;
 *                          }
 *                      },
 *                      {
 *                          text: "대항목",
 *                          dataIndex: 'col2',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[1];
 *                              if(value == '합'){
 *                                  return '합계'
 *                              }
 *                              return value;
 *                          }
 *                      },
 *                      {
 *                          text: "소항목",
 *                          dataIndex: 'col3',
 *                          renderer: function (v) {
 *                              var value = v.split('@')[2];
 *                              if(value == '합'){
 *                                  return '소계'
 *                              }
 *                              return value;
 *                          }
 *                      }
 *                  ]
 *              },
 *              {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "1월",
 *                   dataIndex: 'col4'
 *               },
 *               {
 *                   width: 100,
 *                   xtype: 'euinumbercolumn',
 *                   text: "2월",
 *                   dataIndex: 'col5'
 *               }
 *         ],
 *         height: 500,
 *         width: 800,
 *         renderTo: Ext.getBody()
 *     });
 *
 *
 * ## 모델의 field정의
 * 모델의 필드를 정의 할때 데이터의 정렬를 위해 각 필드들을 convert메소드를 이용해 연결해준다.
 * 이렇게 연결시켜야 원하는 소트와 머지가 이루어진다.
 *
 *      Ext.define('Eui.sample.model.Base', {
 *          extend: 'Ext.data.Model',
 *          fields: [
 *              {
 *                  name: "col1",
 *                  type: "string"
 *              },
 *              {
 *                  name: "col2",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col1')+'@'+record.get('col2');
 *                  }
 *              },
 *              {
 *                  name: "col3",
 *                  type: "string",
 *                  convert: function (v, record) {
 *                      return record.get('col2')+'@'+record.get('col3');
 *                  }
 *              }
 *          ]
 *      });
 *
 * ## Store 정의
 * 스토어 정의시 뷰모델 내부에서 정의해야하며 서버사이드의 데이터가 정렬되지 않았을 경우 sorters를 이용 필히 소트를 시켜줘야한다.
 *
 *      viewModel: {
            stores: {
                store: {
                    autoLoad: true,
                    proxy: {
                        type: 'ajax',
                        url: 'resources/data/statdata1.json',
                        reader: {
                            type: 'json',
                            rootProperty: 'data'
                        }
                    },
                    model: 'Eui.sample.model.Base',
                    sorters: [  //col3 필드로 소트한다.
                        'col3'
                    ]
                }
            }
        },

 *
 * ## groupFields 설정.
 * eui.grid.Merge클래스를 확장하고 관련 설정이 필요하다. groupFields는 머지할 컬럼정보로 아래 형식으로 채워준다.
 *
 *      groupFields: [
             {
                 field: 'col1',
                 mergeConfig: [ // 합계,소계처리에 필요하므로 머지만 적용시 비워둔다.
                    {
                        field: 'col2',
                        cond: 'colspan',
                        value: 2
                    },
                    {
                        field: 'col3',
                        cond: 'hidden',
                        value: true
                    }
                 ]
             },
             {
                 field: 'col2',
                 mergeConfig: []
             }
        ],
 *
 * ## lastMergeColumn 설정
 * 이 설정은 합계, 소계를 나타낼 경우 소계가 표시되는 마지막 컬럼을 기술한다.
 *
 *      lastMergeColumn: ['col3'],
 *
 * ## sumFields 설정
 * 이 설정은 합계를 구할 컬럼을 기술할 변수다.
 *
 *      sumFields: ['col4', 'col5'],
 *
 * ## 합계,총계,소계를 표시
 * addSumRows, addTotalRow
 *
 *
 * ## column renderer설정
 * 머지될 컬럼에 설정될 필드는 모델 정의 시 covert메소드를 이용 필드값을 @로 합져진 상태이므로 이를 원하는 값으로 보여지게하기 위해 사용한다.
 *
 *      columns: [
 *          {
 *               text: "수입/지출",
 *               dataIndex: 'col1',
 *               renderer: function (v) {
 *                   if(v == '합'){  // 머지만 적용할 경우 필요없음.
 *                       return '총계'
 *                   }
 *                   return v;
 *               }
 *           },
 *           {
 *               text: "대항목",
 *               dataIndex: 'col2',
 *               renderer: function (v) {
 *                   var value = v.split('@')[1];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '합계'
 *                   }
 *                   return value;
 *               }
 *           },
 *           {
 *               text: "소항목",
 *               dataIndex: 'col3',
 *               renderer: function (v) {
 *                   var value = v.split('@')[2];
 *                   if(value == '합'){  // 머지만 적용할 경우 필요없음.
 *                      return '소계'
 *                   }
 *                   return value;
 *               }
 *           }
 *     ]
 */
Ext.define('eui.grid.Merge', {
    extend: 'Ext.panel.Table',
    requires: [
        'eui.view.Merge'
    ],
    alias: ['widget.euimergegrid'],
    viewType: 'mergetableview',

    lockable: false,
    columnLines: true,

    sortableColumns: false,

    /***
     * @cfg {Array} groupFields Merge할 컬럼을 지정한다.
     *
     */
    groupFields :[],

    /**
     * @cfg {Boolean} rowLines 로우에 라인스타일 적용.
     */
    rowLines: true,

    /**
     * @cfg {Boolean} 합계, 소계를 표시한다.
     */
    addSumRows: false,

    /**
     * @cfg {Boolean} 로우 맨하단에 총계를 표시한다.
     */
    addTotalRow: false,

    lastMergeColumn: [],

    /***
     * 메뉴 제거함.
     */
    afterRender: function () {
        this.callParent(arguments);
        Ext.each(this.getColumns(), function(item) {
            if(item.triggerEl){
                item.triggerEl.hide();
            }
        });
    },

    initComponent: function () {
        Ext.Array.each(this.columns, function (col) {
            Ext.apply(col, {
                menuDisabled : true
            });

        });
        this.callParent(arguments);
    },

    /**
     * 스토어를 복제해 계산에 사용하기 위한 스토어를 반환한다.
     * @returns {Ext.data.Store|*|eui.grid.Merge.tempStore}
     */
    getTempStore: function () {
        var me = this,
            rStore = this.store;
        if (!me.tempStore) {
            me.tempStore = Ext.create('Ext.data.Store', {
                fields: []
            });
            rStore.each(function (model) {
                me.tempStore.add(model.copy());
            });
        }
        return me.tempStore;
    },

    /**
     * @private
     * @cfg {String} cls
     * 셀 상단과 우측 보더를 설정하기 위한 css로 all.scss에 표기하였다.
     */
    cls: 'stat-tdstyle',

    /**
     * 그리드 최하단에 "총계"를 추가한다.
     */
    addTotoalRow: function () {
        if(!this.addTotalRow){
            return;
        }
        var rStore = this.store;
        var store = this.getTempStore();
        var me = this;
        var col = me.groupFields[0].field;
        var retObj = {};
        retObj[col] = '합';

        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
        retObj[col + 'colspan'] = colArray.length;
        Ext.each(colArray, function (v, z) {
            if(z > 0){
                retObj[v+'hidden'] = true;
            }
        });

        Ext.each(me.sumFields, function (sumcol) {
            retObj[sumcol] = store.sum(sumcol);
        });

        rStore.add(retObj);
    },

    /***
     *
     * @param rStore
     * @param groupField
     * @param scol
     * @param values
     */
    generaRow: function (rStore, groupField, scol, values) {
        var me = this;
        for (var test in values) {  // 그룹핑한 갯수.
            // convert 와 sum을 함께 사용할 경우.
            var div = test.split('@');
            if(div[0] === div[1]){
               div =  div.slice(1,div.length)
            }

            var lastMergeColumnKey = me.lastMergeColumn;
            var findRecord = rStore.findRecord(lastMergeColumnKey, div.join('@')+'@합');
            if (findRecord) {
                findRecord.data[scol] = values[test];
            }
        }
    },

    setStore: function () {
        this.callParent(arguments);
        var rStore = this.store;
        var me = this;
        rStore.on('load', function () {
            rStore.suspendEvents();
            var store = me.getTempStore();
            // 총계 처리.
            me.addTotoalRow();
            // 합계, 소계를 처리.
            if(me.addSumRows) {
                Ext.each(me.groupFields, function (groupColumn, idx) {
                    store.group(groupColumn.field);

                    var values = store.sum(me.sumFields[0], true);

                    for (var test in values) {  // 그룹핑한 갯수.
                        var retObj = {};
                        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
                        var i = 0;
                        Ext.each(colArray, function (v, z) {
                            var recValue = test.split('@')[z + i];
                            if (!recValue) {
                                recValue = '합';
                            }
                            retObj[v] = recValue;

                            var colConfig = groupColumn.mergeConfig[z];
                            if (groupColumn.mergeConfig[z]) {
                                retObj[colConfig.field + colConfig.cond] = colConfig.value;
                            }
                            i++;
                        });
                        rStore.add(retObj)
                    }

                    // 합계를 계산할 필드로
                    Ext.each(me.sumFields, function (scol, sIdx) {
                        var testObj = {};
                        var values2 = store.sum(scol, true);
                        me.generaRow(rStore, groupColumn, scol, values2);
                    });
                });
            }

            rStore.resumeEvents();

            // 최종 머지 처리.
            me.callMerge(rStore);
        });
    },

    /***
     * 중복된 셀값을 좌우로 합친다.
     * @param rStore
     */
    callMerge: function (rStore) {
        var me = this;

        Ext.each(me.groupFields, function (mergecol, idx) {
            var mergeKeyCol = mergecol.field;


            rStore.group(mergeKeyCol);
            var cols = rStore.count(mergeKeyCol);

            for (var test in cols) {

                var sumVar = test.split('@')[1];

                var rowIdx = rStore.findExact(mergeKeyCol, test);
                var value = cols[test];

                var recs = rStore.getRange(rowIdx, rowIdx + value - 1);
                recs[0].data[mergecol.field + 'rowspan'] = value;

                Ext.each(recs, function (item, idx) {
                    if (idx > 0) {
                        item.data[mergecol.field + 'hidden'] = true;
                    }
                });
            }
        })
        rStore.group(null);
        if(me.lastMergeColumn.length>0){
            rStore.sort([
                { property: me.lastMergeColumn, direction: 'ASC'} // #5
            ]);
        }


        me.getView().refresh();
    }

});