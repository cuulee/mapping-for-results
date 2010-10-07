jq(function() {
    jq(".collapsible-header").click(function () {
        if(jQuery(this).hasClass("expanded")) {
            jq("#collapsible-banner").hide("blind", { direction: "vertical" }, 2000);
            jq(this).removeClass("expanded").addClass("collapsed");      
        } else {
            jq("#collapsible-banner").show("blind", { direction: "vertical" }, 2000);
            jq(this).removeClass("collapsed").addClass("expanded");  
        }
    });

    jq("#locations_list .inactive").click(function () {
        return false;
    });

    jq.each(wb.sectors, function(sector_name, sector_attrs) {
        jq('#sectorcontrol_' + sector_name).tipsy({gravity:  jq.fn.tipsy.autoNS});
        jq('#sectorcontrol_' + sector_name).click(function(){
            return wb.toggleSector(sector_name);
        })
    });
    jq('#sall').click(function(){
        wb.toggleSector('all');
    });
});