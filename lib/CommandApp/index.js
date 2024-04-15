"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandApp = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var plus_1 = require("gd-sprest-bs/build/icons/svgs/plus");
var check_1 = require("gd-sprest-bs/build/icons/svgs/check");
var jQuery = require("jquery");
var ds_1 = require("../ds");
var strings_1 = require("../strings");
var form_1 = require("./form");
var MasterChecklistApp_1 = require("../MasterChecklistApp");
var createWeb_1 = require("./createWeb");
var deleteWeb_1 = require("./deleteWeb");
/**
 * Manage Commands Application
 */
var CommandApp = /** @class */ (function () {
    // Constructor
    function CommandApp(el) {
        this._currentFilter = null;
        this._el = null;
        this._dashboard = null;
        // Save the reference to the element
        this._el = el;
        // Render the dashboard
        this.render();
    }
    // Renders the dashboard
    CommandApp.prototype.render = function () {
        var _this = this;
        // Clear the element
        while (this._el.firstChild) {
            this._el.removeChild(this._el.firstChild);
        }
        // Create the dashboard
        this._dashboard = new dattatable_1.Dashboard({
            el: this._el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Manage ECHIII Commands"
            },
            subNavigation: {
                items: [
                    {
                        className: "btn-outline-dark",
                        text: "Master Checklist",
                        isButton: true,
                        onClick: function () {
                            new MasterChecklistApp_1.MasterChecklistApp(_this._el);
                        }
                    }
                ],
                itemsEnd: [
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "New",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: plus_1.plus,
                        isButton: true,
                        onClick: function () {
                            // Show the item form
                            form_1.CommandItemForm.create(function () {
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
                                label: "Active",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Not Active",
                                type: gd_sprest_bs_1.Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: function (item) {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                _this._currentFilter = item == "Active" ? "Yes" : "No";
                                // Apply the filter
                                _this._dashboard.filter(2, _this._currentFilter);
                            }
                            else {
                                // Set the filter
                                _this._currentFilter = "";
                                // Clear the filter
                                _this._dashboard.filter(2, "");
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
                rows: ds_1.DataSource.Directories,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 50,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 3,
                            "orderable": false,
                            "searchable": false
                        },
                        {
                            "targets": 4,
                            "orderable": false,
                            "searchable": false
                        }
                    ],
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
                    order: [[1, "asc"]]
                },
                onRendered: function (el, dt) {
                    // See if a filter is set
                    if (_this._currentFilter) {
                        // Apply the filter
                        _this._dashboard.filter(2, _this._currentFilter);
                    }
                },
                columns: [
                    {
                        name: "Title",
                        title: "Command",
                    },
                    {
                        name: "description",
                        title: "Description"
                    },
                    {
                        name: "",
                        title: "Active",
                        onRenderCell: function (el, column, item) {
                            // See if the item is active
                            if (item.active) {
                                // Render as a checkbox
                                el.appendChild((0, check_1.check)(24, 24));
                            }
                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.active ? "Yes" : "No");
                            el.setAttribute("data-sort", item.active ? "Yes" : "No");
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "Item Actions",
                        onRenderCell: function (el, column, item) {
                            // Render the edit/view buttons
                            gd_sprest_bs_1.Components.TooltipGroup({
                                el: el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Displays the edit form.",
                                        btnProps: {
                                            text: "Edit",
                                            className: "ms-1",
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                                            onClick: function () {
                                                // Edit the item
                                                form_1.CommandItemForm.edit(item, function () {
                                                    // Refresh the dashboard
                                                    _this.refresh();
                                                });
                                            }
                                        }
                                    },
                                    {
                                        content: "Displays the delete form.",
                                        btnProps: {
                                            text: "Delete",
                                            className: "ms-1",
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                                            onClick: function () {
                                                // View the item
                                                form_1.CommandItemForm.delete(item, function () {
                                                    // Refresh the dashboard
                                                    _this.refresh();
                                                });
                                            }
                                        }
                                    }
                                ]
                            });
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "Site Actions",
                        onRenderCell: function (el, column, item) {
                            // Render the edit/view buttons
                            gd_sprest_bs_1.Components.TooltipGroup({
                                el: el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Creates a site for this command",
                                        btnProps: {
                                            text: "Create Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? true : false,
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineSuccess,
                                            onClick: function () {
                                                //create the web
                                                new createWeb_1.CreateWeb({
                                                    description: "The inspection site for ".concat(item.Title),
                                                    name: item.Title,
                                                    url: item.Title.replace(/[^a-zA-Z0-9]/g, ''),
                                                    onComplete: function () {
                                                        //refresh the dashboard
                                                        _this.refresh();
                                                    },
                                                    sourceItem: item
                                                });
                                            }
                                        }
                                    },
                                    {
                                        content: "Opens the command site",
                                        btnProps: {
                                            text: "View Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? false : true,
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                                            onClick: function () {
                                                //create the web
                                                window.open(item.url.Url, "_blank");
                                            }
                                        }
                                    },
                                    {
                                        content: "Archives the command site by generating a csv file with all list data",
                                        btnProps: {
                                            text: "Archive Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? false : true,
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineInfo,
                                            onClick: function () {
                                                //TODO create export method for all lists
                                                window.open(item.url.Url, "_blank");
                                            }
                                        }
                                    },
                                    {
                                        content: "Delete's the command site",
                                        btnProps: {
                                            text: "Delete Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? false : true,
                                            type: gd_sprest_bs_1.Components.ButtonTypes.OutlineDanger,
                                            onClick: function () {
                                                //TODO create delete method
                                                new deleteWeb_1.DeleteWeb({
                                                    name: item.Title,
                                                    url: item.url.Url,
                                                    onComplete: function () {
                                                        //refresh the dashboard
                                                        _this.refresh();
                                                    },
                                                    sourceItem: item
                                                });
                                            }
                                        }
                                    }
                                ],
                            });
                        }
                    }
                ]
            }
        });
    };
    // Refreshes the dashboard
    CommandApp.prototype.refresh = function () {
        var _this = this;
        // Refresh the data
        ds_1.DataSource.loadDirectories().then(function () {
            // Refresh the dashboard
            _this._dashboard.refresh(ds_1.DataSource.Directories);
        });
    };
    return CommandApp;
}());
exports.CommandApp = CommandApp;
