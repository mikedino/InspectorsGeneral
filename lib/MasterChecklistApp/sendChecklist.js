"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendChecklist = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var ds_1 = require("../ds");
var strings_1 = require("../strings");
/**
 * Send Checklist
 * Copies the checklist items to a specified directory/command sub-web.
 */
var SendChecklist = /** @class */ (function () {
    // constructor
    function SendChecklist(props) {
        this._props = null;
        // Save the properties
        this._props = props;
        // Render the E3 modal
        this.renderE3Modal();
    }
    // Copies the selected program questions to the selected command/directory
    SendChecklist.prototype.sendQuestionsToCommand = function (commandUrl, selectedPrograms) {
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading Program Data");
        dattatable_1.LoadingDialog.setBody("Loading the existing program data...");
        dattatable_1.LoadingDialog.show();
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the data
            ds_1.DataSource.loadCommandData(commandUrl).then(function (mapper) {
                // Update the loading dialog
                dattatable_1.LoadingDialog.setHeader("Sending Questions");
                dattatable_1.LoadingDialog.setBody("This dialog will close after the questions are copied...");
                // Parse the selected programs for creating items in CI Program Identification list 
                // and query master checklist to determine which questions to send
                var items = [];
                var programs = [];
                for (var i = 0; i < selectedPrograms.length; i++) {
                    // Append the items associated with each program
                    items = items.concat(ds_1.DataSource.getItemsByProgram(selectedPrograms[i].label));
                    // append program names to array
                    programs.push(selectedPrograms[i].label);
                }
                // Update the loading dialog
                var totalBatches = Math.ceil(items.length / 100);
                dattatable_1.LoadingDialog.setBody("Executing batch request 1 of " + totalBatches);
                // Create the batch counter and list to add the items to
                var list = (0, gd_sprest_bs_1.Web)(commandUrl).Lists(strings_1.default.Lists.CommandInspectionChecklists);
                var _loop_1 = function (i) {
                    var item = items[i];
                    if (item.obsoleteQuestion != true) {
                        // See if a new batch is required
                        var newBatch = i > 0 && i % 100 == 0 ? true : false;
                        // See if we have already copied the item
                        var itemId = mapper[item.Id];
                        if (itemId > 0) {
                            // Copy the item
                            list.Items(itemId).update({
                                //__metadata: { type: "SP.Data.CommandInspectionChecklistsListItem" },
                                "Title": item.program.Title,
                                "QuestionNumber": item.questionNumber,
                                "Question": item.question,
                                "Reference": item.reference,
                                "ReferenceData": item.referenceData,
                                "ReferenceDate": item.referenceDate,
                                "ObsoleteQuestion": item.obsoleteQuestion ? true : false
                            }).batch(function () {
                                // Update the loading dialog for each batch
                                dattatable_1.LoadingDialog.setBody("Executing batch request " + Math.ceil(i / 100) + " of " + totalBatches);
                            }, newBatch);
                        }
                        else {
                            // Copy the item
                            list.Items().add({
                                "Title": item.program.Title,
                                "QuestionNumber": item.questionNumber,
                                "Question": item.question,
                                "Reference": item.reference,
                                "ReferenceData": item.referenceData,
                                "ReferenceDate": item.referenceDate,
                                "ObsoleteQuestion": item.obsoleteQuestion ? true : false,
                                "MasterId": item.Id
                            }).batch(function () {
                                // Update the loading dialog for each batch
                                dattatable_1.LoadingDialog.setBody("Executing batch request " + Math.ceil(i / 100) + " of " + totalBatches);
                            }, newBatch);
                        }
                    }
                };
                // Parse the items to copy
                for (var i = 0; i < items.length; i++) {
                    _loop_1(i);
                }
                // Execute the batch request
                list.execute(function () {
                    // Send selected programs to CI Program ID list
                    dattatable_1.LoadingDialog.setBody("Creating CI Program Identification items...");
                    // Get the CI Program Identification list
                    var ProgramIDList = (0, gd_sprest_bs_1.Web)(commandUrl).Lists(strings_1.default.Lists.CIProgramIdentification);
                    // Parse the program items to copy
                    for (var i = 0; i < programs.length; i++) {
                        var program = programs[i];
                        ProgramIDList.Items().add({
                            "Title": program
                        }).batch();
                    }
                    ProgramIDList.execute(function () {
                        // Close the loading dialog
                        dattatable_1.LoadingDialog.hide();
                        // Resolve the request
                        resolve();
                    });
                }, reject);
            }, function (err) {
                // TODO
                // On Error what should we do?
                dattatable_1.Modal.clear();
                dattatable_1.Modal.setHeader("Error sending questions");
                dattatable_1.Modal.setBody("<p>There was an error sending the checklist questions to the subweb</p><p>ERROR: " + err + "</p>");
                console.log("[ERROR sendChecklist.ts] ", err);
            });
        });
    };
    // Generate the directory dropdown items
    SendChecklist.prototype.generateDirectoryItems = function () {
        // Define the default options
        var items = [];
        // Parse the directories
        for (var i = 0; i < ds_1.DataSource.Directories.length; i++) {
            var directory = ds_1.DataSource.Directories[i];
            // Ensure a url is specified
            if (directory.url && directory.url.Url) {
                // Append the item
                items.push({
                    data: directory,
                    text: directory.Title,
                    value: directory.url.Url
                });
            }
        }
        // Return the directory items
        return items;
    };
    // Renders the E3 modal
    SendChecklist.prototype.renderE3Modal = function () {
        var _this = this;
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Copy Program");
        dattatable_1.Modal.setType(gd_sprest_bs_1.Components.ModalTypes.XLarge);
        // Set the body
        var form = gd_sprest_bs_1.Components.Form({
            el: dattatable_1.Modal.BodyElement,
            controls: [
                {
                    name: "directory",
                    label: "Select a Command:",
                    type: gd_sprest_bs_1.Components.FormControlTypes.Dropdown,
                    description: "Select the command to send the questions to.",
                    items: this.generateDirectoryItems(),
                    errorMessage: "Please select a valid command.",
                    required: true,
                    onValidate: function (ctrl, results) {
                        // Ensure a directory/command was selected
                        var selectedDirectory = results.value;
                        if (selectedDirectory == null) {
                            // No valid command selected
                            results.isValid = false;
                        }
                        // Return the results
                        return results;
                    }
                },
                {
                    name: "selectedPrograms",
                    label: "Select Programs:",
                    type: gd_sprest_bs_1.Components.FormControlTypes.MultiCheckbox,
                    description: "Select the programs you wish to send to the ECHII Command Site.",
                    items: ds_1.DataSource.ProgramsCBItems,
                    onControlRendering: function (ctrl) {
                        ctrl.colSize = 4;
                    }
                }
            ]
        });
        // set footer style to float select button on left
        dattatable_1.Modal.FooterElement.style.justifyContent = "space-between";
        // add close event to reset style
        dattatable_1.Modal.setCloseEvent(function () {
            dattatable_1.Modal.FooterElement.style.justifyContent = "flex-end";
        });
        // Set footer - select all button on left
        var btnSelect = null;
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Selects all the programs",
            btnProps: {
                assignTo: function (btn) {
                    btnSelect = btn;
                },
                text: "Clear Selections",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                onClick: function () {
                    var isChecked = btnSelect.el.innerHTML == "Select All";
                    // See if we are selecting all of the items
                    var selectedValues = [];
                    if (isChecked) {
                        // Parse the items
                        for (var i = 0; i < ds_1.DataSource.ProgramsCBItems.length; i++) {
                            // Append the value
                            selectedValues.push(ds_1.DataSource.ProgramsCBItems[i].label);
                        }
                    }
                    // Set the selection
                    form.getControl("selectedPrograms").checkbox.setValue(selectedValues);
                    // Update the button
                    btnSelect.setText(isChecked ? "Clear Selections" : "Select All");
                }
            }
        });
        // Set the footer - action buttons on right
        gd_sprest_bs_1.Components.TooltipGroup({
            el: dattatable_1.Modal.FooterElement,
            tooltips: [
                {
                    content: "Copies the questions for the Programs selected above to the selected command",
                    btnProps: {
                        text: "Send Selected Programs",
                        className: "ms-1",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                        onClick: function () {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                var formValues = form.getValues();
                                var selectedDirectory = formValues["directory"];
                                // Bulk copy the items to the selected program
                                _this.sendQuestionsToCommand(selectedDirectory.value, formValues["selectedPrograms"]).then(function () {
                                    // Update the loading dialog
                                    dattatable_1.LoadingDialog.setHeader("Refreshing Programs");
                                    dattatable_1.LoadingDialog.setBody("This will close after the data has refreshed...");
                                    dattatable_1.LoadingDialog.show();
                                    // Close the loading dialog
                                    dattatable_1.LoadingDialog.hide();
                                    // Display the success modal
                                    _this.showSuccess();
                                });
                            }
                        }
                    }
                },
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Cancel",
                        className: "ms-1",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                        onClick: function () {
                            // Close the dialog
                            dattatable_1.Modal.hide();
                        }
                    }
                }
            ]
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    // Displays the success message after copying the program items
    SendChecklist.prototype.showSuccess = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setBody("Successfully copied the Programs to the ECHIII command.");
        // Render a close button in the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Closes the modal.",
            btnProps: {
                text: "Close",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineSuccess,
                onClick: function () {
                    // Close the modal
                    dattatable_1.Modal.hide();
                }
            }
        });
    };
    return SendChecklist;
}());
exports.SendChecklist = SendChecklist;
