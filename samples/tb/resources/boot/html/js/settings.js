$(document).ready(function(){

    local_get();

    var theme = $('.container').attr('class');

        theme = $.trim(theme.replace("container","").replace("fixed",""));
        if(theme == '')
            theme = 'default';

    var themeToBackground = new Array();
        themeToBackground['default'] = ['bg-img-num1','bg-img-num2','bg-img-num3','bg-img-num4','bg-img-num5','bg-img-num6','bg-img-num7','bg-img-num8'];
        themeToBackground['theme-black'] = ['wall-num6'];
        themeToBackground['theme-white'] = ['wall-num1'];
        themeToBackground['theme-dark'] = ['bg-img-num9','bg-img-num10','bg-img-num11','bg-img-num12','bg-img-num13','bg-img-num14','bg-img-num15','bg-img-num16'];
        themeToBackground['theme-green'] = ['bg-img-num17','bg-img-num18','bg-img-num19','bg-img-num20'];

    $.get("../../../resources/boot/html/assets/settings.html",function(data){
        $("body").append(data);

        $(".ss_theme[data-value="+theme+"]").addClass('active');

        if(theme != 'default')
            $(".container").addClass(theme);

        $("#ss_backgrounds").html(buildBackgroundsList(theme,themeToBackground));

        $(".ss_background[data-value="+$("body").attr("class")+"]").addClass('active');

    });

    $(".site-settings-button").live("click",function(){
        if($(this).parent('.site-settings').hasClass('active'))
            $(this).parent('.site-settings').removeClass('active');
        else{
            $(this).parent('.site-settings').addClass('active');

        $(this).parent('.site-settings').find('input:checkbox, input:radio').uniform();

        if($(".container").hasClass("container-fixed"))
            $(".ss_layout[value=fixed]").attr("checked",true).parent("span").addClass("checked");
        else
            $(".ss_layout[value=liquid]").attr("checked",true).parent("span").addClass("checked");
}
    });

    /* layout */
    $(".ss_layout").live("click",function(){
        if($(this).val() == 'fixed')
            $(".container").addClass("container-fixed");
        else
            $(".container").removeClass("container-fixed");

        $(this).attr("checked",true).parent("span").addClass("checked");
        local_save();
    });
    /* eof layout */

    /* themes and backgrounds */
    $(".ss_theme").live("click",function(){
        $(".container").removeClass('theme-dark theme-green theme-black theme-white theme-red');
        $(".ss_theme").removeClass('active')
        if($(this).attr('data-value') != 'default')
            $(".container").addClass($(this).attr('data-value'));

        $(this).addClass('active');
        $("#ss_backgrounds").html(buildBackgroundsList($(this).attr('data-value'),themeToBackground));

        $(".ss_background").removeClass("active");
        $(".ss_background[data-value="+themeToBackground[$(this).attr('data-value')][0]+"]").addClass('active');

        $("body").attr("class","").addClass(themeToBackground[$(this).attr('data-value')][0]);

        local_save();
        return false;
    });

    $(".ss_background").live("click",function() {
        $("body").attr("class","");
        $("body").addClass($(this).attr("data-value"));
        $(".ss_background").removeClass('active');
        $(this).addClass('active');
        local_save();
        return false;
    });

    /* eof background */

    if($("body").data("settings") == "open"){
        setTimeout(function(){
            $("body").find(".site-settings-button").trigger("click");
        },1500);
    }

});

function local_get(){
    if(typeof(Storage)!=="undefined"){
        if(localStorage.siteBackground != '') $('body').attr('class',localStorage.siteBackground);
        if(localStorage.siteContainer != '.container') $('.container').attr('class',localStorage.siteContainer);
    }
}

function local_save(){
    if(typeof(Storage)!=="undefined"){
        localStorage.siteBackground = $('body').attr('class');
        localStorage.siteContainer = $('.container').attr('class');
    }else{
        return false;
    }
}

function buildBackgroundsList(theme,t2b){
    var backgrounds = '';

    if(t2b[theme] && t2b[theme].length > 1){
        for(i=0;i<t2b[theme].length;i++)
            backgrounds += '<a class="ss_background '+t2b[theme][i]+'" data-value="'+t2b[theme][i]+'"></a> ';
    }else{
        for(var j in t2b){
            if(t2b[j].length == 1) continue;

            for(i=0;i<t2b[j].length;i++)
                backgrounds += '<a class="ss_background '+t2b[j][i]+'" data-value="'+t2b[j][i]+'"></a> ';
        }
    }

    return backgrounds;
}