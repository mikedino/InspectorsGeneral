import { Dashboard, LoadingDialog, Modal } from "dattatable";
import { Components, ContextInfo } from "gd-sprest-bs";
import { arrowClockwise } from "gd-sprest-bs/build/icons/svgs/arrowClockwise";
import { pencilSquare } from "gd-sprest-bs/build/icons/svgs/pencilSquare";
import * as jQuery from "jquery";
import moment = require("moment");
import { DataSource, IE3ChecklistItem } from "./ds";
import { DataSource as SAOverviewDatasource } from "../E3SelfAssessmentOverview/ds";
import { Export } from "./export";
import { E3SelfAssessmentForms } from "./form";
import { SelfAssessmentOverviewForms } from "../E3SelfAssessmentOverview/form";
import { Security } from "../security";
import Strings from "../strings";
import "./styles.scss";

/**
 * Self-Assessment Application (Subweb)
 */
export class SelfAssessmentApp {
    private _currentFilter: string = null;
    private _dashboard: Dashboard = null;
    private _selectedProgram: Components.IDropdownItem = null;
    private _overviewItem = null;

    // Constructor
    constructor() {
        // Show the loading dialog
        LoadingDialog.setHeader("Loading the Data");
        LoadingDialog.setBody("This will close after the data is loaded...");
        LoadingDialog.show();

        // Load the data
        DataSource.init().then(() => {
            // load the self assessment data
            SAOverviewDatasource.init().then(() => {

                // Hide the dialog
                LoadingDialog.hide();

                // Render the dashboard
                this.render();
            });
        });
    }

    // Selects a program
    private selectProgram(program: Components.IDropdownItem) {
        // Set the selected program
        this._selectedProgram = program;

        // Parse the related Self Assessemnt Overview items list and look for a match
        this._overviewItem = SAOverviewDatasource.getItemByProgram(program.text);

        // Refresh the datatable
        this.render();
    }

    // Renders the modal
    private render() {
        // Clear the modal
        Modal.clear();

        // Set the properties
        Modal.setType(Components.ModalTypes.Full);
        // TODO: Note - other FULL modal types not rendering correctly

        // Set the header
        Modal.setHeader(`${ContextInfo.webTitle} Self Assessment`);

        // Render the body
        this.renderDashboard(Modal.BodyElement);

        // Set the footer
        Components.TooltipGroup({
            el: Modal.FooterElement,
            tooltips: [
                {
                    content: "Closes the modal",
                    btnProps: {
                        text: "Close",
                        type: Components.ButtonTypes.OutlineDanger,
                        onClick: () => {
                            // Close the modal
                            Modal.hide();
                        }
                    }
                }
            ]
        });

        // Show the modal
        Modal.show();
    }

    // Renders the dashboard
    private renderDashboard(el: HTMLElement) {
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

        // Generate the columns
        let columns = this.generateColumns();

        // Hide the dialog
        LoadingDialog.hide();

        // Create the dashboard
        let btnOverview: Components.IButton = null;
        this._dashboard = new Dashboard({
            el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Self Assessment Checklist " + (this._selectedProgram ? " > " + this._selectedProgram.text : ""),
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
                        className: "btn-overview " + (this._overviewItem ? "ms-2 btn-outline-primary" : "ms-2 btn-primary"),
                        text: this._overviewItem ? "View Self Assessment Overview" : "Create Self Assessment Overview",
                        isButton: true,
                        isDisabled: this._selectedProgram ? false : true,
                        onClick: () => {
                            // open or create the self assessment overview form
                            if (this._overviewItem) {
                                SelfAssessmentOverviewForms.view(this._overviewItem)
                            } else {
                                SelfAssessmentOverviewForms.create(this._selectedProgram.text, () => {
                                    // Refresh the dashboard
                                    this.refresh();
                                });
                            }
                        }
                    }
                ],
                itemsEnd: [
                    {
                        text: "User Role: " + Security.UserRoleDisplay,
                        className: "btn text-dark",
                        isButton: false
                    },
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "Refresh",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: arrowClockwise,
                        isButton: true,
                        onClick: () => {
                            // Refresh the dashboard
                            this.refresh();
                        }
                    }
                ]
            },
            filters: {
                items: [
                    {
                        header: "Filter by Applicability",
                        items: [
                            {
                                label: "Not Applicable",
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Applicable",
                                type: Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: (item: string) => {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                this._currentFilter = item == "Not Applicable" ? "Yes" : "No";

                                // Apply the filter
                                this._dashboard.filter(7, this._currentFilter);
                            } else {
                                // Set the filter
                                this._currentFilter = "";

                                // Clear the filter
                                this._dashboard.filter(7, "");
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
                columns,
                rows: items,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 100,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 0,
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
                        this._dashboard.filter(7, this._currentFilter);
                    }
                }
            }
        });
    }

    // Generates the columns
    private generateColumns(): Components.ITableColumn[] {
        // Set the default columns
        let columns: Components.ITableColumn[] =
            [
                {
                    name: "ActionButtons",
                    title: "",
                    isHidden: true,
                    onRenderCell: (el, column, item: IE3ChecklistItem) => {
                        Components.ButtonGroup({
                            el,
                            isSmall: false,
                            buttons: [
                                {
                                    text: "",
                                    title: "Click to edit this record",
                                    iconSize: 20,
                                    iconType: pencilSquare,
                                    type: Components.ButtonTypes.Primary,
                                    onClick: () => {
                                        // Edit the item
                                        E3SelfAssessmentForms.edit(item, () => {
                                            // Refresh the dashboard
                                            this.refresh();
                                        });
                                    }
                                }
                            ]
                        });
                    }
                },
                {
                    name: "QuestionNumber",
                    title: "No."
                },
                {
                    name: "Question",
                    title: "Question"
                },
                {
                    name: "ResponseChoice",
                    title: "ResponseChoice"
                },
                {
                    name: "Response",
                    title: "Response Text"
                },
                {
                    name: "Reference",
                    title: "Reference"
                },
                {
                    name: "ReferenceDate",
                    title: "Reference Date",
                    onRenderCell: (el, column, item: IE3ChecklistItem) => {
                        // Format the date
                        el.innerHTML = item.ReferenceDate ? moment(item.ReferenceDate).format("MM/DD/yyyy") : "";
                    }
                },
                {
                    name: "ReferenceData",
                    title: "Reference Data"
                }
            ];

        // See if this is the inspector
        if (Security.IsInspector) {
            // Add the NA column
            columns.push({
                name: "",
                title: "N/A",
                onRenderCell: (el, column, item: IE3ChecklistItem) => {
                    // render as checkbox
                    Components.CheckboxGroup({
                        el,
                        items: [{
                            label: "",
                            isSelected: item.na,
                            onChange: (val) => {
                                item.update({
                                    na: val ? true : false
                                }).execute()
                            }
                        }]
                    })

                    // Set the filter/sort values
                    el.setAttribute("data-filter", item.na ? "Yes" : "No");
                    el.setAttribute("data-sort", item.na ? "Yes" : "No");
                }
            });

            // Add the Recommendation column
            columns.push({
                name: "",
                title: "Recommendation?",
                onRenderCell: (el, column, item: IE3ChecklistItem) => {
                    // render as checkbox
                    Components.CheckboxGroup({
                        el,
                        items: [{
                            label: "",
                            isSelected: item.IsRecommendation,
                            onChange: (val) => {
                                item.update({
                                    IsRecommendation: val ? true : false
                                }).execute()
                            }
                        }]
                    })
                }
            });

            // Add the Deficiency column
            columns.push({
                name: "",
                title: "Deficiency?",
                onRenderCell: (el, column, item: IE3ChecklistItem) => {
                    // render as checkbox
                    Components.CheckboxGroup({
                        el,
                        items: [{
                            label: "",
                            isSelected: item.IsDeficiency,
                            onChange: (val) => {
                                item.update({
                                    IsDeficiency: val ? true : false
                                }).execute()
                            }
                        }]
                    })
                }
            });

            // Add the inspector comments
            columns.push({
                name: "InspectorComments",
                title: "Inspector Comments"
            });

        }

        // Return the columns
        return columns;
    }

    // Refreshes the dashboard
    private refresh() {
        // Refresh the self assessment data
        DataSource.refresh().then(() => {
            // Then refresh the SA Overview data
            SAOverviewDatasource.refresh().then(() => {
                // Then parse the related Self Assessemnt Overview items list again and look for a match
                this._overviewItem = SAOverviewDatasource.getItemByProgram(this._selectedProgram.text);

                // Get the overview button and see if we need to update it
                let elButton = Modal.BodyElement.querySelector(".btn-overview");
                if (elButton && elButton.classList.contains("btn-primary")) {
                    // Set the text
                    elButton.innerHTML = "View Self Assessment Overview";

                    // Update the class
                    elButton.classList.remove("btn-primary");
                    elButton.classList.add("btn-outline-primary");
                }

                // Then finaly refresh the dashboard
                this._dashboard.refresh(this._selectedProgram ? DataSource.getItemsByProgram(this._selectedProgram.text) : []);
            });
        });
    }
}