/*!
 * Ext JS GridFilter plugin v0.1
 * https://github.com/roberto-rodriguez/ExtJs_GridFilterPlugin
 *
 *
 * Copyright 2016 Roberto Rodriguez
 * Licensed under GNU General Public License v3.
 * http://www.gnu.org/licenses/
 *
 *
 * @class Ext.ux.grid.GridFilter
 * @extends Ext.AbstractPlugin
 *
 * Grid plugin that adds filtering row below grid header.
 * Allows remote filtering, supports pagination grids.
 *
 * To add filtering to column, define "filter" property in the column configuration
 *
 *
 * <b>What it does?</b>
 * When the user adds criterias to the filter and hits enter,
 * The plugin reload the grid, including in the query params the values of the filters
 *
 * The values are collected just for the filters that are not empty,
 *  and are sent to the server in the format:
 *   dataIndex:VALUE    // Example  firstName: 'Roberto'
 *
 *
 *
 Example:

 var grid = new Ext.grid.GridPanel({
 columns: [
 {
 text: "User ID",
 dataIndex: 'userId',
 filter: true
 },
 {
 text: "First Name",
 dataIndex: 'firstName',
 filter: true
 },
 {
 text: "First Name",
 dataIndex: 'firstName',
 filter: lastName
 }
 ],
 plugins:[{ptype:"gridFilter"}]
 ...
 });
 */
Ext.define('eui.ux.grid.GridFilter', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gridFilter',
    init: function (grid) {
        var me = this;
        var store = grid.getStore();
        if (grid.getBind()['store']) {
            store = grid.lookupViewModel().getStore(grid.getBind()['store'].stub.name);
            store.on('load', function () {
//               debugger;
            });
        }
        console.log('store', store)
        grid.relayEvents(store, [
            'viewready',
            'load',
            'beforeload',
            'sortchange'
        ]);
        grid.addListener('beforeload', me.onBeforeLoad);
        grid.addListener('viewready', function () {
            Ext.defer(function () {
                me.storeload(grid)
            }, 300)
        });
        grid.addListener('load', function () {
            Ext.defer(function () {
                me.storeload(grid)
            }, 200)
        });
        grid.on('resize', function () {
            Ext.defer(function () {
                me.storeload(grid)
            }, 300)
        })
//
//        grid.addListener('sortchange', function () {
//            me.storeload(grid)
//        });
    },
    storeload: function (gg) {
//debugger;
        var me = this;
        if (gg) {
            me = gg;
        }
        console.log('storeload..', me);
        var body = me.body.dom;

//        Ext.defer(function () {
        var container = body.getElementsByClassName('x-grid-item-container')[0];
        var __table = container.childNodes[0];
        if (!__table) {
            return;
        }
        if( me.el.dom.getElementsByClassName('filter-table')[0]){
//            debugger;
            Ext.get(me.el.dom.getElementsByClassName('filter-table')[0]).destroy();
        }


        var __tbody = __table.getElementsByTagName('tbody')[0];
        var tr1 = __tbody.childNodes[0];
        if (tr1) {
            me['tr1'] = tr1;
        } else {
            if (me['tr1']) {
                tr1 = me['tr1'];
            } else {
                return;
            }
        }
        var table = document.createElement('table');
        table.setAttribute('class','filter-table');
        var tbody = document.createElement('tbody');
        table.appendChild(tbody);
        var newTr = document.createElement('tr');

        var tr_nodes = Ext.Array.clone(tr1.childNodes);
        var columns = Ext.pluck(Ext.Array.clone(me.columns), 'initialConfig');
        if (tr_nodes[0].getAttribute('class').indexOf('x-grid-cell-checkcolumn') != -1) {
            columns.unshift({
                filter: false
            })
        }

        for (var i = 0; i < tr_nodes.length; i++) {
            var td = document.createElement('td');
            td.setAttribute("style", tr_nodes[i].getAttribute('style') + "padding:1px 1px;border: solid gray 1px;");
//            if (tr_nodes[i].getAttribute('class').indexOf('x-grid-cell-checkcolumn') != -1){
//
//            }else {
            if (columns[i].filter) {
                var input = document.createElement('input');
                input.setAttribute("style", "width:100%");
                input.setAttribute("name", columns[i].dataIndex);
                if (me.filters && me.filters[columns[i].dataIndex]) {
                    input.value = me.filters[columns[i].dataIndex];
                }
                input.onkeyup = function (event) {
                    if (event.keyCode === 13) {
                        var tr = event.target.parentNode.parentNode;
                        var searchParams = {};
                        for (var j = 0; j < tr.childNodes.length; j++) {
                            if (tr.childNodes[j].childNodes[0] && tr.childNodes[j].childNodes[0].value) {
                                searchParams[tr.childNodes[j].childNodes[0].name] = tr.childNodes[j].childNodes[0].value;
                            }
                        }
                        me['filters'] = searchParams;
                        var clonedSearchParams = {
                            //for avoid include start and page in the global var
                            start: 0,
                            page: 1
                        };
                        for (var key in searchParams) {
                            clonedSearchParams[key] = searchParams[key];
                        }
                        me.store.load({
                            params: clonedSearchParams
                        });
                        me.store.currentPage = 1;
                    }
                };
                td.appendChild(input);
            }else{
                td.setAttribute('class','x-grid-item x-grid-item-selected');
            }
            newTr.appendChild(td);
        }
        tbody.appendChild(newTr);
//        container.insertBefore(table, __table);
        me.el.dom.getElementsByClassName('x-grid-body')[0].insertBefore(table, me.el.dom.getElementsByClassName('x-grid-view')[0]);
//debugger;
//        me.el.dom.getElementsByClassName('x-grid-view')[0]
//        me.el.dom.getElementsByClassName('x-grid-body')[0]
//        },1000)


    },
    onBeforeLoad: function (store, operation, eOpts) {
        var me = this;
        if (me.filters) {
            store.getProxy().extraParams = me.filters;
        }
        if (!me['pageSize']) {
            me['pageSize'] = --store.pageSize;
            store.getProxy().extraParams['limit'] = me['pageSize'];
        }
    }
});