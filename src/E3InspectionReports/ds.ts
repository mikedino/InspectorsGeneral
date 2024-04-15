import { Types, Web } from "gd-sprest-bs";
import Strings from "../strings";


// Item
export interface IInspectionWorksheet extends Types.SP.ListItem {
    approval: string;
    bestPractices: string;
    challenges: string;
    compliance: string;
    complianceJustification: string;
    deficiences: string;
    effectiveness: string;
    effectivenessJustification: string;
    selfAssessment: string;
    //endOfDay: string;
    inpsectorName: {
        EMail: string;
        Id: number;
        Title: string;
    },
    inpsectorNameId: number;
    inspectionDate: string;
    inspectorStatus: string;
    narrative: string;
    processOwner: {
        results: {
            EMail: string;
            Id: number;
            Title: string;
        }
    };
    processOwnerId: { results: number[] };
    programLU: {
        Id: number;
        Title: string;
    }
    programLUId: number;
    //recordsReviewed: string;
    risk: string;
    riskJustification: string;
    recommendations: string;
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
    private static _items: IInspectionWorksheet[] = null;
    static get Items(): IInspectionWorksheet[] { return this._items; }
    private static _approvedItems: IInspectionWorksheet[] = [];
    static get ApprovedItems(): IInspectionWorksheet[] { return this._approvedItems; }
    static load(): PromiseLike<IInspectionWorksheet[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web().Lists(Strings.Lists.IndividualProgramInspectionReports).Items().query({
                GetAllItems: true,
                Expand: ["inpsectorName", "processOwner", "programLU"],
                OrderBy: ["Title"],
                Select: [
                    "*", "inpsectorName/EMail", "inpsectorName/Id", "inpsectorName/Title",
                    "processOwner/EMail", "processOwner/Id", "processOwner/Title",
                    "programLU/Id", "programLU/Title"
                ],
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._items = items.results as any;

                    // create array of only Approved items for command inspectors to view
                    for(let i = 0; i<items.results.length; i++){
                        let item: IInspectionWorksheet = items.results[i] as any;
                        if(item.approval == "Approved"){
                            this._approvedItems.push(item);
                        }
                    }

                    // Resolve the request
                    resolve(this._items);
                },
                // Error
                () => { reject(); }
            );

        });
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
}