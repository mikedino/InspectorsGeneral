"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterChecklistApp = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var plus_1 = require("gd-sprest-bs/build/icons/svgs/plus");
var jQuery = require("jquery");
var moment = require("moment");
var copyProgram_1 = require("./copyProgram");
var ds_1 = require("../ds");
var export_1 = require("./export");
var form_1 = require("./form");
var sendChecklist_1 = require("./sendChecklist");
var CommandApp_1 = require("../CommandApp");
var strings_1 = require("../strings");
require("./styles.scss");
var security_1 = require("../security");
/**
 * Main Application
 */
var MasterChecklistApp = /** @class */ (function () {
    // Constructor
    function MasterChecklistApp(el) {
        this._currentFilter = null;
        this._dashboard = null;
        this._el = null;
        this._selectedProgram = null;
        // Save the reference to the element
        this._el = el;
        // Render the dashboard
        this.render();
    }
    // Selects a program
    MasterChecklistApp.prototype.selectProgram = function (program) {
        // Set the selected program
        this._selectedProgram = program;
        // Refresh the datatable
        this.render();
    };
    // Renders the dashboard
    MasterChecklistApp.prototype.render = function () {
        var _this = this;
        // Clear the element
        while (this._el.firstChild) {
            this._el.removeChild(this._el.firstChild);
        }
        // Parse the program items
        var programItems = ds_1.DataSource.Programs;
        for (var i = 0; i < programItems.length; i++) {
            // Set the click event
            programItems[i].onClick = function (item) {
                // Select the program
                _this.selectProgram(item);
            };
        }
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Loading Data");
        dattatable_1.LoadingDialog.setBody("Loading the data for the selected program");
        dattatable_1.LoadingDialog.show();
        // Load the checklist data for the selected program (if one is selected)
        var items = this._selectedProgram ? ds_1.DataSource.getItemsByProgram(this._selectedProgram.text) : [];
        // Hide the dialog
        dattatable_1.LoadingDialog.hide();
        //Get only active directories (commands)
        var activeDirectories = ds_1.DataSource.getActiveDirectories();
        // Create the dashboard
        this._dashboard = new dattatable_1.Dashboard({
            el: this._el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: strings_1.default.ProjectName + (this._selectedProgram ? " > " + this._selectedProgram.text : ""),
                // onRendering(props) {
                //     props.type = Components.NavbarTypes.Primary
                //     return props;
                // },
            },
            subNavigation: {
                items: [
                    {
                        className: "btn-outline-dark",
                        text: "Select a Program",
                        isButton: true,
                        items: programItems
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export Current",
                        isButton: true,
                        isDisabled: this._selectedProgram && items.length > 0 ? false : true,
                        onClick: function () {
                            // Export the data
                            export_1.Export.generateCSV(items);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export All",
                        isButton: true,
                        isDisabled: ds_1.DataSource.Items.length > 0 ? false : true,
                        onClick: function () {
                            // Export the data
                            export_1.Export.generateCSV(ds_1.DataSource.Items);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Copy",
                        isButton: true,
                        isDisabled: this._selectedProgram && items.length > 0 && security_1.Security.IsInspector ? false : true,
                        onClick: function () {
                            // Display the copy program modal
                            new copyProgram_1.CopyProgram({
                                programs: programItems,
                                sourceProgram: _this._selectedProgram,
                                onComplete: function () {
                                    // Refresh the dashboard
                                    _this.refresh();
                                }
                            });
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Send to E3 Command Inspections Checklist",
                        isButton: true,
                        isDisabled: activeDirectories.length > 0 && security_1.Security.IsAdmin ? false : true,
                        onClick: function () {
                            // Display the send to E3 command modal
                            new sendChecklist_1.SendChecklist({
                                onComplete: function () {
                                    // Refresh the dashboard
                                    _this.refresh();
                                }
                            });
                        }
                    }
                ],
                itemsEnd: [
                    {
                        className: "btn-outline-dark",
                        text: "Manage Commands",
                        isDisabled: security_1.Security.IsAdmin ? false : true,
                        isButton: true,
                        onClick: function () {
                            new CommandApp_1.CommandApp(_this._el);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "New",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: plus_1.plus,
                        isButton: true,
                        isDisabled: security_1.Security.IsInspector ? false : true,
                        onClick: function () {
                            // Show the item form
                            form_1.IGItemForm.create(_this._selectedProgram ? _this._selectedProgram.value : null, function () {
                                // Refresh the dashboard
                                _this.refresh();
                            });
                        }
                    }
                ]
            },
            filters: {
                items: [
                    {
                        header: "Filter by Status",
                        items: [
                            {
                                label: "Obsolete",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Not Obsolete",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: function (item) {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                _this._currentFilter = item == "Obsolete" ? "Yes" : "No";
                                // Apply the filter
                                _this._dashboard.filter(5, _this._currentFilter);
                            }
                            else {
                                // Set the filter
                                _this._currentFilter = "";
                                // Clear the filter
                                _this._dashboard.filter(5, "");
                            }
                        }
                    }
                ]
            },
            footer: {
                itemsEnd: [
                    {
                        text: "v" + strings_1.default.Version
                    }
                ]
            },
            table: {
                rows: items,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 50,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 6,
                            "orderable": false,
                            "searchable": false
                        }
                    ],
                    language: {
                        emptyTable: this._selectedProgram ? "No questions exist for this program." : "Please select a program."
                    },
                    createdRow: function (row, data, index) {
                        jQuery('td', row).addClass('align-middle');
                    },
                    drawCallback: function (settings) {
                        var api = new jQuery.fn.dataTable.Api(settings);
                        jQuery(api.context[0].nTable).removeClass('no-footer');
                        jQuery(api.context[0].nTable).addClass('tbl-footer');
                        jQuery(api.context[0].nTable).addClass('table-striped');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_info').addClass('text-center');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_length').addClass('pt-2');
                        jQuery(api.context[0].nTableWrapper).find('.dataTables_paginate').addClass('pt-03');
                    },
                    headerCallback: function (thead, data, start, end, display) {
                        jQuery('th', thead).addClass('align-middle');
                    },
                    // Order by the 1st column by default; ascending
                    order: [[0, "asc"]]
                },
                onRendered: function (el, dt) {
                    // See if a filter is set
                    if (_this._currentFilter) {
                        // Apply the filter
                        _this._dashboard.filter(5, _this._currentFilter);
                    }
                },
                columns: [
                    {
                        name: "questionNumber",
                        title: "No."
                    },
                    {
                        name: "question",
                        title: "Question"
                    },
                    {
                        name: "reference",
                        title: "Reference"
                    },
                    {
                        name: "referenceDate",
                        title: "Reference Date",
                        onRenderCell: function (el, column, item) {
                            // Format the date
                            el.innerHTML = item.referenceDate ? moment(item.referenceDate).format("MM/DD/yyyy") : "";
                        }
                    },
                    {
                        name: "referenceData",
                        title: "Reference Data"
                    },
                    {
                        name: "obsoleteQuestion",
                        title: "Obsolete?",
                        onRenderCell: function (el, column, item) {
                            // Format the date
                            el.innerHTML = item.obsoleteQuestion ? "Yes" : "No";
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "",
                        isHidden: true,
                        onRenderCell: function (el, column, item) {
                            // Render the edit/view buttons
                            gd_sprest_bs_1.Components.TooltipGroup({
                                el: el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Displays the edit form.",
                                        btnProps: {
                                            isDisabled: security_1.Security.IsInspector ? false : true,
                                            text: "Edit",
                                            className: "ms-1",
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                                            onClick: function () {
                                                // Edit the item
                                                form_1.IGItemForm.edit(item, function () {
                                                    // Refresh the dashboard
                                                    _this.refresh();
                                                });
                                            }
                                        }
                                    },
                                    {
                                        content: "Displays the delete form.",
                                        btnProps: {
                                            isDisabled: security_1.Security.IsInspector ? false : true,
                                            text: "Delete",
                                            className: "ms-1",
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                                            onClick: function () {
                                                // View the item
                                                form_1.IGItemForm.delete(item, function () {
                                                    // Refresh the dashboard
                                                    _this.refresh();
                                                });
                                            }
                                        }
                                    }
                                ]
                            });
                        }
                    }
                ]
            }
        });
    };
    // Refreshes the dashboard
    MasterChecklistApp.prototype.refresh = function () {
        var _this = this;
        // Refresh the data
        ds_1.DataSource.refresh().then(function () {
            // Refresh the dashboard
            _this._dashboard.refresh(_this._selectedProgram ? ds_1.DataSource.getItemsByProgram(_this._selectedProgram.text) : []);
        });
    };
    return MasterChecklistApp;
}());
exports.MasterChecklistApp = MasterChecklistApp;
