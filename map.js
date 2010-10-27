var proxy_host = "http://wbstaging.geocommons.com";    
//var project_attributes = ["project title", "project id", "financing", "sector1", "approval date"];
var project_attributes = ["id","project_name","totalamt","mjsector1","boardapprovaldate"]

// , "General agriculture, fishing and forestry sector":"agriculture"
if(typeof(F1)=='undefined') {F1 = {}}
(function(){
    

  Object.size = function(obj) {
      var size = 0, key;
      for (key in obj) {
          if (obj.hasOwnProperty(key)) size++;
      }
      return size;
  };

  Object.include = function(arr, obj) {
    for(var i=0; i<arr.length; i++) {
      if (arr[i] == obj) return i;
    }
    return null;
  }

  Array.prototype.flatten = function flatten(){
     var flat = [];
     for (var i = 0, l = this.length; i < l; i++){
         var type = Object.prototype.toString.call(this[i]).split(' ').pop().split(']').shift().toLowerCase();
         if (type) { flat = flat.concat(/^(array|collection|arguments)$/.test(type) ? flatten.call(this[i]) : this[i]); }
     }
     return flat;
  };

  String.prototype.capitalize = function(){
    return this.replace( /(^|\s)([a-z])/g , function(m,p1,p2){ return p1+p2.toUpperCase(); } );
  };  
  
  F1.WorldBank = function(options) {  //constructor
    this.options = options;
    // F1.WorldBank.instances[options.id] = this;
  }

  F1.WorldBank.indicators = {
    "Poverty": {source: "finder:", title:"Poverty", subtitle: "Headcount Index", styles: { type: "CHOROPLETH",fill: { colors: [16709541,16698989,15500308,11422722,6694150], categories: 5, classificationNumClasses: 6, classificationType: "St Dev", opacity: 0.75, selectedAttribute: "poverty" }}, infosubtitle: null, table: null, description: "<p>These data sets involve econometric or quantitative indirect estimation procedures that combine spatial precision (such as censuses) with substantive depth (such as surveys). They have been developed and implemented by the World Bank Development Economics Research Group and colleagues, in collaboration with country teams for the implementation of Poverty Reduction Strategy Programmes.</p><p>Though spatial information may be used in the process of generating these estimates, the spatial data is generally separated prior to the analysis, reporting and dissemination of the poverty estimates. Thus, CIESIN’s database of sub-national small area estimates contains poverty and inequality data with reconstructed boundary information, using basic geographic information system (GIS) tools. (Text obtained from the source of data at <a href='http://sedac.ciesin.columbia.edu/povmap/methods_nat_sae.jsp'>CIESIN</a>)</p><p>Source: <a href='http://www.measuredhs.com/'>Demographic and Health Surveys (DHS)</a></p>"},
    "Malnutrition": {source: "finder:", title:"Child Malnutrition", subtitle: "Percentile weight of Children under 5", styles: { type: "CHOROPLETH", stroke: {color: 0x222222}, fill: { colors: [15456706, 13744031, 10782317, 8151635, 4863020], categories: 5, classificationNumClasses: 5, classificationType: "EQUAL INTERVAL", opacity: 0.75, selectedAttribute: "WFAB2SD" }}, infosubtitle: null, table: null, description: "Prevalence of child malnutrition is the percentage of children under age 5 whose weight for age is more than two standard deviations below the median for the international reference population ages 0-59 months. The data are based on the WHO's new child growth standards released in 2006.\nSource: World Health Organization, Global Database on Child Growth and Malnutrition.\nCatalog Sources: World Development Indicators"},
    "Infant Mortality": {source: "finder:", title:"Infant Mortality Rate", subtitle: "Per 1,000 live births", styles: { type: "CHOROPLETH", stroke: {color: 0x222222}, fill: { colors: [0xFEE5D9, 0xFCAE91, 0xFB6A4A, 0xDE2D26, 0xA50F15], categories: 5, classificationNumClasses: 5, classificationType: "EQUAL INTERVAL", opacity: 0.75, selectedAttribute: "IM1q0"}}, infosubtitle: null, table: null, description: "Mortality rate, infant (per 1,000 live births) Infant mortality rate is the number of infants dying before reaching one year of age, per 1,000 live births in a given year.\nSource: Inter-agency Group for Child Mortality Estimation (UNICEF, WHO, World Bank, UNPD, universities and research institutions).\nCatalog Source: World Development Indicators"},  
    "Maternal Health": {source: "finder:", title:"Births attended by skilled health staff ", subtitle: "% of Total", styles: { type: "CHOROPLETH",stroke: {color: 0x222222}, fill: { colors: [5313667, 8608676, 12619965, 14924738, 16573399], categories: 5, classificationNumClasses: 5, classificationType: "EQUAL INTERVAL", opacity: 0.75, selectedAttribute: "DBHP"}}, infosubtitle: null,table: null, description: "Births attended by skilled health staff (% of total), are the percentage of deliveries attended by personnel trained to give the necessary supervision, care, and advice to women during pregnancy, labor, and the postpartum period; to conduct deliveries on their own; and to care for newborns.\nSource: UNICEF, State of the World's Children, Childinfo, and Demographic and Health Surveys by Macro International."},
    "Population": {source: "finder:", title:"Population", subtitle: "Total Number of People", styles: { type: "CHOROPLETH",stroke: {color: 0x222222}, fill: { colors: [0xEFF3FF, 0xBDD7E7, 0x6BAED6, 0x3182BD, 0x08519C], categories: 5, classificationNumClasses: 5, classificationType: "EQUAL INTERVAL", opacity: 0.75, selectedAttribute: "population from statoids"}}, infosubtitle: null, table: null, description: "The land area of the world is divided into countries (1). Most of the countries are, in turn, divided into smaller units. These units may be called states, provinces, regions, governorates, and so on. A phrase that describes them all is 'major administrative divisions of countries'.\n\nSource: <a href='http://www.statoids.com/ubo.html'>Statoids"}
	},
  F1.WorldBank.prototype = {
    init: function(map_id, region, country_attrs) {
      
      var self = this;
      this.activities = {};
      this.projects = country_attrs.projects;
      this.visibleSectors = [];
      
      if(country_attrs.regions != null)
        this.regions = country_attrs.regions;
      else
        this.regions = {};
        
      this.total_funding = 0;
      this.stylelayers = {};
      this.initialized = false;
      this.current_indicator = "Poverty";
      this.current_projects = true;
      this.region = region;
      this.country_attrs = country_attrs;
      // icons = {};
      // jq.each(self.sectors, function(sector) {
      //   icons[self.sectors[sector].name] = self.sectors[sector].icon;
      // });
      		
      this.wbicons = {"Agriculture, Fishing, and Forestry":"http://wbstaging.geocommons.com/images/icons/worldbank/agriculture-on.png","Communications":"http://wbstaging.geocommons.com/images/icons/worldbank/communication-on.png","Education":"http://wbstaging.geocommons.com/images/icons/worldbank/education-on.png","Energy and Mining":"http://wbstaging.geocommons.com/images/icons/worldbank/energy-on.png","Finance":"http://wbstaging.geocommons.com/images/icons/worldbank/finance-on.png","Health and Other Social Services":"http://wbstaging.geocommons.com/images/icons/worldbank/health-on.png","Industry and Trade":"http://wbstaging.geocommons.com/images/icons/worldbank/industry-on.png","Public Administration, Law, and Justice":"http://wbstaging.geocommons.com/images/icons/worldbank/public-on.png","Transportation":"http://wbstaging.geocommons.com/images/icons/worldbank/transportation-on.png","Water, Sanitation, and Flood Protection":"http://wbstaging.geocommons.com/images/icons/worldbank/water-on.png"};
      var color_index = 3;
      this.sectors = {
        "agriculture": {name: "Agriculture, Fishing, and Forestry", sector_code: "AX", color: self.fadeHex("#8bb131","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "agriculture", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/agriculture-on.png"}, 
        "communications": {name: "Communications", sector_code: "CX", color: self.fadeHex("#395f8f","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "communications", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/communication-on.png"},
        "education": {name: "Education", sector_code: "EX", color: self.fadeHex("#eebd00","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "education", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/education-on.png"}, 
        "energy": {name: "Energy and Mining", sector_code: "LX", color: self.fadeHex("#880000","#FFFFFF",10)[color_index],  funding: 0, projects: [], activities: 0, shortname: "energy", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/energy-on.png"},
        "finance": {name: "Finance", sector_code: "FX", color: self.fadeHex("#40823f","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "finance", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/finance-on.png"},
        "health": {name: "Health and Other Social Services", sector_code: "JX", color: self.fadeHex("#c23001","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "health", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/health-on.png"},
        "industry": {name: "Industry and Trade", sector_code: "YX", color: self.fadeHex("#7f4410","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "industry", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/industry-on.png"},
        "public": {name: "Public Administration, Law, and Justice", sector_code: "PX", color: self.fadeHex("#8060a4","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "public", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/public-on.png"},
        "water": {name: "Water, Sanitation, and Flood Protection", sector_code: "WX", color: self.fadeHex("#369fd0","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "water", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/water-on.png"},
        "transportation": {name: "Transportation", sector_code: "TX", color: self.fadeHex("#d28807","#FFFFFF",10)[color_index], funding: 0, projects: [], activities: 0, shortname: "transportation", icon: "http://wbstaging.geocommons.com/images/icons/worldbank/transportation-on.png"}};

      this.sector_names = {};
      this.sector_codes = {};
      jq.each(self.sectors, function(index, sector) {
          if(country_attrs.sectors != null && country_attrs.sectors[sector.name] != null) { 
            sector.funding = country_attrs.sectors[sector.name];
            self.total_funding += country_attrs.sectors[sector.name];
          }
          self.sector_names[sector.name] = index; 
          self.sector_codes[sector.sector_code] = sector;
     });
        
      this.map = new F1.Maker.Map( { dom_id:"wb_map",map_id:map_id, 
                uiZoom: true,uiLayers: false,uiLegend: false,uiStyles: true,
                uiHeader: true,hideGCLogo: true,hideGILogo: true,
                core_host:  proxy_host + '/', finder_host:proxy_host + '/', maker_host: proxy_host + '/',
                onload: function() { self.loadedMap() }
      });
    },
    setBookmark: function(key, value) {
      
    },
    setState: function(location,indicator,project,sectors) {
      var self = this;
      if(location != null)
        setLocation("",location.lat,location.lon,location.zoom);
      if(indicator != null)
        this.setIndicator(indicator);
      if(sectors != null){
        jq.each(sectors, function(sector) {
          self.toggleSector(sectors[sector], true);
        })
          
      } else {
        this.toggleSector('none', false)
      }
      return false;
    },
    setLocation: function(region,lat,lon,zoom) {
      // this.setBookmark('region', region);
      this.map.swf.setCenterZoom(lat,lon,zoom);
      return false;
    },
    hideSectors: function() {
      var self = this;
      jq.each(self.sectors, function (sector) {
        self.map.addFilter(self.stylelayers["Project Locations"].order, {expression: "$[sector1] == " + self.sectors[sector].shortname});
      });
      return false;
    },
    setMapTitle: function() {
      var title = "";
      if(this.current_projects)
        title += "Projects by ";
      if(this.current_indicator)
        title += this.current_indicator;
        
      jq('#map-title').html(title)
      return false;
    },
    toggleSector: function(sector,visible,refreshCharts) {
      var self = this;
      var visibleExpression = "";

      // World Map
      if(self.stylelayers["Project Locations"] == null)
        return;
        
      self.current_projects = visible;
      
      if(sector == "none") {
        self.map.showLayer(self.stylelayers["Project Locations"].order, visible);
        self.map.showLayer(self.stylelayers["Project Counts"].order, visible);        
      } else if(sector == 'all') {
        if(visible == null)
          visible = (jq("#sall").is(':checked'));
          

        if(visible) {
          self.map.swf.clearFilters(self.stylelayers["Project Locations"].order);
          jq.each(self.sectors, function(sector) {
            if(Object.include(self.visibleSectors, sector) == null)
              self.visibleSectors.push(sector);
          });
        } else {
          self.map.swf.clearFilters(self.stylelayers["Project Locations"].order);
          self.visibleSectors = [];
        }
        
        jq("#sall").attr('checked', visible);
        self.map.showLayer(self.stylelayers["Project Locations"].order, visible);
        self.map.showLayer(self.stylelayers["Project Counts"].order, !visible);
        jq('#layercontrol_sectors').html("By Sector");
      } else if(sector == 'counts_admin1') {
        self.map.showLayer(self.stylelayers["Project Counts"].order, visible);
        self.map.swf.clearFilters(self.stylelayers["Project Counts"].order);
        self.map.swf.addFilter(self.stylelayers["Project Counts"].order, {expression: "$[admprecision] == 'ADM1'"});
        self.map.showLayer(self.stylelayers["Project Locations"].order, !visible);
        jq('#layercontrol_sectors').html("Project Count");
      } else if(sector == 'counts_admin2') {
        self.map.showLayer(self.stylelayers["Project Counts"].order, visible);
        self.map.swf.clearFilters(self.stylelayers["Project Counts"].order);
        self.map.swf.addFilter(self.stylelayers["Project Counts"].order, {expression: "$[admprecision] == 'ADM2'"});

        self.map.showLayer(self.stylelayers["Project Locations"].order, !visible);        
        jq('#layercontrol_sectors').html("Project Count");
      } else if(sector == 'counts') {
        self.map.showLayer(self.stylelayers["Project Counts"].order, visible);
        self.map.showLayer(self.stylelayers["Project Locations"].order, !visible);
      } else if(sector == null) {
        self.map.showLayer(self.stylelayers["Project Locations"].order, false);
        self.map.showLayer(self.stylelayers["Project Counts"].order, false);
      } else {
        jq("#sall").attr('checked', false);          
        if(visible == null)
          visible = !(jq("#sectorcontrol_" + sector).hasClass('active'));

        if(visible == true){
          self.map.showLayer(self.stylelayers["Project Counts"].order, false);
          self.map.showLayer(self.stylelayers["Project Locations"].order, false);
          self.map.swf.removeFilter(self.stylelayers["Project Locations"].order, 
          {expression: self.complexSectorExpression(self.visibleSectors)});

          if(Object.include(self.visibleSectors, sector) == null) {
            self.visibleSectors.push(sector);    

            self.map.swf.addFilter(self.stylelayers["Project Locations"].order, 
            {expression: self.complexSectorExpression(self.visibleSectors)});
          }

          self.map.showLayer(self.stylelayers["Project Locations"].order, true);
          jq('#layercontrol_sectors').html("By Sector");

        } else if(visible == false){
          // self.map.showLayer(self.stylelayers["Project Counts"].order, false);
          self.map.swf.removeFilter(self.stylelayers["Project Locations"].order, 
          {expression: self.complexSectorExpression(self.visibleSectors)});
          self.visibleSectors = jQuery.grep(self.visibleSectors, function(value) {
            return value != sector;
          });
          self.map.swf.addFilter(self.stylelayers["Project Locations"].order, {expression: self.complexSectorExpression(self.visibleSectors)});
          jq('#layercontrol_sectors').html("Projects");
        }
      }
      self.setMapTitle();
      self.showVisibleSectors();
      //jq('#sector_funding_description').html("Description about " + sector);
      if(refreshCharts == null || refreshCharts == true)
        self.sectorPieChart(sector, false);
      return false;
    },
    showVisibleSectors: function() {
      var self = this;
      var sectorcontrols = jq('.sectorcontrol');
      
      jq.each(sectorcontrols, function(index, sc) {
        var sector_dom = jq("#" + sc.id);
        var sector = sector_dom.attr("sector-name");

        if(Object.include(self.visibleSectors, sector) != null) {
          sector_dom.removeClass('inactive').addClass('active');
        } else {
          sector_dom.removeClass('active').addClass('inactive');            
        }
      });
      return false;
    },
    complexSectorExpression: function(sectorFilters, sector_attribute) {
      var self = this;
      var expression = "";
      if(sector_attribute == null)
        sector_attribute = "sector1";
        
      for(var sector=0;sector<sectorFilters.length; sector++) {
        expression += "$["+sector_attribute+"] == '" + self.sectors[sectorFilters[sector]].name + "'";
        if(sector != sectorFilters.length-1)
          expression += " OR ";
      };
      return expression;
    },    
    setIndicator: function(indicator,visible) {
      var self = this;
      self.map.showLayer(self.stylelayers[self.current_indicator].order, false);
      if(indicator == null) {
        jq('#layercontrol_indicators').html("Indicators");
        self.map.showLayer(self.stylelayers[indicator].order, false);
      }
      else {
        jq('#layercontrol_indicators').html(indicator);
        
        var style = F1.WorldBank.indicators[indicator].styles;
        style.source = self.stylelayers[indicator].source;
        
        if(self.stylelayers[indicator].sharedLayer)
            self.map.setLayerStyle(self.stylelayers[indicator].order, style);
            
        var infotabs = [];
        if(F1.WorldBank.indicators[indicator].table != null)
          infotabs.push({title: "Data", type:"table", value:F1.WorldBank.indicators[indicator].table})
        if(F1.WorldBank.indicators[indicator].description != null)
          infotabs.push({title: "About", type: "text", value:F1.WorldBank.indicators[indicator].description})
        var infosub = F1.WorldBank.indicators[indicator].subtitle;
        if(F1.WorldBank.indicators[indicator].infosubtitle != null)
          infosub = F1.WorldBank.indicators[indicator].infosubtitle
          
        self.map.swf.addLayerInfoWindowFilter(self.stylelayers[indicator].order, {title: indicator + ": $["+ F1.WorldBank.indicators[indicator].styles.fill.selectedAttribute +"]", subtitle: infosub, tabs:infotabs});

        self.map.swf.setLayerTitle(self.stylelayers[indicator].order, F1.WorldBank.indicators[indicator].title);
        self.map.swf.setLayerSubTitle(self.stylelayers[indicator].order, F1.WorldBank.indicators[indicator].subtitle);
        self.map.showLayer(self.stylelayers[indicator].order, true);
      }
      self.current_indicator = indicator;
      self.setMapTitle();
      return false;
      
    },
    highlightProject: function(project_id) {
      var self = this;
      var highlightExpression = "$[project id] == '"+project_id+"'";
      this.map.swf.clearHighlights(self.stylelayers["Project Locations"].order);
      this.map.swf.addHighlight(self.stylelayers["Project Locations"].order,highlightExpression);
      // return false;
    },
    sortData: function(data) {
      var self = this;
      self.activities = jq.map(data.features, function(feature) { 
        if (feature) {
          attr = feature.attributes;
          if(self.projects[attr["project id"]] == null) { // first time we've seen this project ID
            var project = {};

            // Get the project level attributes
            for(var i = 0;i<project_attributes.length;i++) {
              if(project_attributes[i] != "activity count")
                project[project_attributes[i]] = attr[project_attributes[i]];
            }
            project["financing amount"] = attr["total amt"];
            project["financing"] = "$" + attr["total amt"] + " million";
            project["activity count"] = 0;
            self.projects[attr["project id"]] = project
            
            // Add to sector funding and project count
            var sector_name = project["sector1"];
            var wb_sector = self.sectors[self.sector_names[sector_name]];

            if(wb_sector == null)
              wb_sector = self.sectors["public"];
              
            wb_sector.funding += attr["total amt"];
            wb_sector.projects.push(project);
            self.total_funding += wb_sector.funding;
          }
          self.projects[attr["project id"]]["activity count"] += 1;

        
          return attr;
        }
      });
      
    },
    sortProjects: function(data) {
      var self = this;
      self.activities = jq.map(data, function(feature) { 
        if (feature) {
          attr = feature;
          if(self.projects[attr["id"]] == null) { // first time we've seen this project ID
            var project = {};

            // Get the project level attributes
            for(var i = 0;i<project_attributes.length;i++) {
              // if(project_attributes[i] != "activity count")
                project[project_attributes[i]] = attr[project_attributes[i]];
            }
            project["financing amount"] = attr["totalamt"];
            // project["activity count"] = 0;
            self.projects[attr["id"]] = project
            
            // Add to sector funding and project count
            var sector_name = project["mjsector1"];
            var wb_sector = self.sectors[self.sector_names[sector_name]];

            if(wb_sector == null)
              wb_sector = self.sectors["public"];
              
            wb_sector.funding += attr["totalamt"];
            wb_sector.projects.push(project);
            self.total_funding += attr["totalamt"];
          }
          // self.projects[attr["project id"]]["activity count"] += 1;

          return attr;
        }
      });
   
        self.projects.sort(function (a, b) {
            return b.totalamt - a.totalamt;
        });     
    },    
    projectTable: function(data) {
        var self = this;

        var table = '<table id="projects-table_grid"><thead><tr>';
        jq.each(["Project ID","Project Name","Financing Amount","Major Sector","Approval Date"], function(index,header) {
            table += tmpl(table_templates.th, {header: header});
        });
        table += "</tr></thead><tbody>"

        jq.each(data, function(index, project) {
            project["even"] = ((index+1) % 2 == 0) ? "row_even" : "row_odd";
            table += tmpl(table_templates.project, project);
        });
        table += "</tbody></table>"
        jq("#projects-table").append(table);

        jq("#projects-table tr").live("click", function() {
            self.highlightProject(jq(this).attr("project-id"));
        });
        jq("#projects-bar").click(function() {
            if(jQuery(this).hasClass("expanded")) {
                jq("#projects-table").hide("blind", { direction: "vertical" }, 2000);
                jq(this).removeClass("expanded").addClass("collapsed");      
            } else {
                jq("#projects-table").show("blind", { direction: "vertical" }, 2000);
                jq(this).removeClass("collapsed").addClass("expanded");  
            }
        });  

        // jq('#project_count').html(Object.size(this.projects));
        // jq('#activity_count').html(this.activities.length);

    },
    sectorPieChart: function(sector_name, refreshControls) {
        var self = this;

        var projects = [];
        var funding = 0;
        var sector_names = "";
        var opts = {}
        
        if(refreshControls == null || refreshControls == true){
            self.toggleSector("all", false, false); // watch recursion
            self.toggleSector(sector_name, true,false); // watch recursion
        }
        var projects = []
        var links = []
        var colors = [];
        var labels = [];
   
        if(sector_name == "all") {

            sector_names = "All"
            jq.each(self.sectors, function (sector,sector_attrs) { 
                projects.push(sector_attrs)
            });
            projects.sort(function (a, b) {
                return b.funding - a.funding;
            });        
            jq.each(projects, function (index,project) {
                links.push("javascript:wb.sectorPieChart('" + self.sector_codes[project.sector_code].shortname + "', true);");  
                colors.push(project.color)
                var financing = project.funding > 1000 ? project.funding/1000 + "b" : project.funding + "m"
                labels.push(project.name + " - $" + financing )
            });

            pie_options = {"features":projects, 
            "attributes": {"data":{"name": "Funding","original_name": "funding"},
            "description":{"name": "Project","original_name": "name"}, 
            "sort":{"name": "Funding","original_name": "funding"} }};
            
            funding = self.total_funding;
            opts["chart"] = {"colors": colors, "legend": labels};
            if(self.stylelayers["Project Locations"] != null)
                opts["chart"]["onclick"] = function() {wb.toggleSector(links[this.bar.index])};
                 
            var financing_total = funding > 1000 ? funding/1000 + " Billion" : funding + " Million";
            jq('#sector_funding_total').html("$" + financing_total + " <span class='subtotal' title='Global Financing'>/ $136.912 Billion</span>");
            jq('#sector_funding_title').html("Financing for " + sector_names + " Sectors")

        } else {
            // projects = self.sectors[sector_name].projects;
            // funding = self.sectors[sector_name].funding;
            // for(var sn=0;sn<self.visibleSectors.length;sn++) {
            //     if(self.sectors[self.visibleSectors[sn]] != null) {
            //         projects.push(self.sectors[self.visibleSectors[sn]].projects);
            //         funding += self.sectors[self.visibleSectors[sn]].funding;
            //         if(sn != 0){
            //             sector_names += ", ";
            //         }
            //         sector_names += self.visibleSectors[sn].capitalize();
            //     }
            // }
            
            projects = self.sectors[sector_name].projects;
            funding = self.sectors[sector_name].funding;

            var links = jq.map(projects, function (project,index) { 
                labels.push(Textify.elide_during(project.project_name, 35, '...'   ) + " - $" + project.totalamt + "m" )
                return "javascript:wb.highlightProject('" + project["id"] + "');";  
            });

            pie_options = {"features":projects, 
                            "attributes": {"data":{"name": "Funding","original_name": "financing amount"},
                            "description":{"name": "Project","original_name": "project_name"}, 
                            "sort":{"name": "Funding","original_name": "financing amount"} } };
            
            sector_names = wb.sectors[sector_name].name;
            opts["chart"] = {legend: labels, colors: self.fadeHex(self.sectors[sector_name].color, "#ffffff", 8)}
            var financing_total = self.total_funding > 1000 ? self.total_funding/1000 + " Billion" : self.total_funding + " Million"

            jq('#sector_funding_total').html("$" + funding + " Million <span class='subtotal' title='National Financing'>/ $"+ financing_total + "</span>");
            jq('#sector_funding_title').html("Financing for " + sector_names + " Sector")
        }

           if(projects.length == 0){
                jq('#sector_funding_total').hide();
                jq('#chart-left-bar-chart').html("There are no projects in this sector. <a href='#' onclick='wb.sectorPieChart(\"all\", true);'>back to all sectors</a>");
                return;
            }

            if(projects.length == 1){
                jq('#chart-left-pie-chart').html("<br />" + projects[0].project_name + ".<br />There is only a single project in this sector.");
                return;
            }

            jq('#sector_funding_total').show();
            jq('#chart-left-pie-chart').show();
            opts["href"] = links
            F1.Visualizer.charts.pie(180, 505, pie_options, "chart-left-pie-chart", opts);        

    },
    regionFundingBars: function() {
      var self = this;
      var s;
      var features = [];
      var links = [];
      var labels = [];
      jq.each(self.regions, function(s, financing) {
        features.push({name: s, financing: financing});
        labels.push(s)
        links.push("#" + s);
      });

      jq('#funding_total').hide();
      
      bar_options = {"features":features, "attributes": {
          "data":{"name": "Financing Amount $m", "original_name": "financing"}, 
          "description":{"name": "Region", "original_name": "name"}, 
          "sort":{"name": "Financing Amount $m","original_name": "financing"} } };
      F1.Visualizer.charts.bar(180, 405, bar_options, "chart-right-graph", {href: links, data_label: true, label: function() {
          return links[this.bar.index];
      }});
    },
    projectFundingBars: function() {
      var self = this;
      var s;
      var features = [];
      var links = [];
      var colors = [];

      jq.each(self.projects, function(index, project) {
        features.push(project);
        links.push( "javascript:wb.highlightProject('" + project["id"] + "');"  );
        colors.push(self.sector_codes[project.sector_code].color);
      });
      console.log(colors)

      jq('#funding_total').html("$" + self.total_funding.toFixed(1) + " Million");
      
      bar_options = {"features":features, "attributes": {
          "data":{"name": "Financing Amount", "original_name": "totalamt"}, 
          "description":{"name": "Project", "original_name": "project_name"}, 
          "sort":{"name": "Total Amount","original_name": "totalamt"} } };
      F1.Visualizer.charts.bar(180, 405, bar_options, "chart-right-graph", {data_label: true, href: links, colors: colors, label: function() {
          return links[this.bar.index];
      }, onclick: function() {
          wb.highlightProject(features[this.bar.index].id);;
          }});
    },    
    getLayers: function() {
      var self = this;
      var findlayers = ["Indicators", "Project Locations", "Project Counts", "Population", "Poverty", "Infant Mortality", "Maternal Health", "Malnutrition"];
      var possibleLayers = self.map.getLayers();
      var index;
      jq.each(possibleLayers, function(layer) {
        index = Object.include(findlayers, possibleLayers[layer].title);
        if(index != null){
          self.stylelayers[findlayers[index]] = {order: possibleLayers[layer].order, source: possibleLayers[layer].source, sharedLayer: false};
          if(Object.include(["Infant Mortality", "Population", "Poverty", "Maternal Health", "Malnutrition"], possibleLayers[layer].title)) {
            F1.WorldBank.indicators[possibleLayers[layer].title].styles.fill.selectedAttribute = possibleLayers[layer].styles.fill.selectedAttribute;
          }
          // self.map.swf.setLayerTitle(possibleLayers[layer].order, F1.WorldBank.indicators[possibleLayers[layer].title]);
          // self.map.swf.setLayerSubTitle(possibleLayers[layer].order, F1.WorldBank.indicators[possibleLayers[layer].subtitle]);
          findlayers.splice(index,1);
        }        
      })

      // second pass if we missed any
      jq.each(findlayers, function(layer) {
        self.stylelayers[findlayers[layer]] = {order: self.stylelayers["Indicators"].order, source: self.stylelayers["Indicators"].source, sharedLayer: true};
        // we'll set the title & subtitle later
      });

      jq('#download_data').attr('href','http://wbstaging.geocommons.com/datasets/' + self.stylelayers["Project Locations"].source.replace("finder:","")  + ".csv")
       return false;
    },
    styleMap: function() {
      var self = this;
            
      // icons
      self.map.swf.addLayerCategoryFilter(self.stylelayers["Project Locations"].order, {attribute:"sector1",categories:self.wbicons});
      
      // infowindow
      self.map.swf.addLayerInfoWindowFilter(self.stylelayers["Project Locations"].order, {title: "$[project title]", subtitle: "$[sector1]", tabs:[{title: "Financing", type: "text", value:"Project ID: <a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[project id]'>$[project id]</a>\nProject Name: $[project title]\nSector:$[sector1]\nTotal Amount: $ $[total amt] million"}, {title: "Location", type: "text", value: "Province: $[adm1]\nDistrict: $[adm2]\n\n$[precision description]"}]});
      
      self.map.swf.addLayerInfoWindowFilter(self.stylelayers["Project Counts"].order, {title: "Projects: $[project count]", subtitle: "", tabs:[{title:"About", type:"text", value: "There are $[project count] active projects in the region."}]});
      
      // self.map.swf.addLayerInfoWindowFilter(self.stylelayers["Project Counts"].order, {title: "Projects: $[project count]", subtitle: "Total Projects working in $[adm1 name]", tabs:[{title: "Projects", type: "text", value:"<ul><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid1]'>$[pid1]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid2]'>$[pid2]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid3]'>$[pid3]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid4]'>$[pid4]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid5]'>$[pid5]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid6]'>$[pid6]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid7]'>$[pid7]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid8]'>$[pid8]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid9]'>$[pid9]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid10]'>$[pid10]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid11]'>$[pid11]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid12]'>$[pid12]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid13]'>$[pid13]</a></li><li><a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[pid14]'>$[pid14]</a></li></ul>"}]});

    },
    styleLegend: function() {
      this.map.showControl("Legend",true);
      this.map.swf.setStyle( { legend: { buttonBgColor:0x92948C, buttonPlacement:"horizontal", buttonFontColor:0xFFFFFF, buttonBgAlpha:0.7,offset:{x:0,y:95}}});      
      return false;
    },
    highlightRegions: function(regions, region_attr) {
        var self = this;
        if(region_attr == null)
            region_attr = "Country_1";
        
        self.map.swf.clearHighlights(0);
        jq.map(regions,function(region) {
            self.map.swf.addHighlight(0, "$["+region_attr+"] == '"+region+"'");
        });
    },
    hideLoading: function() {
      jq("#loading").hide();
      jq(".loaded").show();
    },
    drawCharts: function() {
      var self = this;
      
      if( self.initialized ) {return;}
      self.getLayers(self.map);
      self.styleMap(self.map);
      self.setIndicator("Poverty");
      // self.toggleSector("counts_admin1",true);
      jq('#project_count').html(self.country_attrs["projects_count"]);
      jq('#activity_count').html(self.country_attrs["locations_count"]);
      self.sortProjects(self.projects);
      self.projectTable(self.projects);
      self.projectFundingBars();
      self.sectorPieChart("all");
      self.hideLoading();
      self.initialized = true;
  },
  styleWorldMap: function() {
      var self = this;
      self.highlightRegions(["Kenya","Philippines","Bolivia"]);
      jq('#project_count').html(self.country_attrs["projects_count"]);
      jq('#activity_count').html(self.country_attrs["locations_count"]);
      self.sectorPieChart("all", false);
      self.regionFundingBars();
      
      // self.map.swf.addLayerInfoWindowFilter(1, {title: "$[project_n0]", subtitle: "$[mjsector1]", tabs:[{title: "Financing", type: "text", value:"Project ID: <a target='_new' href='http://web.worldbank.org/external/projects/main?pagePK=64283627&piPK=73230&theSitePK=40941&menuPK=228424&Projectid=$[id0]'>$[id0]</a>\nProject Name: $[project_n0]\nSector:$[mjsector1]\nTotal Amount: $ $[totalamt0] million"}]});


      self.map.swf.addLayerInfoWindowFilter(0, {title: "$[Country_1]", subtitle: "$[count] Projects", tabs: [{title:"About", type: "text", value: "There are currently $[count] active World Bank projects in $[Country_1].\n\nYou can explore the growing list of available project profiles in countries through the 'Locations' option at the bottom of the map."}]});
      self.hideLoading();
  },
  loadedMap: function() {
      var self = this;
      self.styleLegend();
      if(self.region != "World"){
          self.drawCharts();
      } else {
          self.styleWorldMap();
      }
  },
      
    //
    // Returns an array of colors between and including Hex1 and Hex2.
    fadeHex: function(hex1, hex2, steps){
        if(hex1.charAt(0) == "#") 
            hex1 = hex1.slice(1);
        hex1 = hex1.toUpperCase();
        hex1 = +("0x"+hex1);

        if(hex2.charAt(0) == "#") 
            hex2 = hex2.slice(1);
        hex2 = hex2.toUpperCase();
        hex2 = +("0x"+hex2);
        
        var newArry = ["#" + hex1.toString(16)];
        //
        // Break Hex1 into RGB components.
        var r = hex1 >> 16;
        var g = hex1 >> 8 & 0xFF;
        var b = hex1 & 0xFF;
        //
        // Determine RGB differences between Hex1 and Hex2.
        var rd = (hex2 >> 16)-r;
        var gd = (hex2 >> 8 & 0xFF)-g;
        var bd = (hex2 & 0xFF)-b;
        //
        steps++;
        // For each new color.
        for (var i=1; i<steps; i++){
            //
            // Determine where the color lies between the 2 end colors.
            var ratio = i/steps;
            //
            // Calculate new color and add it to the array.
            newArry.push("#" + ((r+rd*ratio)<<16 | (g+gd*ratio)<<8 | (b+bd*ratio)).toString(16));
        }
        //
        // Add Hex2 to the array and return it.
        newArry.push("#" + hex2.toString(16));
        return newArry;
    }
      
  }

jq("#sall").attr('checked', true); // clear the checkbox

})();  // preserving the global namespace
  
