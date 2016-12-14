/***
 *
 * ## Summary
 *
 * 폼필드 공통 제어
 */
Ext.define("eui.mixin.FormField", {
    extend: 'Ext.Mixin',

    mixinConfig: {

    },

    /**
     * 폼필드의 allowBlank:false일 경우
     * *를 표시하도록한다.
     */
    setAllowBlank: function () {
        if(this.allowBlank!==undefined && !this.allowBlank){
            if(this.fieldLabel){
                this.fieldLabel = '<span style="color:red">*</span>'+this.fieldLabel;
            }
        }
    },

    /**
     * 사용하지 않음.. simpleValue: true로 해결.
     * 체크박스그룹과 라디오그룹에 바인드변수
     * 사용 편의를 위한 메소드.
     */
    setCheckboxGroupRadioGroupBindVar: function () {
        if(!this.getBind()){
            return;
        }

        var me = this,
            bind = this.getBind(),
            name = bind.value.stub.name,
            path = bind.value.stub.path,
            recordVar = path.split('.')[0];
        this.name = name;
        this.setViewModel({
            formulas: {
                radioValue: {
                    bind: '{'+path+'}',
                    get: function (value) {
                        var model = this.get(recordVar);
                        if (model.isModel && this.get(recordVar).getFields().length > 0 && (this.get(recordVar).validate().map[name])) {
                            me.allowBlank = false;
                        }
                        var ret = {};
                        ret[name] = value;
                        return ret;

                    },
                    set: function (value) {
                        this.set(path, value[name]);
                    }
                }
            }
        });

        this.setBind({
            value: '{radioValue}'
        });
    },

    /***
     * numberfield 등 폼필드
     * bind설정에 경우 클래스 내부 기본값을 지워버리는 현상
     * 을 해결하기 위함.
     * @param value
     */
    setCustomDefaultValue: function (field) {
        if (!field.getBind()) {
            return;
        }
        var me = this,
            viewModelVar = field.getBind().value.stub.path;
        if (field.getBind() && field.getBind()['value'] && (field.getBind().value.stub.hadValue == undefined)) {
            me.getViewModel().set(viewModelVar, field.getValue());
        }
    }

});