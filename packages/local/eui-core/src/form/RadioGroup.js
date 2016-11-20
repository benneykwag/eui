/***
 *
 * ## Summary
 *
 * Ext.form.RadioGroup 확장. 스타일 적용
 *
 * ## 사용예
 *
 *      fieldLabel: '라디오그룹',
 *      xtype: 'euiradiogroup',
 *      items: [
 *          {
 *              boxLabel: 'INPUTVALUE: A',
 *              inputValue: 'A'
 *          },
 *          {
 *              boxLabel: 'INPUTVALUE: B',
 *              inputValue: 'B'
 *          }
 *      ],
 *      bind: '{RECORD.RADIOGROUP}'
 *
 * # Sample
 *
 *
 *     @example
 *
 *      Ext.define('RadioGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          items: [
 *              {
 *               xtype: 'euiradiogroup',
 *               allowBlank: false,
 *               fieldLabel: '라디오그룹',
 *               items: [
 *                  {
 *                      boxLabel: 'INPUTVALUE: A',
 *                      inputValue: 'A'
 *                  },
 *                  {
 *                      boxLabel: 'INPUTVALUE: B',
 *                      inputValue: 'B'
 *                  }
 *               ],
 *               bind: '{RECORD.RADIOGROUP}'
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  width: 150,
 *                  xtype: 'euicombo',
 *                  displayField: 'name',
 *                  valueField: 'code',
 *                  value: 'A',
 *                  listeners: {
 *                      select: 'setRadioGroup'
 *                  },
 *                  store: {
 *                      data: [
 *                          {
 *                              name: 'INPUTVALUE A',
 *                              code: 'A'
 *                          },
 *                          {
 *                              name: 'INPUTVALUE B',
 *                              code: 'B'
 *                          }
 *                      ]
 *                  }
 *              },
 *              {
 *                  text: '서버로전송',
 *                  xtype: 'euibutton',
 *                  handler: 'onSaveMember'
 *              }
 *         ],
 *
 *         listeners : {
 *              render: 'setRecord'
 *         },
 *
 *         setRecord: function () {
 *              this.getViewModel().set('RECORD', Ext.create('Ext.data.Model', {
 *                  RADIOGROUP : 'A'
 *               }));
 *         },
 *
 *         onSaveMember: function () {
 *              var data = this.getViewModel().get('RECORD').getData();
 *              Util.CommonAjax({
 *                  method: 'POST',
 *                  url: 'resources/data/success.json',
 *                  params: {
 *                      param: data
 *                  },
 *                  pCallback: function (v, params, result) {
 *                      if (result.success) {
 *                          Ext.Msg.alert('저장성공', '정상적으로 저장되었습니다.');
 *                      } else {
 *                          Ext.Msg.alert('저장실패', '저장에 실패했습니다...');
 *                      }
 *                  }
 *             });
 *          },
 *
 *          setRadioGroup: function (combo, record) {
 *              var rg = this.down('euiradiogroup');
 *              rg.setValue(record.get(combo.valueField))
 *          }
 *      });
 *
 *      Ext.create('RadioGroup',{
 *          width: 500,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/

Ext.define('eui.form.RadioGroup', {
    extend: 'Ext.form.RadioGroup',
    xtype: 'euiradiogroup',

    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',

    simpleValue: true,

    initComponent: function () {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});