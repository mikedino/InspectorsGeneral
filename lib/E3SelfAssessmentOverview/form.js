"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfAssessmentOverviewForms = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var jQuery = require("jquery");
var strings_1 = require("../strings");
var ds_1 = require("./ds");
require("./styles.scss");
var template_html_1 = require("./template.html");
/**
 * Inspection Schedule Forms
 */
var SelfAssessmentOverviewForms = /** @class */ (function () {
    function SelfAssessmentOverviewForms() {
    }
    // Creates a new event
    SelfAssessmentOverviewForms.create = function (program, onUpdated) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.SelfAssessmentOverview;
        // Show the new form
        dattatable_1.ItemForm.create({
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
            },
            onSetHeader: function (el) {
                el.innerHTML = "Create Self Assessment Overview for " + program;
            },
            onCreateEditForm: function (props) {
                props.onControlRendering = function (ctrl, field) {
                    // get title field and set the value to the current program
                    if (field.InternalName == "Title") {
                        // don't allow updates to Program Name
                        ctrl.isDisabled = true;
                        ctrl.value = program;
                    }
                };
                props.onFormRendered = function (form) {
                    // Set the size of the form
                    dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
                    // create a new container for custom HTML
                    var formEl = document.createElement('div');
                    formEl.innerHTML = template_html_1.default;
                    form.el.prepend(formEl);
                    // iterate thru form and move form elements accordingly
                    _this.renderCustomForm();
                };
                return props;
            },
            onUpdate: function (item) {
                onUpdated();
            }
        });
    };
    // Displays the edit form
    SelfAssessmentOverviewForms.edit = function (item, onUpdated) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.SelfAssessmentOverview;
        // Show the edit form
        dattatable_1.ItemForm.edit({
            onSetHeader: function (el) {
                el.innerHTML = "Edit ".concat(item.Title, " - Self Assessment Overview");
            },
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
            },
            onCreateEditForm: function (props) {
                props.onFormRendered = function (form) {
                    // Set the size of the form
                    dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
                    // create a new container for custom HTML
                    var formEl = document.createElement('div');
                    formEl.innerHTML = template_html_1.default;
                    form.el.prepend(formEl);
                    // iterate thru form and move form elements accordingly
                    _this.renderCustomForm();
                };
                return props;
            },
            onSetFooter: function (el) {
                gd_sprest_bs_1.Components.Button({
                    el: el,
                    type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                    text: "Delete",
                    title: "Delete",
                    className: "float-start",
                    onClick: function () {
                        // Delete the item
                        _this.delete(item, function () {
                            // Refresh the SA Overview datasource
                            ds_1.DataSource.refresh();
                        });
                    }
                });
            },
            onUpdate: function (item) {
                // Call the update event
                onUpdated();
            }
        });
    };
    // Displays the view form
    SelfAssessmentOverviewForms.view = function (item) {
        var _this = this;
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the form properties
        dattatable_1.ItemForm.UseModal = false;
        dattatable_1.ItemForm.ListName = strings_1.default.Lists.SelfAssessmentOverview;
        // Show the edit form
        dattatable_1.ItemForm.view({
            onSetHeader: function (el) {
                el.innerHTML = "View ".concat(item.Title, " - Self Assessment Overview");
            },
            itemId: item.Id,
            onShowForm: function (form) {
                // Set the form properties
                dattatable_1.ItemForm.AutoClose = false;
                dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
            },
            onCreateViewForm: function (props) {
                props.onFormRendered = function (form) {
                    // Set the size of the form
                    dattatable_1.ItemForm.setSize(gd_sprest_bs_1.Components.OffcanvasSize.Large3);
                    // create a new container for custom HTML
                    var formEl = document.createElement('div');
                    formEl.innerHTML = template_html_1.default;
                    form.el.prepend(formEl);
                    // iterate thru form and move form elements accordingly
                    _this.renderCustomForm();
                    // get assessement control and render as box
                    var assessmentCtrl = form.getControl("assessment");
                    _this.renderStatusBox(assessmentCtrl);
                };
                return props;
            },
            onSetFooter: function (el) {
                // Components.Button({
                //     el,
                //     type: Components.ButtonTypes.OutlineSuccess,
                //     text: "Edit",
                //     title: "Edit",
                //     className: "float-start",
                //     onClick: () => {
                //         // edite the item
                //         this.edit(item, () => { });
                //     }
                // });
                // render a button group
                gd_sprest_bs_1.Components.ButtonGroup({
                    el: el,
                    buttons: [
                        {
                            text: "Print",
                            title: "Click to print this form",
                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDark,
                            className: "float-start ms-1",
                            onClick: function () {
                                // print the form
                                //window.print();
                                _this.printForm(item.Title);
                            }
                        },
                        {
                            text: "Edit",
                            title: "Click to edit this record",
                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineSuccess,
                            className: "float-start ms-1",
                            onClick: function () {
                                // edit the item
                                _this.edit(item, function () { });
                            }
                        },
                    ]
                });
            },
        });
    };
    // Deletes the request
    SelfAssessmentOverviewForms.delete = function (item, onUpdated) {
        // Clear the canvas
        dattatable_1.CanvasForm.clear();
        // Set the header
        dattatable_1.CanvasForm.setHeader("Delete Overview");
        dattatable_1.CanvasForm.setType(gd_sprest_bs_1.Components.OffcanvasTypes.End);
        // Set the body
        dattatable_1.CanvasForm.setBody("Are you sure you want to delete this self assessment overview?<p></p>");
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.CanvasForm.BodyElement,
            content: "Click to delete the item.",
            btnProps: {
                text: "Delete",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                onClick: function () {
                    // Close the modal
                    dattatable_1.CanvasForm.hide();
                    // Delete the item
                    item.delete().execute(
                    // Success
                    function () {
                        // Call the update event
                        onUpdated();
                    }, 
                    // Error
                    function (err) {
                        // TODO
                        alert("There was an error deleting the item.\n\n" + err);
                        // Log
                        console.error("[" + strings_1.default.ProjectName + "] Unable to delete overview item " + item.Title, item);
                    });
                }
            }
        });
        // Show the modal
        dattatable_1.CanvasForm.show();
    };
    // build the custom form
    SelfAssessmentOverviewForms.renderCustomForm = function () {
        jQuery('.formfield').each(function () {
            var fieldname = jQuery(this).attr('data-fieldname');
            var el = jQuery(this);
            jQuery('label#' + fieldname + '_label').each(function () {
                // get entire row of column for cleanup 
                var parentEl = jQuery(this).parent().parent();
                // move control and label
                jQuery(this).parent().contents().appendTo(el);
                // hide original parent element
                parentEl.hide();
            });
        });
    };
    // render status box on display form
    SelfAssessmentOverviewForms.renderStatusBox = function (control) {
        var elem = document.createElement('div');
        elem.id = "assessmentBox";
        var val = control.getValue();
        elem.innerHTML = val;
        // Render the icon based on the value
        switch (val) {
            case "Green":
                elem.className = "bg-success text-white text-center";
                control.el.innerHTML = elem.outerHTML;
                break;
            case "Red":
                elem.className = "bg-danger text-white text-center";
                control.el.innerHTML = elem.outerHTML;
                break;
            case "Yellow":
                elem.className = "bg-warning text-dark text-center";
                control.el.innerHTML = elem.outerHTML;
                break;
        }
    };
    // print the self-assessment form in a friendly format
    SelfAssessmentOverviewForms.printForm = function (title) {
        var printStyle = "@media print {\n            .form-label{font-size:large;font-weight:500}\n            body{display:grid;grid-template-columns:1fr 1fr;font-size: small;font-family:'Segoe UI Web (West European)', Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, Helvetica Neue, sans-serif;}\n            #headerArea{grid-column:1/3;padding:15px 0;}\n            .col-6:not(.row){margin:2px;border:1px solid #bcbcbc;}\n            .col-6.row{grid-column:1/3;display:grid;grid-template-columns: 75px 250px 250px 250px;height: max-content;}\n            .cell-contents.formfield{padding:5px;}\n            .col-md-3.offset-md-1{float:right;}\n            .title-text{text-align:center;}\n            .text-white{color:#fff;}\n            .text-dark{color:#333;}\n            .text-center{text-align: center;}\n            .bg-danger{background-color:#dc3545;}\n            .bg-warning{background-color:#ffc107;}\n            .bg-success{background-color:#198754;}\n            .p-2{padding:.5rem;}\n            .m-2{margin:.5rem;}\n        }";
        // create the style element
        var elStyle = document.createElement("style");
        elStyle.innerHTML = printStyle;
        // open a new print window
        var printwin = window.open("");
        // generate the print dom
        printwin.document.title = "".concat(title, " -  Self Assessment Overview");
        printwin.document.head.append(elStyle);
        printwin.document.body.innerHTML = document.getElementById("form-container").innerHTML;
        // stop the 
        printwin.stop();
        //remove input boxes
        printwin.document.querySelectorAll('input').forEach(function (box) { box.remove(); });
        //replace "program name" with actual program name
        printwin.document.getElementById('Title_label').innerHTML = title;
        //setTimeout(function(){printwin.print();},1000);
        printwin.print();
        printwin.close();
    };
    return SelfAssessmentOverviewForms;
}());
exports.SelfAssessmentOverviewForms = SelfAssessmentOverviewForms;
