"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopyProgram = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var ds_1 = require("../ds");
var strings_1 = require("../strings");
/**
 * Copy Program
 * Copies the checklist items for a specified program.
 */
var CopyProgram = /** @class */ (function () {
    // constructor
    function CopyProgram(props) {
        this._props = null;
        // Save the properties
        this._props = props;
        // Render the copy program modal
        this.renderCopyProgram();
    }
    // Copies the program items
    CopyProgram.prototype.copyProgramItems = function (programId) {
        var _this = this;
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Copying Program");
        dattatable_1.LoadingDialog.setBody("This dialog will close after the program items are copied...");
        dattatable_1.LoadingDialog.show();
        // Return a promise
        return new Promise(function (resolve, reject) {
            var list = (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Checklist);
            // Parse the items to copy
            var items = ds_1.DataSource.getItemsByProgram(_this._props.sourceProgram.text);
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                // Copy the item
                list.Items().add({
                    "programId": programId,
                    "questionNumber": item.questionNumber,
                    "question": item.question,
                    "reference": item.reference,
                    "referenceData": item.referenceData,
                    "referenceDate": item.referenceDate,
                    "obsoleteQuestion": item.obsoleteQuestion
                }).batch();
            }
            // Execute the batch request
            list.execute(function () {
                // Close the loading dialog
                dattatable_1.LoadingDialog.hide();
                // Resolve the request
                resolve();
            }, reject);
        });
    };
    // Creates the new program
    CopyProgram.prototype.createProgram = function (programName) {
        var _this = this;
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Creating Program");
        dattatable_1.LoadingDialog.setBody("This dialog will close after the program item is created...");
        dattatable_1.LoadingDialog.show();
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Create the new program
            (0, gd_sprest_bs_1.Web)(strings_1.default.SourceUrl).Lists(strings_1.default.Lists.Programs).Items().add({
                Title: programName
            }).execute(
            // Success
            function (item) {
                // Refresh the programs in the DataSource
                ds_1.DataSource.loadPrograms().then(function () {
                    // Update this component's programs dropdown items
                    _this._props.programs = ds_1.DataSource.Programs;
                    // Hide the loading dialog
                    dattatable_1.LoadingDialog.hide();
                    // Resolve the request
                    resolve();
                });
            }, 
            // Error
            function (resp) {
                // Log the error
                console.error("Error creating the list item.", resp);
                // Hide the loading dialog
                dattatable_1.LoadingDialog.hide();
                // Reject the request
                reject();
            });
        });
    };
    // Generate the program dropdown items
    CopyProgram.prototype.generateProgramItems = function () {
        var _this = this;
        // Define the default options
        var items = [
            {
                text: ""
            },
            {
                text: "Create a New Program...",
                value: "CreateNewProgram",
                onClick: function () {
                    // This isn't being called. Need to figure this out.
                    // Show the create program modal
                    _this.renderCreateProgram();
                }
            },
            {
                isDivider: true // This isn't being rendered. Need to figure this out.
            },
            {
                text: "Programs:",
                isHeader: true
            }
        ];
        // Parse the programs
        for (var i = 0; i < this._props.programs.length; i++) {
            var program = this._props.programs[i];
            // Skip the source program
            if (program.value == this._props.sourceProgram.value) {
                continue;
            }
            // Append the program
            items.push(program);
        }
        // Return the program items
        return items;
    };
    // Renders the copy program modal
    CopyProgram.prototype.renderCopyProgram = function () {
        var _this = this;
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Copy Program");
        // Set the body
        var form = gd_sprest_bs_1.Components.Form({
            el: dattatable_1.Modal.BodyElement,
            controls: [
                {
                    name: "selectedProgram",
                    label: "Source Program:",
                    type: gd_sprest_bs_1.Components.FormControlTypes.Readonly,
                    description: "The selected program to get the questions from.",
                    value: this._props.sourceProgram.text
                },
                {
                    name: "programs",
                    label: "Destination Program:",
                    type: gd_sprest_bs_1.Components.FormControlTypes.Dropdown,
                    description: "If your program doesn't exist, select the 'Create New Program' item from the dropdown list.",
                    items: this.generateProgramItems(),
                    errorMessage: "Please select a valid program.",
                    required: true,
                    onChange: function (item) {
                        if (item.value == "CreateNewProgram") {
                            // Show the create program modal
                            _this.renderCreateProgram();
                            //TODO Gunjan to fix this
                        }
                    },
                    onValidate: function (ctrl, results) {
                        // Ensure a program was selected
                        var selectedProgram = results.value;
                        if (selectedProgram == null || !(parseInt(selectedProgram.value) > 0)) {
                            // No valid program selected
                            results.isValid = false;
                        }
                        // Return the results
                        return results;
                    }
                }
            ]
        });
        // Set the footer
        gd_sprest_bs_1.Components.TooltipGroup({
            el: dattatable_1.Modal.FooterElement,
            tooltips: [
                {
                    content: "Copies the questions displayed in the grid to the selected program",
                    btnProps: {
                        text: "Copy",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                        onClick: function () {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                var selectedProgram = form.getValues()["programs"];
                                // Bulk copy the items to the selected program
                                _this.copyProgramItems(parseInt(selectedProgram.value)).then(function () {
                                    // Update the loading dialog
                                    dattatable_1.LoadingDialog.setHeader("Refreshing Programs");
                                    dattatable_1.LoadingDialog.setBody("This will close after the data has refreshed...");
                                    dattatable_1.LoadingDialog.show();
                                    // Refresh the data source
                                    ds_1.DataSource.refresh().then(function () {
                                        // Close the loading dialog
                                        dattatable_1.LoadingDialog.hide();
                                        // Display the success modal
                                        _this.showSuccess();
                                    });
                                });
                            }
                        }
                    }
                },
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Cancel",
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
    // Renders the create modal
    CopyProgram.prototype.renderCreateProgram = function () {
        var _this = this;
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Create New Program");
        // Set the body
        var form = gd_sprest_bs_1.Components.Form({
            el: dattatable_1.Modal.BodyElement,
            controls: [
                {
                    name: "program",
                    label: "Program Name:",
                    type: gd_sprest_bs_1.Components.FormControlTypes.TextField,
                    required: true,
                    errorMessage: "A program name is required.",
                    onValidate: function (ctrl, results) {
                        // See if there is a value
                        if (results.value) {
                            // Parse the programs
                            for (var i = 0; i < _this._props.programs.length; i++) {
                                // Ensure the program doesn't exist
                                if (_this._props.programs[i].text == results.value) {
                                    // Set the flag
                                    results.isValid = false;
                                    results.invalidMessage = "This program already exists. Please update it and try again.";
                                    break;
                                }
                            }
                        }
                        // Return the results
                        return results;
                    }
                }
            ]
        });
        // Set the footer
        gd_sprest_bs_1.Components.TooltipGroup({
            el: dattatable_1.Modal.FooterElement,
            tooltips: [
                {
                    content: "Creates the new program",
                    btnProps: {
                        text: "Create",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                        onClick: function () {
                            // Ensure the form is valid
                            if (form.isValid()) {
                                // Create the program
                                _this.createProgram(form.getValues()["program"]).then(function () {
                                    // Display the copy program
                                    _this.renderCopyProgram();
                                });
                            }
                        }
                    }
                },
                {
                    content: "Returns to the copy modal",
                    btnProps: {
                        text: "Back",
                        type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                        onClick: function () {
                            // Display the copy program
                            _this.renderCopyProgram();
                        }
                    }
                }
            ]
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    // Displays the success message after copying the program items
    CopyProgram.prototype.showSuccess = function () {
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setBody("Successfully copied the program items.");
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
    return CopyProgram;
}());
exports.CopyProgram = CopyProgram;
