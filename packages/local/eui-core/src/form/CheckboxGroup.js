/***
 *
 * ## Summary
 *
 * Ext.form.CheckboxGroup 확장. 스타일 적용
 *
 *      fieldLabel: '체크박스그룹',
 *      xtype: 'euicheckboxgroup',
 *      fieldLabel: '체크박스그룹',
 *      columns: 4,     // 컬럼수를 설정한다.
 *      // 뷰모델을 배열형태로 CHECKBOXGROUP: ['A1','A2'] 로 사용한다.
 *      bind:'{RECORD.CHECKBOXGROUP}',
 *      items: [
 *      // inputValue가 전달된다.
 *          { boxLabel: 'Item 1', inputValue: 'A1' },
 *          { boxLabel: 'Item 2', inputValue: 'A2'},
 *          { boxLabel: 'Item 3', inputValue: 'A3' },
 *          { boxLabel: 'Item 4', inputValue: 'A4' }
 *      ]
 *
 * # Sample
 *
 *     @example
 *
 *      Ext.define('CheckboxGroup', {
 *          extend: 'eui.form.Panel',
 *          defaultListenerScope: true,
 *          viewModel: {
 *
 *          },
 *          title: '체크박스그룹',
 *          items: [
 *             {
 *               xtype: 'euicheckboxgroup',
 *               fieldLabel: '체크박스그룹',
 *               itemId: 'euicheckboxgroup',
 *               columns: 4,
 *               bind:'{RECORD.CHECKBOXGROUP}',
 *               items: [
 *                  {   boxLabel: 'KOREA', inputValue: 'KOREA' },
 *                  {   boxLabel: 'JAPAN', inputValue: 'JAPAN' },
 *                  {   boxLabel: 'USA', inputValue: 'USA' },
 *                  { boxLabel: 'RUSIA', inputValue: 'RUSIA' }
 *               ]
 *             }
 *          ],
 *          bbar: [
 *              {
 *                  text: '전체 체크',
 *                  xtype : 'euibutton',
 *                  handler: 'checkBoxgroupAllCheck'
 *              },
 *              {
 *                  text: '전체 체크해제',
 *                  xtype : 'euibutton',
 *                  handler: 'checkBoxgroupAllUnCheck'
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
 *                  CHECKBOXGROUP : ['KOREA','JAPAN','USA']
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
 *          checkBoxgroupAllCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue(['KOREA','JAPAN','USA','RUSIA']);
 *          },
 *
 *          checkBoxgroupAllUnCheck: function(button){
 *              this.down('#euicheckboxgroup').setValue();
 *          }
 *      });
 *
 *      Ext.create('CheckboxGroup',{
 *          width: 300,
 *          renderTo: Ext.getBody()
 *      });
 *
 **/

Ext.define('eui.form.CheckboxGroup', {
    extend: 'Ext.form.CheckboxGroup',
    xtype: 'euicheckboxgroup',
    mixins: [
        'eui.mixin.FormField'
    ],
    cellCls: 'fo-table-row-td',
    width: '100%',

    /***
     * object 아래 배열을 단순 배열로 처리하기 위한 로직을 기존 로직에 추가함.
     * @param value
     * @returns {euicheckboxgroup}
     */
    setValue: function(value) {
        var me    = this,
            boxes = me.getBoxes(),
            b,
            bLen  = boxes.length,
            box, name,
            cbValue,
            tmpValue;
        // 추가로직 object 이하에 배열정보 포함시.
        if (!Ext.isArray(value)) {
            for (var test in value) {
                tmpValue = value[test];
            }
            if (!Ext.isArray(tmpValue)){
                tmpValue = [tmpValue];
            }
            value = tmpValue;
        }

        me.batchChanges(function() {
            Ext.suspendLayouts();
            for (b = 0; b < bLen; b++) {
                box = boxes[b];
                name = box.getName();
                cbValue = false;

                if (value) {
                    if (Ext.isArray(value)) {
                        cbValue = Ext.Array.contains(value, box.inputValue);
                    } else {
                        // single value, let the checkbox's own setValue handle conversion
                        cbValue = value[name];
                    }
                }

                box.setValue(cbValue);
            }
            Ext.resumeLayouts(true);
        });
        return me;
    },
    initComponent: function () {
        this.setAllowBlank();
        this.callParent(arguments);
    }
});