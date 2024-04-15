import { Types, Web } from "gd-sprest-bs";
import { DateTime } from "gd-sprest-bs/src/components/components";
import { parseTwoDigitYear } from "moment";
import Strings from "../strings";

// Item
export interface IInspectionSchedule extends Types.SP.ListItem { }

// get today for events filter
let today = new Date();

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
    private static _items: IInspectionSchedule[] = null;
    static get Items(): IInspectionSchedule[] { return this._items; }
    static load(): PromiseLike<IInspectionSchedule[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data
            Web().Lists(Strings.Lists.InspectionSchedule).Items().query({
                GetAllItems: true,
                OrderBy: ["EventDate"],
                Select: ["*"],
                Filter: "EndDate gt datetime'" + today.toISOString() + "'",
                Top: 5000
            }).execute(
                // Success
                items => {
                    // Set the items
                    this._items = items.results as any;

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