import { Dashboard, LoadingDialog } from "dattatable";
import { Components } from "gd-sprest-bs";
import { plus } from "gd-sprest-bs/build/icons/svgs/plus";
import * as jQuery from "jquery";
import moment = require("moment");
import { CopyProgram } from "./copyProgram";
import { DataSource, IChecklistItem } from "../ds";
import { Export } from "./export";
import { IGItemForm } from "./form";
import { SendChecklist } from "./sendChecklist";
import { CommandApp } from "../CommandApp";
import Strings from "../strings";
import "./styles.scss";
import { Security } from "../security";

/**
 * Main Application
 */
export class MasterChecklistApp {
    private _currentFilter: string = null;
    private _dashboard: Dashboard = null;
    private _el: HTMLElement = null;
    private _selectedProgram: Components.IDropdownItem = null;

    // Constructor
    constructor(el: HTMLElement) {
        // Save the reference to the element
        this._el = el;

        // Render the dashboard
        this.render();
    }

    // Selects a program
    private selectProgram(program: Components.IDropdownItem) {
        // Set the selected program
        this._selectedProgram = program;

        // Refresh the datatable
        this.render();
    }

    // Renders the dashboard
    private render() {
        // Clear the element
        while (this._el.firstChild) { this._el.removeChild(this._el.firstChild); }

        // Parse the program items
        let programItems = DataSource.Programs;
        for (let i = 0; i < programItems.length; i++) {
            // Set the click event
            programItems[i].onClick = (item) => {
                // Select the program
                this.selectProgram(item);
            }
        }

        // Show a loading dialog
        LoadingDialog.setHeader("Loading Data");
        LoadingDialog.setBody("Loading the data for the selected program");
        LoadingDialog.show();

        // Load the checklist data for the selected program (if one is selected)
        let items = this._selectedProgram ? DataSource.getItemsByProgram(this._selectedProgram.text) : [];

        // Hide the dialog
        LoadingDialog.hide();

        //Get only active directories (commands)
        let activeDirectories = DataSource.getActiveDirectories();

        // Create the dashboard
        this._dashboard = new Dashboard({
            el: this._el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: Strings.ProjectName + (this._selectedProgram ? " > " + this._selectedProgram.text : ""),
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
                        onClick: () => {
                            // Export the data
                            Export.generateCSV(items);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Export All",
                        isButton: true,
                        isDisabled: DataSource.Items.length > 0 ? false : true,
                        onClick: () => {
                            // Export the data
                            Export.generateCSV(DataSource.Items);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Copy",
                        isButton: true,
                        isDisabled: this._selectedProgram && items.length > 0 && Security.IsInspector ? false : true,
                        onClick: () => {
                            // Display the copy program modal
                            new CopyProgram({
                                programs: programItems,
                                sourceProgram: this._selectedProgram,
                                onComplete: () => {
                                    // Refresh the dashboard
                                    this.refresh();
                                }
                            });
                        }
                    },
                    {
                        className: "ms-2 btn-outline-success",
                        text: "Send to E3 Command Inspections Checklist",
                        isButton: true,
                        isDisabled: activeDirectories.length > 0 && Security.IsAdmin ? false : true,
                        onClick: () => {
                            // Display the send to E3 command modal
                            new SendChecklist({
                                onComplete: () => {
                                    // Refresh the dashboard
                                    this.refresh();
                                }
                            });
                        }
                    }
                ],
                itemsEnd: [
                    {
                        className: "btn-outline-dark",
                        text: "Manage Commands",
                        isDisabled: Security.IsAdmin ? false : true,
                        isButton: true,
                        onClick: () => {
                            new CommandApp(this._el);
                        }
                    },
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "New",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: plus,
                        isButton: true,
                        isDisabled: Security.IsInspector ? false : true,
                        onClick: () => {
                            // Show the item form
                            IGItemForm.create(this._selectedProgram ? this._selectedProgram.value : null, () => {
                                // Refresh the dashboard
                                this.refresh();
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
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Not Obsolete",
                                type: Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: (item: string) => {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                this._currentFilter = item == "Obsolete" ? "Yes" : "No";

                                // Apply the filter
                                this._dashboard.filter(5, this._currentFilter);
                            } else {
                                // Set the filter
                                this._currentFilter = "";

                                // Clear the filter
                                this._dashboard.filter(5, "");
                            }
                        }
                    }
                ]
            },
            footer: {
                itemsEnd: [
                    {
                        text: "v" + Strings.Version
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
                        let api = new jQuery.fn.dataTable.Api(settings) as any;
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
                onRendered: (el, dt) => {
                    // See if a filter is set
                    if (this._currentFilter) {
                        // Apply the filter
                        this._dashboard.filter(5, this._currentFilter);
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
                        onRenderCell: (el, column, item: IChecklistItem) => {
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
                        onRenderCell: (el, column, item: IChecklistItem) => {
                            // Format the date
                            el.innerHTML = item.obsoleteQuestion ? "Yes" : "No";
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "",
                        isHidden: true,
                        onRenderCell: (el, column, item: IChecklistItem) => {
                            // Render the edit/view buttons
                            Components.TooltipGroup({
                                el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Displays the edit form.",
                                        btnProps: {
                                            isDisabled: Security.IsInspector ? false : true,
                                            text: "Edit",
                                            className: "ms-1",
                                            type: Components.ButtonTypes.OutlinePrimary,
                                            onClick: () => {
                                                // Edit the item
                                                IGItemForm.edit(item, () => {
                                                    // Refresh the dashboard
                                                    this.refresh();
                                                });
                                            }
                                        }
                                    },
                                    {
                                        content: "Displays the delete form.",
                                        btnProps: {
                                            isDisabled: Security.IsInspector ? false : true,
                                            text: "Delete",
                                            className: "ms-1",
                                            type: Components.ButtonTypes.OutlineDanger,
                                            onClick: () => {
                                                // View the item
                                                IGItemForm.delete(item, () => {
                                                    // Refresh the dashboard
                                                    this.refresh();
                                                });
                                            }
                                        }
                                    }
                                ]
                            })
                        }
                    }
                ]
            }
        });
    }

    // Refreshes the dashboard
    private refresh() {
        // Refresh the data
        DataSource.refresh().then(() => {
            // Refresh the dashboard
            this._dashboard.refresh(this._selectedProgram ? DataSource.getItemsByProgram(this._selectedProgram.text) : []);
        });
    }
}