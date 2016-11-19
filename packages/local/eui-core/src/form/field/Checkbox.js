/***
 *
 * ## Summary
 *
 * checkbox의 값은 기본으로 'Y', 'N'으로 한다.
 * getValue()에서 return시 true, false 대신 Y, N을 반환.
 * 이 클래스는 뷰모델의 바인딩이 필수 입니다.
 *
 * ## 사용예
 *
 *      fieldLabel: '체크박스',
 *      xtype: 'euicheckbox',
 *      // case1 체크 해제.
 *      bind: {
 *          value : 'N'     // 체크해제
 *      },
 *      // case 2 체크
 *      bind: {
 *          value : 'Y'
 *      },
 *      // case 3 뷰모델 설정.
 *      bind: '{FORMRECORD.fiedl1}'
 *      또는
 *      bind : {
 *          value: '{FORMRECORD.fiedl1}'
 *      }
 *
 * # Values
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.define('Checkbox', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          title: '체크박스',
 *          items: [
 *             {
 *               fieldLabel: '체크박스',
 *               itemId: 'checkbox1',
 *               xtype: 'euicheckbox',
 *               bind: '{RECORD.CHECKBOX1}'
 *             },
 *             {
 *               fieldLabel: '체크박스',
 *               xtype: 'euicheckbox',
 *               bind: {
 *                  value : 'Y'
 *               }
 *             },
 *             {
 *               fieldLabel: '체크박스',
 *               xtype: 'euicheckbox',
 *               bind: {
 *                  value : 'N'
 *               }
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '체크',
 *                  xtype : 'euibutton',
 *                  handler: 'checkboxHandler'
 *              },
 *              {
 *                  text: '체크해제',
 *                  xtype : 'euibutton',
 *                  handler: 'unCheckboxHandler'
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
 *                  CHECKBOX1 : 'N'
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
 *          checkboxHandler: function(button){
 *              this.down('#checkbox1').setValue('Y');
 *              //this.down('#checkbox1').setValue(true);
 *          },
 *
 *          unCheckboxHandler: function(button){
 *              this.down('#checkbox1').setValue('N');
 *              this.down('#checkbox1').setValue(false);
 *          }
 *      });
 *
 *      Ext.create('Checkbox',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/

Ext.define('eui.form.field.Checkbox', {
    extend: 'Ext.form.field.Checkbox',
    alias: 'widget.euicheckbox',
    inputValue: 'Y',
    uncheckedValue: 'N',
    cellCls: 'fo-table-row-td',
    width: '100%',

    initComponent: function() {
        var me = this;
        me.callParent(arguments);
    },

    /***
     * Y & N 을 반환한다.
     * @returns {string}
     */
    getValue: function() {
        var unchecked = this.uncheckedValue,
            uncheckedVal = Ext.isDefined(unchecked) ? unchecked : null;
        return this.checked ? this.inputValue : uncheckedVal;
    }
});