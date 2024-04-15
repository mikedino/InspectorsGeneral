import { ContextInfo, Types, Web } from "gd-sprest-bs";
import { LoadingDialog, Modal } from "dattatable";

import Strings from "../strings";

// Item
export interface IStatusReportItem extends Types.SP.ListItem {
    number: number;
    rtype: string;
    observation: string;
    //status: string; (status is now part of SP.ListItem)
    reportedStatus: string;
    implementationStatus: string;
    ecd: Date;
    reportLU: {
        Id: number;
        Title: string;
    }
    reportLUId: number;
    Modified: Date;
    Attachments: boolean;
}

/**
 * Data Source
 */
export class DataSource {
    // Initializes the application
    static init(): PromiseLike<any> {
        //narrative Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load()
            ]).then(resolve, reject);
        });
    }

    // Loads the list data
    private static _statusReportItems: IStatusReportItem[] = null;
    static get StatusReportItems(): IStatusReportItem[] { return this._statusReportItems; }
    static load(): PromiseLike<IStatusReportItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web().Lists(Strings.Lists.ISR).Items().query({
                GetAllItems: true,
                Expand: ["reportLU", "Editor"],
                OrderBy: ["number"],
                Select: ["*","reportLU/Id", "reportLU/Title", "Editor/Title"],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._statusReportItems = items.results as any;

                    // Resolve the request
                    resolve(this._statusReportItems);
                },
                // Error
                () => { reject(); }
            );

        });
    }
    // get deficiencies for selected inspection report item
    static getRelatedISR(type: string, reportId: number): IStatusReportItem[] {
        let items: Array<IStatusReportItem> = [];

        // Parse the ISR's
        for (let i = 0; i < this.StatusReportItems.length; i++) {
            let item = this.StatusReportItems[i];

            // See if the program matches
            if (item.reportLUId && item.reportLUId == reportId && item.rtype == type) {
                // Add the item
                items.push(item);
            }
        }
        return items;
    }

    // Refreshes the application data
    static refresh(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load(),
            ]).then(resolve, reject);
        });
    }

    // Copies all of the observations to the parent ISR Rollup list
    static copyToRollup(): PromiseLike<void> {

        // Show a loading dialog
        LoadingDialog.setHeader("Getting ISR Data");
        LoadingDialog.setBody("Loading the latest ISR list data...");
        LoadingDialog.show();

        // Return a promise
        return new Promise((resolve, reject) => {

            // Load the latest data
            DataSource.load().then(() => {

                // Update the loading dialog
                LoadingDialog.setHeader("Sending Observations");
                LoadingDialog.setBody("This dialog will close after the observations are copied...");

                // Get the parent site
                let currentUrl = ContextInfo.webServerRelativeUrl;
                let parts = currentUrl.split('/');
                let parentUrl = parts.slice(0,-1).join('/');

                // Set the list to add the items to
                let list = Web(parentUrl).Lists(Strings.Lists.ISRRollup);

                // set items
                let items: IStatusReportItem[] = DataSource._statusReportItems;

                // Parse the items to copy
                for (let i = 0; i < items.length; i++) {
                    let item = items[i];

                    // Copy the item
                    list.Items().add({
                        "rtype": item.rtype,
                        "observation": item.observation,
                        "program": item.reportLU.Title,
                        "sourceModDate": item.Modified
                    }).execute(() => {
                        //success
                        //resolve the request
                        resolve();
                        //close the dialog
                        LoadingDialog.hide();
                        //display success
                        Modal.clear();
                        Modal.setHeader("Success!");
                        Modal.setBody("The observations were successfully copied to the rollup list.");
                    },
                        //error
                        err => {
                            //reject the request
                            reject();
                            //close the dialog
                            LoadingDialog.hide();
                            //display error
                            Modal.clear();
                            Modal.setHeader("Error sending observations");
                            Modal.setBody("<p>There was an error sending the checklist questions to the subweb</p><p>ERROR: " + err.response.toString() + "</p>");
                            console.log("[ERROR E3StatusReport > ds.ts] ", err);
                        }
                    );

                }


            });

        })
    }
   
}