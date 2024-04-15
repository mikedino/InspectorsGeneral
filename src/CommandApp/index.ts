import { Dashboard } from "dattatable";
import { Components } from "gd-sprest-bs";
import { plus } from "gd-sprest-bs/build/icons/svgs/plus";
import { check } from "gd-sprest-bs/build/icons/svgs/check";
import * as jQuery from "jquery";
import { DataSource, IDirectoryItem } from "../ds";
import Strings from "../strings";
import { CommandItemForm } from './form';
import { MasterChecklistApp } from '../MasterChecklistApp';
import { CreateWeb } from './createWeb';
import { DeleteWeb } from './deleteWeb';

/**
 * Manage Commands Application
 */
export class CommandApp {
    private _currentFilter: string = null;
    private _el: HTMLElement = null;
    private _dashboard: Dashboard = null;

    // Constructor
    constructor(el: HTMLElement) {
        // Save the reference to the element
        this._el = el;

        // Render the dashboard
        this.render();
    }

    // Renders the dashboard
    private render() {
        // Clear the element
        while (this._el.firstChild) { this._el.removeChild(this._el.firstChild); }

        // Create the dashboard
        this._dashboard = new Dashboard({
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
                        onClick: () => {
                            new MasterChecklistApp(this._el);
                        }
                    }
                ],
                itemsEnd: [
                    {
                        className: "ms-2 btn-outline-dark",
                        text: "New",
                        iconClassName: "me-1",
                        iconSize: 18,
                        iconType: plus,
                        isButton: true,
                        onClick: () => {
                            // Show the item form
                            CommandItemForm.create(() => {
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
                                label: "Active",
                                type: Components.CheckboxGroupTypes.Switch
                            },
                            {
                                label: "Not Active",
                                type: Components.CheckboxGroupTypes.Switch
                            }
                        ],
                        onFilter: (item: string) => {
                            // See if an item is selected
                            if (item) {
                                // Set the filter
                                this._currentFilter = item == "Active" ? "Yes" : "No";

                                // Apply the filter
                                this._dashboard.filter(2, this._currentFilter);
                            } else {
                                // Set the filter
                                this._currentFilter = "";

                                // Clear the filter
                                this._dashboard.filter(2, "");
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
                rows: DataSource.Directories,
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
                    order: [[1, "asc"]]
                },
                onRendered: (el, dt) => {
                    // See if a filter is set
                    if (this._currentFilter) {
                        // Apply the filter
                        this._dashboard.filter(2, this._currentFilter);
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
                        onRenderCell: (el, column, item: IDirectoryItem) => {
                            // See if the item is active
                            if (item.active) {
                                // Render as a checkbox
                                el.appendChild(check(24, 24));
                            }

                            // Set the filter/sort values
                            el.setAttribute("data-filter", item.active ? "Yes" : "No");
                            el.setAttribute("data-sort", item.active ? "Yes" : "No");
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "Item Actions",
                        onRenderCell: (el, column, item: IDirectoryItem) => {
                            // Render the edit/view buttons
                            Components.TooltipGroup({
                                el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Displays the edit form.",
                                        btnProps: {
                                            text: "Edit",
                                            className: "ms-1",
                                            type: Components.ButtonTypes.OutlinePrimary,
                                            onClick: () => {
                                                // Edit the item
                                                CommandItemForm.edit(item, () => {
                                                    // Refresh the dashboard
                                                    this.refresh();
                                                });
                                            }
                                        }
                                    },
                                    {
                                        content: "Displays the delete form.",
                                        btnProps: {
                                            text: "Delete",
                                            className: "ms-1",
                                            type: Components.ButtonTypes.OutlineDanger,
                                            onClick: () => {
                                                // View the item
                                                CommandItemForm.delete(item, () => {
                                                    // Refresh the dashboard
                                                    this.refresh();
                                                });
                                            }
                                        }
                                    }
                                ]
                            })
                        }
                    },
                    {
                        name: "ActionButtons",
                        title: "Site Actions",
                        onRenderCell: (el, column, item: IDirectoryItem) => {
                            // Render the edit/view buttons
                            Components.TooltipGroup({
                                el,
                                isSmall: true,
                                tooltips: [
                                    {
                                        content: "Creates a site for this command",
                                        btnProps: {
                                            text: "Create Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? true : false,
                                            type: Components.ButtonTypes.OutlineSuccess,
                                            onClick: () => {
                                                //create the web
                                                new CreateWeb({
                                                    description: `The inspection site for ${item.Title}`,
                                                    name: item.Title,
                                                    url: item.Title.replace(/[^a-zA-Z0-9]/g, ''),
                                                    onComplete: () => {
                                                        //refresh the dashboard
                                                        this.refresh();
                                                    },
                                                    sourceItem: item
                                                })
                                            }
                                        }
                                    },
                                    {
                                        content: "Opens the command site",
                                        btnProps: {
                                            text: "View Site",
                                            className: "ms-1",
                                            isDisabled: item.url ? false : true,
                                            type: Components.ButtonTypes.OutlinePrimary,
                                            onClick: () => {
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
                                            type: Components.ButtonTypes.OutlineInfo,
                                            onClick: () => {
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
                                            type: Components.ButtonTypes.OutlineDanger,
                                            onClick: () => {
                                                //TODO create delete method
                                                new DeleteWeb({
                                                    name: item.Title,
                                                    url: item.url.Url,
                                                    onComplete: () => {
                                                        //refresh the dashboard
                                                        this.refresh();
                                                    },
                                                    sourceItem: item
                                                })
                                            }
                                        }
                                    }
                                ],

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
        DataSource.loadDirectories().then(() => {
            // Refresh the dashboard
            this._dashboard.refresh(DataSource.Directories);
        });
    }
}