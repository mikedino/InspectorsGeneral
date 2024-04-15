/*
    N01IG - Inspector General Inspections automation - Administration page
    version: 1.0.0.4
    developer:  Mike Landino, USFF N611
    notes: 04/01/2022 - Modified/Migrated to SPFx solution 
    notes: 04/28/2022 - updated the checkForChanges() function to remove the else statement, changed the grid.editable
                        attribute to not require confirmation, removed dataType:"json" from all grid tranport methods
    notes: 05/03/2022 - updated JSOM call line 532 for FlankSpeed environment issue

    TODO:   Save changes button doesn't highlight after deleting a row
            After sorting/filtering, save changes appears to highlight but doesn't ever go away
            Copying to EchIII, title is blank (should be "no title")
*/

"use strict";

//Define namespace
var Admin = Admin || {};

Admin = {

  FormDigestValue: "",
  isInspector: false,
  isOwner: false,
  isVisitor: false,
  siteDirectory: [],
  programs: [],
  selectedProgramId: "",
  selectedProgramTitle: "",
  copyToProgramId: "",

  init: function () {
    $("#checklistGrid").empty();
    this.ajax.getUserAssignedGroups();
    this.ajax.getFormDigestValue();
  },

  ajax: {
    getUserAssignedGroups: function () {
      //get all groups the current user is in and set flag accordingly
      var base = Admin.site + "/_api/web/GetUserById(" + Admin.currentUserId + ")/Groups?",
        select = "$select=Id,Title",
        endpoint = base + select;
      $.ajax({
        url: endpoint,
        type: "GET",
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          $.each(data.d.results, function (i, val) {
            switch (val.Title) {
              case Admin.adminGroup:
                Admin.isOwner = true;
                Admin.isInspector = true;
                break;
              case Admin.inspectorGroup:
                Admin.isInspector = true;
                break;
              default:
                Admin.isVisitor = true;
                break;
            }
          });
        })
        .then(Admin.ajax.getPrograms())
        .fail(function (error) {
          kendo.alert("Error retrieving user's associated groups. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log("Error retrieving user's associated groups. ERROR: " + JSON.stringify(error));
        });
    },

    getFormDigestValue: function () {
      //get page context for POST/MERGE ajax functions.  
      //NEW for SPFx/Modern pages
      $.ajax({
        url: Admin.site + "/_api/contextinfo",
        type: "POST",
        async: false,
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          Admin.FormDigestValue = data.d.GetContextWebInformation.FormDigestValue;
          //console.log(Admin.FormDigestValue);
        })
        .fail(function (error) {
          kendo.alert("Error retrieving the page context. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log("Error retrieving FormDigestValue. ERROR: " + JSON.stringify(error));
        });
    },

    getPrograms: function () {
      //get all programs to populate drop down
      var api = Admin.site + "/_api/web/lists/getbytitle('" + Admin.programsListName + "')/items?",
        select = "$select=ID,Title",
        order = "&$orderby=Title",
        endpoint = api + select + order;
      Admin.programs.length = 0;

      $.ajax({
        url: endpoint,
        type: "GET",
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          //   console.log(data.d.results);
          $.each(data.d.results, function (i, val) {
            Admin.programs.push({
              id: val.Id,
              title: val.Title,
            });
          });
        })
        .then(function () {
          $("#kendoProgramDDL").kendoDropDownList({
            autoBind: false,
            optionLabel: "Select Program...",
            dataSource: Admin.programs,
            dataTextField: "title",
            dataValueField: "id",
            close: function (e) {
              Admin.selectedProgramId = this._cascadedValue;
              Admin.selectedProgramTitle = this.text();
              Admin.grid.configureChecklistGrid();
            },
          });

          $("#kendoProgramDestDDL").kendoDropDownList({
            autoBind: false,
            optionLabel: "Select Program...",
            dataSource: Admin.programs,
            dataTextField: "title",
            dataValueField: "id",
            close: function (e) {
              var val = this._cascadedValue;
              Admin.copyToProgramId = val;
              if (val) {
                $("#submitCopyButton").removeAttr("disabled");
              } else $("#submitCopyButton").attr("disabled", "disabled");
            },
          });
        })
        .then(Admin.ajax.getSiteDirectory())
        .fail(function (error) {
          kendo.alert("Error retrieving Programs drop down. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log( "Error retrieving programs drop down. ERROR: " + JSON.stringify(error));
        });
    },

    getSiteDirectory: function () {
      var api = Admin.site + "/_api/web/lists/getbytitle('" + Admin.siteDirectoryListName + "')/items?",
        select = "$select=ID,Title,Description,SiteURL",
        order = "&$orderby=Title",
        filter = "&$filter=(active eq 1)", //only display active commands
        endpoint = api + select + order + filter;

      Admin.siteDirectory.length = 0;

      $.ajax({
        url: endpoint,
        type: "GET",
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          $.each(data.d.results, function (i, val) {
            Admin.siteDirectory.push({
              id: val.Id,
              title: val.Title,
              siteURL: val.SiteURL.Url,
            });
          });
        })
        .then(function () {
          $("#kendoE3CommandDDL").kendoDropDownList({
            dataSource: Admin.siteDirectory,
            dataTextField: "title",
            dataValueField: "siteURL",
            autoBind: false,
            optionLabel: "Select Command...",
            change: function (e) {
              var val = this._cascadedValue;
              Admin.destSiteURL = val;
              Admin.destSiteTitle = this.text();
              Admin.utilities.enableSendButtons(val);
            },
          });
        })
        .fail(function (error) {
          kendo.alert("Error retrieving Echelon 3 Directories. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log("Error retrieving Echelon 3 Directories. ERROR: " + JSON.stringify(error));
        });
    },

    createProgram: function (program) {
      $.ajax({
        url: Admin.site + "/_api/web/lists/getbytitle('" + Admin.programsListName + "')/items",
        type: "POST",
        data: JSON.stringify({
          __metadata: {
            type: "SP.Data." + Admin.programsListName + "ListItem",
          },
          Title: program,
        }),
        headers: {
          Accept: "application/json; odata=verbose",
          "Content-Type": "application/json;odata=verbose",
          "X-RequestDigest": Admin.FormDigestValue,
          "X-HTTP-Method": "POST",
        },
      })
        .done(function (data) {
          Admin.ajax.getPrograms();
          $("#dialog").kendoDialog({
            title: "Create Program",
            content: "New Program successfully created!",
            close: function (e) {
              var ddl = $("#kendoProgramDDL").data("kendoDropDownList");
              ddl.value(Admin.selectedProgramId);
              ddl.trigger("change");
            },
          });
        })
        .fail(function (error) {
          kendo.alert("Error creating new Program. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log("Error creating new Program. ERROR: " + JSON.stringify(error));
        });
    },

    getExistingEch3Program: function () {
      var api = Admin.destSiteURL + "/_api/web/lists/getbytitle('" + Admin.commandInspectionChecklistsListName + "')/items?",
        select = "$select=ID,Program",
        filter = "&$filter=Program eq '" + Admin.selectedProgramTitle + "'",
        endpoint = api + select + filter;

      $.ajax({
        url: endpoint,
        type: "GET",
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          if (data.d.results.length > 0) {
            console.log("found existing questions");
            kendo
              .confirm("This program already exists on " + Admin.destSiteTitle + ".<br/><br/>" +
                  "This action will DELETE all existing questions and add these as new ones.  This action cannot be un-done.<br/><br/>" +
                  "Are you sure you want to do this?")
              .done(function () {
                //yes
                Admin.utilities.showSpinner();
                try {
                  Admin.utilities.deleteEch3Programs();
                } catch (error) {
                  Admin.utilities.hideSpinner();
                  kendo.alert("Error loading/deleting existing questions from the Ech III checklist.<br/><br/>" + "stack: " + error);
                  console.log("Error loading itemCollection from the Ech III list. ERROR: " + error );
                }
              })
              .fail(function () {
                //no
                console.log("user canceled");
              });
          } else Admin.copy.sendToE3Checklist();
        })
        .fail(function (error) {
          kendo.alert("Error retrieving existing Echelon 3 Checklist entries for this program. Refresh the screen and try again, or contact IT Support if this problem persists.<br/><br/>" + JSON.stringify(error.responseJSON.error.message.value));
          console.log("Error retrieving existing Echelon 3 Checklist entries for this program.");
          console.log(error);
        });
    },
  },

  grid: {
    configureChecklistGrid: function () {
      $("#checklistGrid").empty();

      //var program = $("#kendoProgramDDL").data("kendoDropDownList").text();
      var baseURL = Admin.site + "/_api/web/lists/GetByTitle('" + Admin.checklistTemplateListName + "')/items?$select=ID,QuestionNumber,Question,ProgramId,ObsoleteQuestion,Reference,ReferenceDate,ReferenceData&$top=1500";
      var filter = "&$filter=((ProgramId eq '" + Admin.selectedProgramId + "') and (ObsoleteQuestion eq 0))";
      var order = "&$orderby=QuestionNumber";
      var readURL = baseURL + filter + order;

      $("#checklistGrid").kendoGrid({
        dataSource: {
          transport: {
            create: {
              data: {
                __metadata: { type: "SP.Data.ChecklistListItem" },
              },
              url: function () {
                return ( Admin.site + "/_api/web/lists/GetByTitle('" + Admin.checklistTemplateListName + "')/items");
              },
              type: "POST",
              contentType: "application/json;odata=verbose",
              headers: {
                accept: "application/json;odata=verbose",
                "content-type": "application/json;odata=verbose",
                "X-RequestDigest": Admin.FormDigestValue,
              },
              complete: function (jqXHR, textStatus) {
                if (textStatus == "error") {
                  kendo.alert(
                    "Error creating new question(s). Refresh the screen or check your data and try again. Contact IT Support if this problem persists.<br/><br/>" +
                      "Stack: " + jqXHR.responseJSON.error.message.value);
                  console.log("Error creating new question(s). ERROR: " + jqXHR.responseText);
                }
              },
            },
            read: {
              url: readURL,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Accept", "application/json; odata=verbose");
              },
              complete: function (jqXHR, textStatus) {
                if (textStatus == "error") {
                  kendo.alert("Error generating grid. Refresh the screen or check which list you selected and try again. Contact IT Support if this problem persists.<br/><br/>" +
                      "Stack: " + jqXHR.responseJSON.error.message.value);
                  console.log("Error generating grid checklist. ERROR: " + jqXHR.responseText);
                }
              },
            },
            update: {
              url: function (data) {
                return (Admin.site + "/_api/web/lists/GetByTitle('" + Admin.checklistTemplateListName + "')/items(" + data.ID + ")"
                );
              },
              type: "POST",
              contentType: "application/json;odata=verbose",
              headers: {
                  "Accept": "application/json;odata=verbose",
                  "Content-type": "application/json;odata=verbose",
                  "X-RequestDigest": Admin.FormDigestValue,
                  "X-HTTP-Method": "MERGE",
                  "If-Match": "*"
              },
              complete: function (jqXHR, textStatus) {
                if (textStatus == "error") {
                  kendo.alert(
                    "Error updating question(s). Refresh the screen or check your data and try again. Contact IT Support if this problem persists.");
                  console.log("Error updating question(s). ERROR: " + jqXHR.responseText);
                } else Admin.grid.configureChecklistGrid();
              }
            },
            destroy: {
              url: function (data) {
                //console.log(data);
                return (Admin.site + "/_api/web/lists/GetByTitle('" + Admin.checklistTemplateListName +"')/items(" + data.ID + ")" );
              },
              type: "POST",
              contentType: "application/json;odata=verbose",
              headers: {
                "X-RequestDigest": Admin.FormDigestValue,
                "X-Http-Method": "DELETE",
                "If-Match": "*",
              },
              complete: function (jqXHR, textStatus) {
                if (textStatus == "error") {
                  kendo.alert("Error deleting question. Refresh the screen and try again, or contact IT Support if this problem persists." );
                  console.log("Error deleting question. ERROR: " + jqXHR.responseText );
                } else {
                  console.log(jqXHR);
                  console.log(textStatus);
                  Admin.grid.configureChecklistGrid();
                }
              },
            },
            parameterMap: function (data, operation) {
              if (operation == "update") {
                return kendo.stringify({
                  ID: data.ID,
                  //Title: data.Title,
                  QuestionNumber: data.QuestionNumber,
                  Question: data.Question,
                  Reference: data.Reference,
                  ReferenceData: data.ReferenceData,
                  ReferenceDate: data.ReferenceDate,
                  ObsoleteQuestion: data.ObsoleteQuestion,
                  ProgramId: Admin.selectedProgramId,
                  __metadata: { type: data.__metadata.type },
                });
              } else if (operation == "create") {
                return kendo.stringify({
                  //Id: data.Id,
                  Title: "no title",
                  QuestionNumber: data.QuestionNumber,
                  Question: data.Question,
                  Reference: data.Reference,
                  ReferenceData: data.ReferenceData,
                  ReferenceDate: data.ReferenceDate,
                  ObsoleteQuestion: data.ObsoleteQuestion,
                  ProgramId: Admin.selectedProgramId,
                  __metadata: { type: data.__metadata.type },
                });
              }
            },
          },
          schema: {
            data: function (data) {
              return data.d && data.d.results ? data.d.results : [data.d];
            },
            model: {
              id: "ID",
              fields: {
                ID: { type: "number", editable: false },
                //Title: {type: "string", editable: Admin.isOwner },
                ProgramId: { type: "number", editable: Admin.isOwner },
                QuestionNumber: { type: "string", editable: Admin.isOwner },
                Question: { type: "string", editable: Admin.isOwner },
                Reference: { type: "string", editable: Admin.isOwner },
                ReferenceDate: { type: "date", editable: Admin.isOwner },
                ReferenceData: { type: "string", editable: Admin.isOwner },
                ObsoleteQuestion: { type: "boolean", editable: Admin.isOwner },
              },
            },
            total: function (result) {
              var data = this.data(result);
              return data ? data.length : 0;
            },
          },
        },
        persistSelection: true,
        height: 600,
        //editable: Admin.isOwner,
        editable: {
          confirmation: false
        },
        groupable: false,
        reorderable: true,
        sortable: true,
        scrollable: true,
        resizable: true,
        filterable: true,
        toolbar: [
          { name: "create", attr: "style=float:left" },
          { name: "save", attr: "style=float:left" },
          { name: "cancel", attr: "style=float:left" },
          //{"name": "excel", "attr": "style=float:left"},
          { template: kendo.template($("#toolbarTemplate").html()) },
        ],
        //excel: {filename: "ChecklistExport.xlsx", allPages: true },
        columns: [
          {
            field: "QuestionNumber",
            title: "No.",
            exportable: true,
            width: 50,
          },
          {
            field: "Question",
            title: "Question",
            exportable: true,
            filterable: false,
            width: 600,
          },
          {
            field: "Reference",
            title: "Reference",
            exportable: true,
            width: 130,
          },
          {
            field: "ReferenceDate",
            title: "Reference Date",
            exportable: true,
            width: 95,
            template: "#= kendo.toString(kendo.parseDate(ReferenceDate), 'MM/dd/yyyy')#",
          },
          {
            field: "ReferenceData",
            title: "Reference Data",
            exportable: true,
            width: 120,
          },
          {
            field: "ObsoleteQuestion",
            title: "Obsolete?",
            exportable: true,
            template: '<input type="checkbox" name="ObsoleteQuestion" #= (ObsoleteQuestion ? \'checked="checked"\' : "") # class="chkbx" #= (Admin.isOwner ? "" : \'disabled="disabled"\') #/>',
            attributes: { align: "center" },
            width: 75,
          },
          {
            command: ["destroy"],
            width: 100,
            hidden: !Admin.isOwner,
          },
        ],
        dataBound: function () {
          if (Admin.isOwner) Admin.utilities.enableGridButtons();
        },
        edit: function () {
          Admin.grid.checkForChanges();
        },
        error: function (err) {
          kendo.alert("Error retrieving checklist questions. Refresh the screen and try again, or contact IT Support if this problem persists.");
          console.log("Error retrieving checklist questions. ERROR: " + JSON.stringify(err));
        },
      });
    },

    checkForChanges: function () {
      var hasChanges = $("#checklistGrid").data("kendoGrid").dataSource.hasChanges();
      if (hasChanges) {
        $(".k-button.k-grid-save-changes").addClass("secondary");
      }
    },
  },

  copy: {
    toggleCopySection: function () {
      $("#copyToSection").toggle();
      $("#copyButton").toggle();
    },

    toggleSendToSection: function () {
      $("#sendToInspectionChecklistSection").toggle();
      $("#sendToInspectionChecklistButton").toggle();
    },

    copyQuestions: function () {
      Admin.utilities.showSpinner();
      var sourceQuestions = [];
      var grid = $("#checklistGrid").data("kendoGrid");
      //create array of questions in the grid
      $.each(grid._data, function (i, val) {
        var date = val.ReferenceDate ? val.ReferenceDate.toISOString() : null;
        sourceQuestions.push({
          Title: "no title",
          Reference: val.Reference,
          ReferenceData: val.ReferenceData,
          ReferenceDate: date,
          QuestionNumber: val.QuestionNumber,
          Question: val.Question,
        });
      });

      // now add copied questions to the Checklists list
      // get_current() does not work in FlankSpeed.  Returns https://flankspeed.sharepoint-mil/ for some reason -MDL 5/3/22
      //var context = new SP.ClientContext.get_current();
      var context = new SP.ClientContext(Admin.site);
      var web = context.get_web();
      var list = web.get_lists().getByTitle(Admin.checklistTemplateListName);

      setTimeout(function () {
        for (var j = 0; j < sourceQuestions.length; j++) {
          var listItemInfo = new SP.ListItemCreationInformation();
          var listItem = list.addItem(listItemInfo);

          listItem.set_item("Title", "no title");

          var lookupField = new SP.FieldLookupValue();
          lookupField.set_lookupId(Admin.copyToProgramId);
          listItem.set_item("Program", lookupField);

          listItem.set_item("Reference", sourceQuestions[j].Reference);
          listItem.set_item("ReferenceData", sourceQuestions[j].ReferenceData);
          listItem.set_item("ReferenceDate", sourceQuestions[j].ReferenceDate);
          listItem.set_item("QuestionNumber", sourceQuestions[j].QuestionNumber);
          listItem.set_item("Question", sourceQuestions[j].Question);

          listItem.update();
        }
        context.executeQueryAsync(
          //on success
          Function.createDelegate(this, function () {
            Admin.utilities.hideSpinner();
            kendo.alert(
              "Successfully copyied the questions to the new program!"
            );
            Admin.copy.toggleCopySection();
          }),
          //on failure
          Function.createDelegate(this, function (sender, args) {
            Admin.utilities.hideSpinner();
            kendo.alert(
              "Error copying selected checklist questions.  Refresh the screen and try again or contact IT Support if the problem persists.<br/><br/>" +
                args.get_message()
            );
          })
        );
      }, 100);
    },

    sendToE3Checklist: function () {
      Admin.utilities.showSpinner();

      var gridQuestions = [];
      var grid = $("#checklistGrid").data("kendoGrid");

      //create array of questions in the grid
      $.each(grid._data, function (i, val) {
        var date = val.ReferenceDate ? val.ReferenceDate.toISOString() : null;
        gridQuestions.push({
          Title: "no title",
          Reference: val.Reference,
          ReferenceData: val.ReferenceData,
          ReferenceDate: date,
          QuestionNumber: val.QuestionNumber,
          Question: val.Question,
        });
      });

      // now add copied questions to the destination Command Inspection Checklists list
      var context = new SP.ClientContext(Admin.destSiteURL);
      var web = context.get_web();
      var list = web.get_lists().getByTitle(Admin.commandInspectionChecklistsListName);

      setTimeout(function () {
        for (var j = 0; j < gridQuestions.length; j++) {
          var listItemInfo = new SP.ListItemCreationInformation();
          var listItem = list.addItem(listItemInfo);

          listItem.set_item("Program", Admin.selectedProgramTitle);
          listItem.set_item("Reference", gridQuestions[j].Reference);
          listItem.set_item("ReferenceData", gridQuestions[j].ReferenceData);
          listItem.set_item("ReferenceDate", gridQuestions[j].ReferenceDate);
          listItem.set_item("QuestionNumber", gridQuestions[j].QuestionNumber);
          listItem.set_item("Question", gridQuestions[j].Question);

          listItem.update();
        }

        context.executeQueryAsync(
          Function.createDelegate(this, function () {
            //success
            Admin.utilities.hideSpinner();
            kendo.alert("Success sending Program questions to Ech III Command Self-Assessment Grid at this URL: " + Admin.destSiteURL);
            Admin.copy.toggleSendToSection();
          }),
          Function.createDelegate(this, function (sender, args) {
            //failure
            Admin.utilities.hideSpinner();
            kendo.alert("Error sending to Ech III site.  Refresh the screen and try again or contact IT Support if the problem persists.<br/><br/>" + args.get_message() );
            console.log("Error sending to Ech III site:" + args.get_message());
          })
        );
      }, 100);
    },

    confirmCopyAll: function () {
      kendo
        .confirm(
          "This will copy EVERY valid question (not Obsolete) to the selected ECH III command site.<br/><br/>It will NOT replace existing questions.<br/><br/>" +
            "Are you sure you want to do this?<br/><br/>If so, please be patient.  This may take awhile."
        )
        .done(function () {
          //yes
          Admin.copy.allQuestions();
        })
        .fail(function () {
          //no
          console.log("user canceled");
        });
    },

    allQuestions: function () {
      Admin.utilities.showSpinner();

      var baseURL = Admin.site + "/_api/web/lists/GetByTitle('" + Admin.checklistTemplateListName + "')/items",
        select = "?$select=QuestionNumber,Question,Program/Title,ObsoleteQuestion,Reference,ReferenceDate,ReferenceData&$top=2000",
        expand = "&$expand=Program",
        filter = "&$filter=ObsoleteQuestion ne 1",
        endpoint = baseURL + select + expand + filter;

      var questions = [],
        questionCount = 0,
        batchSize = 200,
        numberOfBatches = 0,
        batchesCommitted = 0;

      $.ajax({
        url: endpoint,
        type: "GET",
        headers: { Accept: "application/json;odata=verbose" },
      })
        .done(function (data) {
          questionCount = data.d.results.length;
          numberOfBatches = Math.ceil(questionCount / batchSize);

          $.each(data.d.results, function (i, val) {
            //var date = (val.ReferenceDate ? val.ReferenceDate : null);
            questions.push({
              Title: "no title",
              Reference: val.Reference,
              ReferenceData: val.ReferenceData,
              ReferenceDate: val.ReferenceDate,
              QuestionNumber: val.QuestionNumber,
              Question: val.Question,
              Program: val.Program.Title,
            });
          });
        })
        .then(function () {
          // get ctx of destination site
          var context = new SP.ClientContext(Admin.destSiteURL),
            web = context.get_web(),
            list = web
              .get_lists()
              .getByTitle(Admin.commandInspectionChecklistsListName),
            itemsCopied = 0;

          for (var k = 0; k < numberOfBatches; k++) {
            // perform this loop for each batch
            // console.log("-------------------------------------------inside batch loop #" + k + " of " + numberOfBatches);

            for (var p = 0; p < batchSize; p++) {
              //for each item in this batch of 100, do this
              if (itemsCopied < questionCount) {
                var listItemInfo = new SP.ListItemCreationInformation();
                var listItem = list.addItem(listItemInfo);

                listItem.set_item("Program", questions[itemsCopied].Program);
                listItem.set_item(
                  "Reference",
                  questions[itemsCopied].Reference
                );
                listItem.set_item(
                  "ReferenceData",
                  questions[itemsCopied].ReferenceData
                );
                listItem.set_item(
                  "ReferenceDate",
                  questions[itemsCopied].ReferenceDate
                );
                listItem.set_item(
                  "QuestionNumber",
                  questions[itemsCopied].QuestionNumber
                );
                listItem.set_item("Question", questions[itemsCopied].Question);

                listItem.update();
                itemsCopied++;
              }
            }

            context.executeQueryAsync(
              //this will execute once per batch
              Function.createDelegate(this, function () {
                //success
                batchesCommitted++;
                if (batchesCommitted == numberOfBatches) {
                  Admin.utilities.hideSpinner();
                  kendo.alert(
                    "Success creating " +
                      itemsCopied +
                      " items on the Ech III Command Self-Assessment Checklist at this URL: " +
                      Admin.destSiteURL
                  );
                }
                console.log(
                  "batch copied=" + batchesCommitted + " of " + numberOfBatches
                );
              }),
              Function.createDelegate(this, function (sender, args) {
                //failure
                Admin.utilities.hideSpinner();
                kendo.alert(
                  "Error sending all items to Ech III site on batch# " +
                    batchesCommitted +
                    " of " +
                    numberOfBatches +
                    " batches.<br/><br/>Contact IT Support or purge the destination list, fix the error and try again.<br/><br/>" +
                    args.get_message()
                );
                console.log(
                  "Error sending batch to Ech III site for batch#: " +
                    batchesCommitted +
                    " of " +
                    numberOfBatches +
                    "\n" +
                    "\n" +
                    args.get_message()
                );
                $("body").css("cursor", "default");
              })
            );
          }
        })
        .fail(function (error) {
          Admin.utilities.hideSpinner();
          kendo.alert(
            "Error retrieving the questions from the checklist template. Refresh the screen and try again, or contact IT Support if this problem persists.<br/><br/>" +
              JSON.stringify(error)
          );
          console.log(
            "Error retrieving the questions from the checklist template. ERROR: " +
              JSON.stringify(error)
          );
          console.log(error);
        });
    },
  },

  utilities: {
    showSpinner: function () {
      var elem = $("#WebPartWPQ2");
      kendo.ui.progress(elem, true);
      $("body").css("cursor", "progress");
    },

    hideSpinner: function () {
      var elem = $("#WebPartWPQ2");
      kendo.ui.progress(elem, false);
      $("body").css("cursor", "default");
    },

    prompt: function () {
      kendo.prompt("Enter the name of the new Program").done(function (data) {
        Admin.ajax.createProgram(data);
      });
    },

    enableGridButtons: function () {
      $("#copyButton").removeAttr("disabled");
      $("#sendToInspectionChecklistButton").removeAttr("disabled");
    },

    enableSendButtons: function (val) {
      if (val) {
        $("#submitSendToInspectionChecklistButton").removeAttr("disabled");
        $("#sendAllButton").removeAttr("disabled");
        $("#batchDelete").removeAttr("disabled");
      } else {
        $("#submitSendToInspectionChecklistButton").attr(
          "disabled",
          "disabled"
        );
        $("#sendAllButton").attr("disabled", "disabled");
        $("#batchDelete").attr("disabled", "disabled");
      }
    },

    deleteEch3Programs: function () {
      console.log("start deleting existing questions from Ech III site for program " + Admin.selectedProgramTitle );
      var caml = "<View><Query><Where><Eq><FieldRef Name='Program'/><Value Type='Text'>" +
                  Admin.selectedProgramTitle +
                "</Value></Eq></Where></Query></View>";
      var context = new SP.ClientContext(Admin.destSiteURL);
      var web = context.get_web();
      var list = web.get_lists().getByTitle(Admin.commandInspectionChecklistsListName);
      var camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml(caml);
      var itemCollection = list.getItems(camlQuery);

      context.load(itemCollection, "Include(Id)");

      context.executeQueryAsync(
        Function.createDelegate(this, function () {
          //loaded the collection
          //now delete
          var listItemEnumerator = itemCollection.getEnumerator();
          while (listItemEnumerator.moveNext()) {
            var item = listItemEnumerator.get_current();
            list.getItemById(item.get_id()).deleteObject();
          }

          context.executeQueryAsync(
            Function.createDelegate(this, function () {
              //successfully deleted
              Admin.utilities.hideSpinner();
              console.log("successfully deleted existing questions");
              Admin.copy.sendToE3Checklist();
            }),
            Function.createDelegate(this, function (sender, args) {
              //failed on delete
              Admin.utilities.hideSpinner();
              kendo.alert("Error deleting existing questions from the Ech III checklist.<br/><br/>" +
                "stack: " + args.get_message() );
              console.log("Error deleting existing questions from the list. ERROR: " + args.get_message());
            })
          );
        }),
        Function.createDelegate(this, function (sender, args) {
          //failed to load the collection
          Admin.utilities.hideSpinner();
          kendo.alert("Error loading existing questions from the Ech III checklist.<br/><br/>" +
             "stack: " + args.get_message());
          console.log("Error loading itemCollection from the Ech III list. ERROR: " + args.get_message());
        })
      );
    },

    confirmBatchDelete: function () {
      kendo
        .confirm(
          "This will delete EVERY valid question on the following ECH III command site:<br/><br/>" +
            Admin.destSiteTitle + "<br/><br/>" +
            "This cannot be un-done.  Are you sure you want to do this?"
        )
        .done(function () {
          //yes
          Admin.utilities.batchDelete();
        })
        .fail(function () {
          //no
          console.log("user canceled");
        });
    },

    batchDelete: function () {
      //this is used during testing only to delete all question from the ECH III command checklist
      //use caution!  this cannot be undone!
      Admin.utilities.showSpinner();

      var context = new SP.ClientContext(Admin.destSiteURL);
      var web = context.get_web();
      var list = web.get_lists().getByTitle(Admin.commandInspectionChecklistsListName);
      var camlQuery = new SP.CamlQuery();
      camlQuery.set_viewXml("<View><RowLimit>3000</RowLimit></View>");
      var itemCollection = list.getItems(camlQuery);
      context.load(itemCollection, "Include(Id)");
      var itemCount = 0;
      var itemArray = [];

      context.executeQueryAsync(
        Function.createDelegate(this, function () {
          //get item collection success
          itemCount = itemCollection.get_count();
          var listItemEnumerator = itemCollection.getEnumerator();
          while (listItemEnumerator.moveNext()) {
            var item = listItemEnumerator.get_current();
            itemArray.push(item);
          }

          var batchSize = 200;
          var numberOfBatches = 0;
          if (batchSize < itemCount) {
            numberOfBatches = Math.ceil(itemCount / batchSize);
          } else numberOfBatches = 1;
          var batchesCommitted = 0;

          for (var i = 0; i < numberOfBatches; i++) {
            for (var j = itemCount - 1; j >= 0; j--) {
              list.getItemById(itemArray[j].get_id()).deleteObject();
              itemCount--;
            }

            context.executeQueryAsync(
              Function.createDelegate(this, function () {
                batchesCommitted++;
                if (batchesCommitted == numberOfBatches) {
                  Admin.utilities.hideSpinner();
                  kendo.alert("Success deleting all questions from Ech III checklist: " + Admin.destSiteTitle );
                  console.log("Success deleting all questions from Ech III checklist: " + Admin.destSiteURL );
                }
                console.log("deleted batch#" + batchesCommitted + " of " + numberOfBatches);
              }),
              Function.createDelegate(this, function (sender, args) {
                Admin.utilities.hideSpinner();
                kendo.alert("Errors deleting questions from Ech III checklist.<br/><br/>" +
                    "stack: " + args.get_message() +
                    "<br/><br/>If the server timed out, just click again to delete another batch."
                );
                console.log("Error deleting questions on batch#" + batchesCommitted + " from Ech III site: " + args.get_message());
              })
            );
          }
        }),
        Function.createDelegate(this, function (sender, args) {
          //failure get item collection
          Admin.utilities.hideSpinner();
          kendo.alert("Error loading all questions (to delete) from Ech III checklist<br/><br/>" + args.get_message() );
          console.log("Error loading all questions (to delete) from Ech III site: " + args.get_message() );
        })
      );
    },
  },
};