/***
 *
 * ## Summary
 *
 * Ext.form.field.Text 확장. 스타일 적용
 *
 * ## 사용예
 *
 *      fieldLabel: '텍스트',
 *      xtype: 'euitext',
 *      bind: '{RECORD.TEXTFIELD}'
 *
 * # Sample
 *
 * Ext.form.field.Checkbox를 확장했다. 기존 클래스가 true, false, 1, on을 사용한다면
 * 이 클래스는 Y와 N 두가지를 사용한다.
 *
 *     @example
 *
 *      Ext.define('Panel', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          tableColumns: 1,
 *          items: [
 *             {
 *               fieldLabel: '텍스트',
 *               itemId: 'formfield',
 *               xtype: 'euitext',
 *               bind: '{RECORD.TEXTFIELD}'
 *             }
 *          ],
 *          bbar: [
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
 *                  TEXTFIELD : '대한민국'
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
 *          }
 *      });
 *
 *      Ext.create('Panel',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/
Ext.define('eui.form.field.Text', {
    extend: 'Ext.form.field.Text',
    alias: 'widget.euitext',
    cellCls: 'fo-table-row-td',
    width: '100%',
    fieldStyle: {
        display: 'inherit'
    }
});