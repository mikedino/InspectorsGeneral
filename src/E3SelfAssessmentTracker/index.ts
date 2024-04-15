import { Dashboard, LoadingDialog, Modal } from "dattatable";
import { Components } from "gd-sprest-bs";
import * as jQuery from "jquery";
import { DataSource as Checklist } from "../E3SelfAssessment/ds";
import { DataSource as Overview } from "../E3SelfAssessmentOverview/ds";
import { DataSource as Documents } from "./ds";
import { checkCircleFill } from "gd-sprest-bs/build/icons/svgs/checkCircleFill";
import { xCircleFill } from "gd-sprest-bs/build/icons/svgs/xCircleFill";
import { arrowClockwise } from "gd-sprest-bs/build/icons/svgs/arrowClockwise";
import Strings from "../strings";
import "./styles.scss";

// Item
export interface IE3SelfAssessmentTrackerItem {
    program: string;
    checklistPercent: number;
    overviewComplete: boolean;
    documentsComplete: boolean;
}

/**
 * Program Inspection Reports Application (Subweb)
 */
export class SelfAssessmentTracker {
    private _el: HTMLElement = null;
    private _data: IE3SelfAssessmentTrackerItem[] = [];
    private _dashboard: Dashboard = null;

    // Constructor
    constructor(el: HTMLElement) {
        // Save the reference to the element
        this._el = el;

        // Show the loading dialog
        LoadingDialog.setHeader("Generating the report");
        LoadingDialog.setBody("This will close after the data is loaded...");
        LoadingDialog.show();

        // Load the document library folders
        Documents.init().then(() => {
            // Load the checklist data
            Checklist.init().then(() => {
                // Load the self assessment overview data
                Overview.init().then(() => {
                    // generate the report
                    this.generateReport().then(() => {
                        // render the dashboard
                        this.render();
                        // Hide the dialog
                        LoadingDialog.hide();
                    });
                });
            });
        });
    }

    // build report object for dashboard population
    private generateReport(): PromiseLike<IE3SelfAssessmentTrackerItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {

            // Set the checklist unique programs as the primary objects
            let items = Checklist.Programs
            for (let i = 0; i < items.length; i++) {
                // for each program, calculate checklist %, doc complete and overview complete

                let programName = items[i].text;

                // check the documents datasource for a match and set documents complete variable
                let docsComplete: boolean = false;
                // for (let j = 0; j < Documents.length; j++) {
                //     if (Documents[i].Name == programName) {
                //         docsComplete = Documents[i].ItemCount > 0 ? true : false;
                //         break;
                //     }
                // }
                let docFolder = Documents.getFolderByProgram(programName);
                if (docFolder && docFolder.ItemCount > 0){
                    docsComplete = true;
                }

                // check the self assessment overview datasource for a match and set overview complete variable
                let overComplete: boolean = Overview.getItemByProgram(programName) ? true : false;

                // loop thru all checklist items for each program to see if they are complete and set percent accordingly
                let checklistItemsComplete: number = 0;
                let checklistItems = Checklist.getItemsByProgram(programName);
                for (let k = 0; k < checklistItems.length; k++) {
                    if (checklistItems[k].ResponseChoice) {
                        checklistItemsComplete++;
                    }
                }

                // push the object for this program
                this._data.push({
                    program: programName,
                    checklistPercent: Number((checklistItemsComplete / checklistItems.length).toFixed(2)),
                    documentsComplete: docsComplete,
                    overviewComplete: overComplete
                });

            }

            resolve(this._data);

            // Hide the dialog
            LoadingDialog.hide();

        });
 
    }

    // Renders the dashboard
    private render() {
        // Clear the element
        while (this._el.firstChild) { this._el.removeChild(this._el.firstChild); }

        // create yes/no icons for rendering
        let iconCheck = checkCircleFill(20) as HTMLElement;
        iconCheck.classList.add("text-success");
        let iconX = xCircleFill(20) as HTMLElement;
        iconX.classList.add("text-danger");

        // Create the dashboard
        this._dashboard = new Dashboard({
            el: this._el,
            hideHeader: true,
            useModal: true,
            navigation: {
                title: "Self-Assessment Tracker"
            },
            subNavigation: {
                itemsEnd: [
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
            footer: {
                itemsEnd: [
                    {
                        text: "v" + Strings.Version
                    }
                ]
            },
            table: {
                rows: this._data,
                dtProps: {
                    dom: 'rt<"row"<"col-sm-4"l><"col-sm-4"i><"col-sm-4"p>>',
                    pageLength: 100,
                    // Note - If you change the columns you will need to update this
                    columnDefs: [
                        {
                            "targets": 1,
                            "orderable": true,
                            "searchable": false
                        },
                        {
                            "targets": 2,
                            "orderable": true,
                            "searchable": false
                        },
                        {
                            "targets": 3,
                            "orderable": true,
                            "searchable": false
                        }
                    ],
                    language: {
                        emptyTable: this._data ? "No checklist questions exist for this command." : "Create a checklist"
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
                columns: [
                    {
                        name: "program",
                        title: "Program"
                    },
                    {
                        name: "checklistPercent",
                        title: "Checklist % complete",
                        className: "ps-3", //left padding
                        onRenderCell(el, column, item: IE3SelfAssessmentTrackerItem) {
                            //determine pill type
                            let type = null;
                            if(item.checklistPercent == 1){
                                type = Components.BadgeTypes.Success;
                            } else if (item.checklistPercent < .1){
                                type = Components.BadgeTypes.Danger;
                            } else type = Components.BadgeTypes.Warning;
                            //configure badge component
                            let badge = Components.Badge({
                                el: el,
                                isPill: true,
                                type: type,
                                content: Math.round(item.checklistPercent*100) + "%"
                            })
                            el.innerHTML = badge.el.outerHTML;
                        },
                    },
                    {
                        name: "overviewComplete",
                        title: "Overview Complete",
                        className: "ps-3", //left padding
                        onRenderCell(el, column, item: IE3SelfAssessmentTrackerItem) {
                            // Render the icon
                            if (item.overviewComplete) {
                                el.innerHTML = iconCheck.outerHTML;
                                el.setAttribute("data-sort", "1");
                            } else {
                                el.innerHTML = iconX.outerHTML;
                                el.setAttribute("data-sort", "0");
                            }
                        }
                    },
                    {
                        name: "documentsComplete",
                        title: "Documents Uploaded",
                        className: "ps-3", //left padding
                        onRenderCell(el, column, item: IE3SelfAssessmentTrackerItem) {
                            // Render the icon
                            if (item.documentsComplete) {
                                el.innerHTML = iconCheck.outerHTML;
                                el.setAttribute("data-sort", "1");
                            } else {
                                el.innerHTML = iconX.outerHTML;
                                el.setAttribute("data-sort", "0");
                            }
                        }
                    }
                ]
            }
        });

    }

    // Refreshes the dashboard
    private refresh() {

        // Show the loading dialog
        LoadingDialog.setHeader("Refreshing the report");
        LoadingDialog.setBody("This will close after the data is loaded...");
        LoadingDialog.show();

        //reset data set
        this._data = [];

        // Refresh the document library folders
        Documents.refresh().then(() => {
            // Refresh the checklist
            Checklist.refresh().then(() => {
                // Refresh the self assessment overview status
                Overview.refresh().then(() => {
                    // generate a new report
                    this.generateReport().then(() => {
                        // Refresh the dashboard
                        this._dashboard.refresh(this._data);

                        //close the dialog
                        LoadingDialog.hide();
                    });
                });
            });
        });
    }

}