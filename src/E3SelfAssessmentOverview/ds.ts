import { Components, Types, Web } from "gd-sprest-bs";
import Strings from "../strings";


// Item
export interface ISelfAssessmentOverviewItem extends Types.SP.ListItem {
    assessment: string;
    policies: string;
    processes: string;
    successes: string;
    challenges: string;
    indicators: string;
    ofi: string;
}

/**
 * Data Source
 */
export class DataSource {

    // Initializes the application
    static init(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            Promise.all([
                // Load the data
                this.load()
            ]).then(resolve, reject);
        });
    }

    // Loads the list data
    private static _items: ISelfAssessmentOverviewItem[] = null;
    static get Items(): ISelfAssessmentOverviewItem[] { return this._items; }
    static load(): PromiseLike<ISelfAssessmentOverviewItem[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // clear the array
            this._items = [];

            // Load the data
            Web().Lists(Strings.Lists.SelfAssessmentOverview).Items().query({
                GetAllItems: true,
                OrderBy: ["Title"],
                Select: ["*"],
                Top: 5000
            }).execute(
                // Success
                items => {

                    // Set the items
                    this._items = items ? items.results as any : [];

                    // Resolve the request
                    resolve(this._items);

                },
                // Error
                () => { reject(); }
            );

        });
    }
    static getItemByProgram(program: string): ISelfAssessmentOverviewItem {
        let ovItem: ISelfAssessmentOverviewItem = null;

        if (this.Items) {
            // Parse the items
            for (let i = 0; i < this.Items.length; i++) {
                let item = this.Items[i];

                // See if the program matches
                if (item.Title && item.Title == program) {
                    // Add the item
                    ovItem = item;
                }
            }
        }

        // Return the items
        return ovItem;
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