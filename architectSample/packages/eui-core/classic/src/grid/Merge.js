/***
 * Colspan, Rowspan을 지원하는 그리드.
 */
Ext.define('eui.grid.Merge', {
    extend: 'Ext.panel.Table',
    requires: [
        'eui.view.Merge'
    ],
    alias: ['widget.mergegrid'],
    viewType: 'mergetableview',

    lockable: false,
    columnLines: true,

    sortableColumns: false,

    /**
     * @cfg {Boolean} rowLines False to remove row line styling
     */
    rowLines: true,

    // Columns config is required in Grid
    /**
     * @cfg {Ext.grid.column.Column[]/Object} columns (required)
     * @inheritdoc
     */

    /**
     * @event beforereconfigure
     * Fires before a reconfigure to enable modification of incoming Store and columns.
     * @param {Ext.grid.Panel} this
     * @param {Ext.data.Store} store The store that was passed to the {@link #method-reconfigure} method
     * @param {Object[]} columns The column configs that were passed to the {@link #method-reconfigure} method
     * @param {Ext.data.Store} oldStore The store that will be replaced
     * @param {Ext.grid.column.Column[]} oldColumns The column headers that will be replaced.
     */

    /**
     * @event reconfigure
     * Fires after a reconfigure.
     * @param {Ext.grid.Panel} this
     * @param {Ext.data.Store} store The store that was passed to the {@link #method-reconfigure} method
     * @param {Object[]} columns The column configs that were passed to the {@link #method-reconfigure} method
     * @param {Ext.data.Store} oldStore The store that was replaced
     * @param {Ext.grid.column.Column[]} oldColumns The column headers that were replaced.
     */

    getTempStore: function () {
        var me = this,
            rStore = this.store;
        if (!me.tempStore) {
            me.tempStore = Ext.create('Ext.data.Store', {
                model: 'Eui.sample.model.Base',
                sorters: [
                        me.lastMergeColumn + 'key'
                ]
            });
            rStore.each(function (model) {
                me.tempStore.add(model.copy());
            });
        }
        return me.tempStore;
    },
    cls: 'stat-tdstyle',

    firstMergeColspan : 3,

    addTotoalRow: function () {
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
        })

        rStore.add(retObj);
    },

    generaRow: function (rStore, groupField, scol, values) {
        var me = this;
        for (var test in values) {  // 그룹핑한 갯수.
            /***
             * convert 와 sum을 함께 사용할 경우.
             * 수입@수입@ -> 중복 현상 보정.
             * @type {Array}
             */
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

    listeners: {
        render: function () {
            var rStore = this.store;
            var me = this;
            rStore.on('load', function () {
                rStore.suspendEvents();

                var store = me.getTempStore();
                me.addTotoalRow();

                Ext.each(me.groupFields, function (groupColumn, idx) {
                    store.group(groupColumn.field);

                    var values = store.sum(me.sumFields[0], true);

                    for (var test in values) {  // 그룹핑한 갯수.
                        var retObj = {};
                        var colArray = Ext.Array.merge(Ext.pluck(me.groupFields, 'field'), me.lastMergeColumn);
                        var i = 0;
                        Ext.each(colArray, function (v, z) {
                            var recValue  = test.split('@')[z+i];
                            if(!recValue){
                                recValue = '합';
                            }
                            retObj[v] = recValue;

                            var colConfig = groupColumn.mergeConfig[z];
                            if (groupColumn.mergeConfig[z]) {
                                retObj[colConfig.field+colConfig.cond] = colConfig.value;
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

                rStore.resumeEvents();
                me.callMerge(rStore);
            });
        }
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
        rStore.sort([ // #5
            { property: me.lastMergeColumn, direction: 'ASC'} // #5
        ]);

        me.getView().refresh();
    }

});