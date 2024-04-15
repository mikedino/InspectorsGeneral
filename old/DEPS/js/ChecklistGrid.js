/*
    N01IG - Inspector General Inspections automation - Self Assessment Checklist page
    version: 1.2
    developer:  John Hartung, USFF N611
                Mike Landino, USFF N611
*/

"use strict";

//Create namespace 
var Grid = Grid || {}

Grid = {

    site: _spPageContextInfo.webAbsoluteUrl,
	path: _spPageContextInfo.serverRequestPath,
	currentUserId: _spPageContextInfo.userId,
	checklistListName: "Command Inspection Checklists",
	selfAssessmentOverviewListName: "Self Assessment Overview",
	selfAssessmentOverviewRecords: [],
	selectedProgramId: 0,
	selectedProgramTitle: "",
	data: [],
	selfAssessors: [], // dynamic (group must be set as current site default members group)
	adminGroup: { id: 69117, title: "N01IG Inspections Administrators" },
	inspectorGroup: { id: 68531, title: "N01IG Inspectors" },
	visitorGroup: { id: 175, title: "N01IG Site Members" },
	inspectors: [],
	programs: [],
	functionalAreas: [],
	isAdmin: false,
	isInspector: false,
	isAssessor: false,
	isVisitor: false,
	rolesDisplayArr: [],
    isDebugMode: true,
    
	init: function(){
		setTimeout(() => {
			if(document.readyState === "complete"){
				this.get.siteMemberGroup();
			}else this.init();
		}, 100);
    },

    get:{

		siteMemberGroup: function(){
			//gets the associated site member group (self-assessors) dynamically
			$.ajax({
                url: Grid.site + "/_api/Web/AssociatedMemberGroup",
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data) {
				Grid.selfAssessors.id = data.d.Id;
				Grid.selfAssessors.title = data.d.Title;
			})
			.then(Grid.get.assignedGroups)
			.fail(function (error) {
            	Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving associated Site Member group", "Grid.get.siteMemberGroup()", JSON.stringify(error), "");
            });
		},

		assignedGroups: function(){
			var base =  Grid.site + "/_api/web/GetUserById(" + Grid.currentUserId + ")/Groups?",
				select = "$select=Id,Title",
        		endpoint = base + select;
			$.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data) {
				$.each(data.d.results, function(i,val){
					switch (val.Id) {
						case Grid.adminGroup.id:
							Grid.isAdmin = true;
							Grid.isInspector = true;
							Grid.isAssessor = true;
							Grid.rolesDisplayArr.push(' ' + Grid.adminGroup.title);
							break;
						case Grid.inspectorGroup.id:
							Grid.isInspector = true;
							Grid.rolesDisplayArr.push(' ' + Grid.inspectorGroup.title);
							break;
						case Grid.selfAssessors.id:
							Grid.rolesDisplayArr.push(' ' + Grid.selfAssessors.title);
							Grid.isAssessor = true;
							break;
						default:
							Grid.isVisitor = true;
							if($.inArray(" Visitor", Grid.rolesDisplayArr) < 0) Grid.rolesDisplayArr.push(" Visitor");
							break;
					}
				})
			})
			.then(Grid.get.inspectors())
			.fail(function (error) {
            	Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving user's associated groups", "Grid.get.userGroups()", JSON.stringify(error), "");
            });
		},

		inspectors: function(){
			//use this to populate the Inspector choice in the grid
			var base =  Grid.site + "/_api/Web/SiteGroups/GetByName('" + Grid.inspectorGroup.title + "')/users",
				select = "?$select=Id,Title";
			$.ajax({
				url: base + select,
				type: "GET",
				headers: { "Accept": "application/json;odata=verbose" }
			}).done(function(data) {
				//console.log(data.d.results);
				$.each(data.d.results, function(i,val){
					Grid.inspectors.push({
						Id: val.Id,
						Title: val.Title
					});
				});
			})
			.then(Grid.get.inspectionChecklist())
			.fail(function (error) {
				Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving inspectors group users", "Grid.get.inspectors()", JSON.stringify(error), "");
			});
		},

		inspectionChecklist: function(){
			var baseURL =  Grid.site + "/_api/web/lists/GetByTitle('" + Grid.checklistListName + "')/items?";
			var select = "$select=Id,Program&$top=2000";
        	var endpoint = baseURL + select;
			$.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data) {
				Grid.data = data.d.results;
				$.each(data.d.results, function(i,val){
					if(Grid.programs.length == 0 || $.inArray(val.Program, Grid.programs) === -1){
						Grid.programs.push(val.Program);
					}
				});
				Grid.programs.sort();
			})
			.then(Grid.controls.dropDownLists())
			.then(Grid.get.assessOverview())
			.fail(function (error) {
            	Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Checklist", "Grid.get.inspectionChecklist()", JSON.stringify(error), "");
            });
		},

		assessOverview: function(){
			Grid.selfAssessmentOverviewRecords = []; //remove any existing objects for when this function is called again on Dialog close
			var baseURL =  Grid.site + "/_api/web/lists/GetByTitle('" + Grid.selfAssessmentOverviewListName + "')/items?";
			var select = "$select=Id,Title";
        	var endpoint = baseURL + select;
			$.ajax({
                url: endpoint,
                type: "GET",
                headers: { "Accept": "application/json;odata=verbose" }
            }).done(function(data) {
				if(data.d.results.length > 0){
					$.each(data.d.results, function(i,val){
						Grid.selfAssessmentOverviewRecords.push({
							Id: val.Id,
							Title: val.Title
						});
					});
				}
			}).then(function(){
				if(Grid.selectedProgramTitle) 
					//toggle the button async after new self-assessment has been created
					Grid.utilities.selfAssessmentButtonDisplay(Grid.selectedProgramTitle)
			}).fail(function (error) {
            	Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Self Assessment Overview Records", "Grid.get.assessmentOverview()", JSON.stringify(error), "");
            });
		}

	},
	
	controls: {

		dropDownLists: function(){

			$("#kendoProgramDDL").kendoDropDownList({
				autoBind: false,
				optionLabel: "Select Program...",
				dataSource: Grid.programs,
				close: function(e){
					Grid.controls.configureChecklistGrid(this._cascadedValue);
					Grid.utilities.selfAssessmentButtonDisplay(this._cascadedValue);
					Grid.selectedProgramTitle = this._cascadedValue;
				}
			});

		},

		configureChecklistGrid: function(program) {

			$("#checklistGrid").empty();

			var baseURL =  _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Grid.checklistListName + "')/items",
				select = "?$select=ID,Title,QuestionNumber,Question,FunctionalArea,Program,Reference,ReferenceDate,ReferenceData,Response,ResponseChoice,AssignedInspector/Title,AssignedInspector/Id,na,IsRecommendation,IsDeficiency,Deficiency,InspectorComments",
				expand = "&$expand=AssignedInspector",
				filter = "&$filter=Program eq '" + program + "'",
				order =  "&$orderby=QuestionNumber",
				readURL = baseURL + select + expand + filter + order + "&$top=500";

			var toolbarTemplate = "<div style='float:right;padding:5px'><span><b>User Role(s): </b></span>" + Grid.utilities.determineRoleDisplay() + "</div>";
		 
			var grid = $("#checklistGrid").kendoGrid({
				dataSource: {
					transport: {
						read: {
							url: readURL,
							contentType: "application/json;odata=verbose",
							headers: {  "Accept":"application/json;odata=verbose" }
						},
						update: {
							url: function (data) {
								return _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + Grid.checklistListName + "')/items(" + data.ID + ")";
							},
							type: "POST",
							dataType: "json",
							contentType: "application/json;odata=verbose",
							headers: {
								"Accept": "application/json;odata=verbose",
								"content-type": "application/json;odata=verbose",
								"X-RequestDigest": $("#__REQUESTDIGEST").val(),
								"X-HTTP-Method": "MERGE",
								"If-Match": "*"
							},
							complete: function (jqXHR, textStatus) {
								if (textStatus == 'error') {
									Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error updating question(s)", "Grid.utilities.configureChecklistGrid()", jqXHR.statusText, jqXHR.responseText);
								}

							}
						},
						parameterMap: function (data, operation) {
							if (operation == "update") {
								return kendo.stringify({
									//Id: data.Id,
									ResponseChoice: data.ResponseChoice,
									Response: data.Response,
									AssignedInspectorId: data.AssignedInspector.Id,
									IsRecommendation: data.IsRecommendation,
									Recommendation: data.Recommendation,
									IsDeficiency: data.IsDeficiency,
									na: data.na,
									Deficiency: data.Deficiency,
									InspectorComments: data.InspectorComments,
									__metadata: { 'type' : data.__metadata.type }
								});
							}
						}
					},
					schema: {
						data: function (data) {
							return data.d && data.d.results ? data.d.results : [data.d];
						},
						model: {
							id: "ID",
							fields: {
								ID: {type: "number", editable: false, nullable: false },
								Title: {type: "string", editable: false, nullable: false },  
								FunctionalArea: { type: "string", editable: false, nullable: false },
								Program: { type: "string", editable: false, nullable: false	},
								QuestionNumber: { type: "string", editable: false, nullable: false },    
								Question: { type: "string", editable: false, nullable: false },
								ResponseChoice: { type: "string", editable: Grid.isAssessor, nullable: true },
								Response: { type: "string", editable: Grid.isAssessor, nullable: false },
								Reference: { type: "string", editable: false, nullable: false },
								ReferenceDate:{ type: "date", editable: false, nullable: false },
								ReferenceData:{ type: "string", editable: false, nullable: false },
								AssignedInspector:{ type: "object", from: "AssignedInspector", editable: Grid.isInspector },
								//AssignedInspectorId:{ type: "string", editable: Grid.isInspector },
								//AssignedInspector:{ defaultValue: { personId: "AssignedInspector.Id", personName: "AssignedInspector.Title"} },
								na:{ type: "boolean", editable: Grid.isInspector },
								IsRecommendation:{ type: "boolean", editable: Grid.isInspector },
								Recommendation:{ type: "string", editable: Grid.isInspector },
								IsDeficiency:{ type: "boolean", editable: Grid.isInspector },
								Deficiency:{ type: "string", editable: Grid.isInspector },
								InspectorComments:{ type: "string", editable: Grid.isInspector },
							}
						},
						total: function (result) {
							var data = this.data(result);
							return data ? data.length : 0;
						}
					}
					//pageSize: 20
				},
				persistSelection: true,
				height: 550,
				width: $('#s4-workspace').width() - 40,
				editable: true,
				groupable: false,
				reorderable: true,
				sortable: true,
				batch: true,
				columnMenu: true,
				scrollable: true,
				resizable: true,
				toolbar: [
					{ "name": "save", "attr": "style=float:left" },
					{ "name": "cancel", "attr": "style=float:left"},
					{ template: toolbarTemplate }
				],
				columns: [					
					/*{
						field: "Program",
						title: "Program",
						width: 150,
						exportable: true,
						lockable: true,
						locked: true
					},*/
					{
						field: "QuestionNumber",
						title: "Question #",
						width: 50,
						exportable: true,
						lockable: true,
						locked: true
					}, {
						field: "Question",
						title: "Question",
						width: 400,
						exportable: true,
						lockable: true,
						locked: true
					}, {
						field: "ResponseChoice",
						title: "Response Choice",
						width: 80,
						editor: choiceDropDown,
						exportable: true,
						filterable: true

					}, {
						field: "Response",
						title: "Response Text",
						width: 400,
						exportable: true
					}, {

						field: "Reference",
						title: "Reference",
						width: 100,
						exportable: true,
						filterable: true
					}, {
						field: "ReferenceDate",
						title: "Reference Date",
						width: 85,
						exportable: true,
						template: "#= kendo.toString(kendo.parseDate(ReferenceDate), 'MM/dd/yyyy')#" 
					}, {
						field: "ReferenceData",
						title: "Reference Data",
						width: 150,
						exportable: true,
						filterable: true
					},{
						field: "AssignedInspector",
						title: "Assigned Inspector",
						editor: inspectorsDropDown,
						template: "#= (AssignedInspector.Title ? AssignedInspector.Title : '') #",
						width: 250,
						exportable: true,
						//hidden: !Grid.isInspector
						hidden: true //hidden - not needed per Carla email on 10/5/21 -MDL
					},{
						field: "na",
						title: "N/A",
						template: '<input type="checkbox" name="na" #= (na ? \'checked="checked"\' : "") # class="chkbx" />',
						width: 80,
						exportable: true,
						filterable:	true,
						attributes:{ align:"center" },
						hidden: !Grid.isInspector
					},{
						field: "IsRecommendation",
						title: "Recommendation?",
						template: '<input type="checkbox" name="IsRecommendation" #= (IsRecommendation ? \'checked="checked"\' : "") # class="chkbx" />',
						width: 151,
						exportable: true,
						filterable:	true,
						attributes:{ align:"center" },
						hidden: !Grid.isInspector
					},{
						field: "Recommendation",
						title: "Recommendation Text",
						width: 400,
						exportable: true,
						//hidden: !Grid.isInspector
						hidden: true //hidden - not needed per Carla email on 10/5/21 -MDL
					},{
						field: "IsDeficiency",
						title: "Deficiency?",
						template: '<input type="checkbox" name="IsDeficiency" #= (IsDeficiency ? \'checked="checked"\' : "") # class="chkbx" />',
						width: 108,
						exportable: true,
						filterable:	true,
						attributes:{ align:"center" },
						hidden: !Grid.isInspector
					},
					{
						field: "Deficiency",
						title: "Deficiency Text",
						width: 400,
						exportable: true,
						//hidden: !Grid.isInspector
						hidden: true //hidden - not needed per Carla email on 10/5/21 -MDL
					},{
						field: "InspectorComments",
						title: "Inspector Comments",
						width: 400,
						exportable: true,
						hidden: !Grid.isInspector
					}/*{ 
						command: { text: "Edit", click: Grid.utilities.editEventDialog }, 
						title: " ", 
						width: "80px"
					}*/
				],
				dataBound: function(){
                    Grid.controls.checkForChanges();
                }, 
				edit: function(){
                    Grid.controls.checkForChanges();
                },
				error: function(e) {
					Grid.utilities.logException(BootstrapDialog.TYPE_DANGER, "Error retrieving Checklist questions for populating the grid", "Grid.utilities.configureChecklistGrid()", e, "");
				}
			});

			function choiceDropDown(container, options){
				$('<input name="'+options.field+'"/>')
					.appendTo(container)
					.kendoDropDownList({
						autoBind: false,
						dataSource: ["Yes","No","N/A"],
						optionLabel: "Select..."
					});
			}

			function inspectorsDropDown(container, options){
				$('<input name="'+options.field+'"/>')
					.appendTo(container)
					.kendoDropDownList({
						autoBind: true,
						dataSource: Grid.inspectors,
						dataTextField: "Title",
						dataValueField: "Id",
						optionLabel: "Select..."
					});
			}

			// prevent the ENTER key from putting the page in edit mode
			$("#checklistGrid").keypress(function (e) {
				if (e.keyCode === 13) {
					e.preventDefault();
				}
			});

			//console.log( $('#checklistGrid').data('kendoGrid').dataSource.hasChanges() );

			//console.log( grid.data('kendoGrid').dataSource.hasChanges() );

		},  //end configureChecklistGrid

		checkForChanges: function(){
            var hasChanges = $('#checklistGrid').data('kendoGrid').dataSource.hasChanges();
            var saveButton = $('a.k-button.k-grid-save-changes');
            if(hasChanges){
                saveButton.addClass("secondary");
            } else saveButton.removeClass("secondary");
        }

	},

    utilities: {

		determineRoleDisplay: function(){
			if(Grid.isAdmin){
				return Grid.adminGroup.title;
			} else if (Grid.isInspector){
				return Grid.inspectorGroup.title;
			} else if (Grid.isAssessor){
				return Grid.selfAssessors.title;
			} else return "Visitor";
		},

		selfAssessmentButtonDisplay: function(program){
			var exists = false;
			$.each(Grid.selfAssessmentOverviewRecords, function(i,val){
				if(val.Title == program){
					//record already exists for this program
					Grid.selectedProgramId = val.Id;
					exists = true;
				}
			});

			if(exists){
				$('.newAssessment').hide();
				$('.displayAssessment').show();
			} else {
				$('.newAssessment').show();
				$('.displayAssessment').hide();
			}	
		},

		newDialog: function(){
			var options = 
			{
				url: Grid.site + "/Lists/selfAssessmentPPT/NewForm.aspx?program=" + Grid.selectedProgramTitle,
				//width: "720",
				height: "800",
				//title: "Create New Key Event"
				allowMaximize: true,
				dialogReturnValueCallback: function(){ 
					Grid.get.assessOverview()
				}
			};
			SP.UI.ModalDialog.showModalDialog(options);
		},

		displayDialog: function(){
			var options = 
			{
				url: Grid.site + "/Lists/selfAssessmentPPT/DispForm.aspx?ID=" + Grid.selectedProgramId,
				//width: "720",
				height: "800",
				//title: "Create New Key Event"
				allowMaximize: true
			};
			SP.UI.ModalDialog.showModalDialog(options);
		},

        // msgTypes: Info, Success, Error, Warning, Debug
    	logException: function(msgType, title, source, details, stackTrace) {
             var msgTypeSimple;
                          
             switch (msgType) {
             	case BootstrapDialog.TYPE_INFO:
             		msgTypeSimple = 'Info';
					break;
			    case  BootstrapDialog.TYPE_SUCCESS:
             		msgTypeSimple = 'Success';
    				break;
			    case  BootstrapDialog.TYPE_WARNING:
            		msgTypeSimple = 'Warning';
 					break;
			    case  BootstrapDialog.TYPE_DANGER:
             		msgTypeSimple = 'Error';
      				break;
      				
      			case  BootstrapDialog.TYPE_DEFAULT:
             		msgTypeSimple = 'Debug';
      				break;

				default:
					console.log('Invalid msgType passed to logException function');
					return;
             }
             
             
             var msg = msgTypeSimple + " - " + title + ", source:" + source + ", details:" + details + ", strackTrace:" + stackTrace;
           //  console.log(msg);
             var msgToRender = "";
             var msgDlgSize = BootstrapDialog.SIZE_NORMAL;
             
             if (Grid.isDebugMode) {
             	msgToRender = "<div class='errMsgTitle'>"  + title + "</div>";
             	msgToRender += "<p>";

             	if (source != '') {
             		msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>Source:</span> " + source + "</div>";
             	}
             	
             	msgToRender += "<br>";            	
             	if (details != '') {
             		msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>Details:</span> " + details + "</div>";
             		msgDlgSize = BootstrapDialog.SIZE_WIDE;

             	}
             	
             	msgToRender += "<br>";
             	if (stackTrace != '') {
             		msgToRender += "<div class='errMsgBody'><span class='errMsgLabel'>StackTrace:</span> " + stackTrace + "</div><br>";
					BootstrapDialog.SIZE_WIDE
             	}
				msgToRender += "</p>"
  	
             }
             else {
             	msgToRender = title;
             }

	 		 BootstrapDialog.show({
			 	size: msgDlgSize,
                type: msgType,
                title: msgTypeSimple,
                message: msgToRender,
				buttons: [{
					cssClass: 'btn-primary',
	                label: 'Close',
	                action: function(dialogItself){
	                    dialogItself.close();
	                }
	            }]              
            
            });     		
    	
    	}
    }

}

$(document).ready(Grid.init());