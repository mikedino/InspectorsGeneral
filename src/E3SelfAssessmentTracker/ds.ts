import { Types, Web } from "gd-sprest-bs";
import Strings from "../strings";

// Item
export interface IDocuments extends Types.SP.FolderOData { 
    //Name?: string;
    //ItemCount: number;
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
    private static _folders: IDocuments[] = null;
    static get Folders(): IDocuments[] { return this._folders; }
    static load(): PromiseLike<IDocuments[]> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the data. Only get the folders.
            Web().Lists(Strings.Lists.Documents).RootFolder().Folders().query({
                GetAllItems: true,
                OrderBy: ["Name"],
                Select: ["Name", "ItemCount"],
                Top: 5000
            }).execute(
                // Success
                folders => {
                    // Set the folder items
                    /*for (let i = 0; i < folders.results.length; i++) {
                        this._folders.push({
                            Name: folders.results[i].Name,
                            ItemCount: folders.results[i].ItemCount
                        });             
                    }*/
                    this._folders = folders.results;

                    // Resolve the request
                    resolve(this._folders);
                },
                // Error
                () => { reject(); }
            );

        });
    }

    static getFolderByProgram(program: string): IDocuments {
        let progFolder: IDocuments = null;

        if (this.Folders) {
            // Parse the items
            for (let i = 0; i < this.Folders.length; i++) {
                let item = this.Folders[i];

                // See if the program matches
                if (item.Name && item.Name == program) {
                    // Add the item
                    progFolder = item;
                }
            }
        }

        // Return the items
        return progFolder;
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