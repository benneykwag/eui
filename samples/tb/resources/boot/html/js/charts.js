$(document).ready(function(){        
    
    if($("#dash_chart_1").length > 0){
        
        var data  = [ [1, 25], [2, 28], [3, 22], [4, 18], [5, 30], [6, 18], [7,14] ];        
        
        var dash_chart_1 = $.plot($("#dash_chart_1"), [{ data: data, label: "Sales"}],{ 
                                  series: {lines: { show: true }, points: { show: true }},
                                  grid: { hoverable: true, clickable: true, margin: {left: 110}},
                                  xaxis: {ticks: [[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[7,'Sun']]},
                                  legend: {show: false}});          
        
    }
    
    if($("#dash_chart_2").length > 0){
        
        var data1  = [ [1, 1023], [2, 1244], [3, 1506], [4, 1330], [5, 1065], [6, 890], [7,650] ];
        var data2  = [ [1, 868], [2, 1485], [3, 1355], [4, 1002], [5, 1200], [6, 755], [7,800] ];
        
        var dash_chart_2 = $.plot($("#dash_chart_2"), [{ data: data1, label: "Search Traffic"},{data: data2, label: "Referal Traffic"}],{ 
                                  series: {lines: { show: true }, points: { show: true }},
                                  grid: { hoverable: true, clickable: true},
                                  xaxis: {max: 7,ticks: [[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[7,'Sun']]}
                              });          
        
    }    
    
    if($("#chart_line_1").length > 0){
        var sin = [], cos = [], sin2 = [];

        for (var i = 0; i < 14; i += 0.3) {
            sin.push([i, Math.sin(i)]);            
            sin2.push([i, Math.sin(i-1.57)]);
            cos.push([i, Math.cos(i)]);            
        }        
        var chart_line_1 = $.plot($("#chart_line_1"), [{ data: sin, label: "sin(x)"}, { data: cos, label: "cos(x)"}, { data: sin2, label: "sin(y)"}],{ 
                                  series: {lines: { show: true }, points: { show: true }},
                                  grid: { hoverable: true, clickable: true },
                                  yaxis: { min: -1.1, max: 1.1 } });                
    }
    
    if($("#chart_bar_1").length > 0){
       
        var data1 = [ [1, 25], [2, 28], [3, 22], [4, 18], [5, 30], [6, 18] ];
        var data2 = [ [1, 15], [2, 22], [3, 16], [4, 12], [5, 25], [6, 7] ];
        var data3 = [ [1, 10], [2, 16], [3, 10], [4, 6], [5, 18], [6, 3] ];
        
        
        var chart_bar_1 = $.plot($("#chart_bar_1"), [ { data: data1, label: "Data 1" }, { data: data2, label: "Data 2" }, { data: data3, label: "Data 3" }], {                                   
                                   series: { stack: 0, bars: { show: true, barWidth: 0.8, align: "center"}},                                
                                   grid: { hoverable: true, clickable: true }});                        
    }

    if($("#chart_bar_2").length > 0){
        
        
        var chart_bar_2 = $.plot($("#chart_bar_2"), [ { data: data1, label: "Data 1" }, { data: data2, label: "Data 2" }, { data: data3, label: "Data 3" }], {                                   
                                   series: { stack: 0, 
                                             lines: {show: true,fill: true},
                                             bars: { show: false }},                                
                                   grid: { hoverable: true, clickable: true }});                        
    }
    
    if($("#chart_pie_1").length > 0){
        
        var data = [];            
            data[0] = { label: "Data 1", data: 40 };
            data[1] = { label: "Data 2", data: 30 };
            data[2] = { label: "Data 3", data: 30 };
        
        $.plot("#chart_pie_1", data, {
            series: {pie: {radius: 1, show: true, 
                           label: {show: true, radius: 2/3, formatter: labelFormatter, threshold: 0.1}
                          }
                    },
            legend: {show: false}
        });     
      
    }
    
    if($("#chart_user_1").length > 0){
        var data1  = [ [1, 45], [2, 35], [3, 57], [4, 75], [5, 80] ];
        var data2  = [ [1, 55], [2, 65], [3, 43], [4, 25], [5, 20], [6, 75], [7,85] ];
        var data3  = [ [6, 25], [7,15] ];
        
        var chart_user_1 = $.plot($("#chart_user_1"), [{ data: data1, label: "Leo"},{data: data2, label: "Taurus"},{data: data3, label: "Aries"}],{ 
                                  series: {lines: { show: true }, points: { show: true }},
                                  grid: { hoverable: true, clickable: true},
                                  xaxis: {max: 7,ticks: [[1,'Mon'],[2,'Tue'],[3,'Wed'],[4,'Thu'],[5,'Fri'],[6,'Sat'],[7,'Sun']]}
                              });               
    }
    
    if($("#chart_series_onoff").length > 0){
                
            var datasets = {
                "usa": {
                        label: "USA",
                        data: [[1988, 483994], [1989, 479060], [1990, 457648], [1991, 401949], [1992, 424705], [1993, 402375], [1994, 377867], [1995, 357382], [1996, 337946], [1997, 336185], [1998, 328611], [1999, 329421], [2000, 342172], [2001, 344932], [2002, 387303], [2003, 440813], [2004, 480451], [2005, 504638], [2006, 528692]]
                },        
                "russia": {
                        label: "Russia",
                        data: [[1988, 218000], [1989, 203000], [1990, 171000], [1992, 42500], [1993, 37600], [1994, 36600], [1995, 21700], [1996, 19200], [1997, 21300], [1998, 13600], [1999, 14000], [2000, 19100], [2001, 21300], [2002, 23600], [2003, 25100], [2004, 26100], [2005, 31100], [2006, 34700]]
                },
                "uk": {
                        label: "UK",
                        data: [[1988, 62982], [1989, 62027], [1990, 60696], [1991, 62348], [1992, 58560], [1993, 56393], [1994, 54579], [1995, 50818], [1996, 50554], [1997, 48276], [1998, 47691], [1999, 47529], [2000, 47778], [2001, 48760], [2002, 50949], [2003, 57452], [2004, 60234], [2005, 60076], [2006, 59213]]
                },
                "germany": {
                        label: "Germany",
                        data: [[1988, 55627], [1989, 55475], [1990, 58464], [1991, 55134], [1992, 52436], [1993, 47139], [1994, 43962], [1995, 43238], [1996, 42395], [1997, 40854], [1998, 40993], [1999, 41822], [2000, 41147], [2001, 40474], [2002, 40604], [2003, 40044], [2004, 38816], [2005, 38060], [2006, 36984]]
                },
                "denmark": {
                        label: "Denmark",
                        data: [[1988, 3813], [1989, 3719], [1990, 3722], [1991, 3789], [1992, 3720], [1993, 3730], [1994, 3636], [1995, 3598], [1996, 3610], [1997, 3655], [1998, 3695], [1999, 3673], [2000, 3553], [2001, 3774], [2002, 3728], [2003, 3618], [2004, 3638], [2005, 3467], [2006, 3770]]
                },
                "sweden": {
                        label: "Sweden",
                        data: [[1988, 6402], [1989, 6474], [1990, 6605], [1991, 6209], [1992, 6035], [1993, 6020], [1994, 6000], [1995, 6018], [1996, 3958], [1997, 5780], [1998, 5954], [1999, 6178], [2000, 6411], [2001, 5993], [2002, 5833], [2003, 5791], [2004, 5450], [2005, 5521], [2006, 5271]]
                },
                "norway": {
                        label: "Norway",
                        data: [[1988, 4382], [1989, 4498], [1990, 4535], [1991, 4398], [1992, 4766], [1993, 4441], [1994, 4670], [1995, 4217], [1996, 4275], [1997, 4203], [1998, 4482], [1999, 4506], [2000, 4358], [2001, 4385], [2002, 5269], [2003, 5066], [2004, 5194], [2005, 4887], [2006, 4891]]
                }
        };

        var i = 0;
        $.each(datasets, function(key, val) {
                val.color = i;
                ++i;
        });

        var choiceContainer = $("#choices");

        choiceContainer.find("input").click(plotAccordingToChoices);

        function plotAccordingToChoices() {

            var data = [];

            choiceContainer.find("input:checked").each(function () {
                var key = $(this).attr("name");
                if (key && datasets[key]) {
                    data.push(datasets[key]);
                }
            });

            if (data.length > 0) {                    
                $.plot("#chart_series_onoff", data, {
                    yaxis: {
                        min: 0
                    },
                    xaxis: {
                        tickDecimals: 0
                    }
                });
            }
                
        }

        plotAccordingToChoices();
       
    }
    
    
    
    function labelFormatter(label, series) {
        return "<div style='text-shadow: 1px 2px 1px rgba(0,0,0,0.2); font-size: 11px; text-align:center; padding:2px; color: #FFF; line-height: 13px;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
    }
    
    function showTooltip(x, y, contents) {
        $('<div class="ftooltip">' + contents + '</div>').css({
            position: 'absolute',
            'z-index': '10',
            display: 'none',
            top: y - 20,
            left: x,            
            padding: '3px',
            'background-color': 'rgba(0,0,0,0.5)',
            'font-size': '11px',
            'border-radius': '3px',
            color: '#FFF'            
        }).appendTo("body").fadeIn(200);
    }    

    var previousPoint = null;
    
 
    $("#chart_bar_1,#chart_bar_2,#chart_line_1,#dash_chart_1,#dash_chart_2,#chart_user_1").bind("plothover", function (event, pos, item) {
        
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));

        if (item) {
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;

                $(".ftooltip").remove();
                var x = item.datapoint[0].toFixed(2),
                    y = item.datapoint[1].toFixed(2);

                showTooltip(item.pageX, item.pageY,
                            item.series.label + ": " + y);
            }
        }else {
            $(".ftooltip").remove();
            previousPoint = null;            
        }

    });    
    
    
});

$(window).resize(function(){

});