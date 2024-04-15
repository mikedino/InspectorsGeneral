import { ContextInfo, Helper, SPTypes, Types, Utility, Web } from "gd-sprest-bs";
import Strings from "./strings";

/**
 * Security
 * Code related to the security groups the user belongs to.
 */
export class Security {
    // Admin Security Group
    private static _adminGroup: Types.SP.Group = null;
    private static AdminGroupName = "N01IG Inspections Administrators";
    static get AdminGroup(): Types.SP.Group { return this._adminGroup; }
    private static loadAdminGroup(): PromiseLike<void> {
        // Return a Promise
        return new Promise((resolve, reject) => {
            // Get the owner's group
            Web(this.SubWebUrl).SiteGroups().getByName(this.AdminGroupName).execute(
                group => {
                    // Set the group
                    this._adminGroup = group;

                    // Resolve the request
                    resolve();
                },

                // Group doesn't exist
                () => {
                    // Reject the request
                    reject();
                }
            )
        });
    }

    // Get current user info and roles
    private static _currentUser: Types.SP.UserOData = null;
    static get CurrentUser(): Types.SP.UserOData { return this._currentUser; }
    private static _userRoleDisplay: string = null;
    static get UserRoleDisplay(): string { return this._userRoleDisplay; }
    private static _isAdmin: boolean = false;
    static get IsAdmin(): boolean { return this._isAdmin; }
    private static _isInspector: boolean = false;
    static get IsInspector(): boolean { return this._isInspector; }
    private static _isAssessor: boolean = false;
    static get IsAssessor(): boolean { return this._isAssessor; }
    private static _isVistor: boolean = false;
    static get IsVistor(): boolean { return this._isVistor; }
    private static loadUserPermissions(): Promise<void> {
        // return a promise
        return new Promise((resolve, reject) => {
            // get all user info
            Web().CurrentUser().query({
                Expand: ["Groups"]
            }).execute(user => {
                this._currentUser = user;

                // set admin flag to true for SCA's
                if (user.IsSiteAdmin) {
                    this._isAdmin = true;
                    this._isInspector = true;
                    this._isAssessor = true;
                    this._userRoleDisplay = this.AdminGroupName;
                }

                // parse groups
                for (let i = 0; i < user.Groups.results.length; i++) {
                    switch (user.Groups.results[i].Title) {
                        case this.AdminGroupName:
                            this._isAdmin = true;
                            this._isInspector = true;
                            this._isAssessor = true;
                            this._userRoleDisplay = this.AdminGroupName;
                            break;
                        case this.InspectorsGroupName:
                            this._isInspector = true;
                            this._userRoleDisplay = this._userRoleDisplay ? this._userRoleDisplay : this.InspectorsGroupName;
                            break;
                        case this.SubWebGroupName:
                            this._isAssessor = true;
                            this._userRoleDisplay = this._userRoleDisplay ? this._userRoleDisplay : this.SubWebGroupName;
                            break;
                        case this.MembersGroup.Title:
                            this._isVistor = true;
                            this._userRoleDisplay = this._userRoleDisplay ? this._userRoleDisplay : "Visitor";
                            break;
                    }
                }

                resolve();

            }, reject);

        })
    }

    // Inspectors Security Group
    private static _inspectorsGroup: Types.SP.Group = null;
    private static InspectorsGroupName = "N01IG Inspectors";
    static get InspectorsGroup(): Types.SP.Group { return this._inspectorsGroup; }
    private static loadInspectorsGroup(): PromiseLike<void> {
        // Return a Promise
        return new Promise((resolve, reject) => {
            // Get the owner's group
            Web(this.SubWebUrl).SiteGroups().getByName(this.InspectorsGroupName).execute(
                group => {
                    // Set the group
                    this._inspectorsGroup = group;

                    // Resolve the request
                    resolve();
                },

                // Group doesn't exist
                () => {
                    // Reject the request
                    reject();
                }
            )
        });
    }

    // Site Members Security Group
    private static _membersGroup: Types.SP.Group = null;
    static get MembersGroup(): Types.SP.Group { return this._membersGroup; }
    private static loadMembersGroup(): PromiseLike<void> {
        // Return a Promise
        return new Promise((resolve, reject) => {
            // Get the members group
            Web(this.SubWebUrl).AssociatedMemberGroup().execute(
                group => {
                    // Set the group
                    this._membersGroup = group;

                    // Resolve the request
                    resolve();
                },

                // Group doesn't exist
                () => {
                    // Reject the request
                    reject();
                }
            )
        });
    }

    // Sub-Web Security Group
    private static _subWebGroup: Types.SP.Group = null;
    private static SubWebGroupName: string = null;
    private static SubWebUrl: string = null;
    static get SubWebGroup(): Types.SP.Group { return this._subWebGroup; }
    private static loadSubWebGroup(): PromiseLike<void> {
        // Return a Promise
        return new Promise((resolve, reject) => {
            // ensure we're on the subweb
            if (this.SubWebGroupName) {
                // Get the owner's group
                Web(this.SubWebUrl).SiteGroups().getByName(this.SubWebGroupName).execute(
                    group => {
                        // Set the group
                        this._subWebGroup = group;

                        // Resolve the request
                        resolve();
                    },

                    // Group doesn't exist
                    () => {
                        // Reject the request
                        reject();
                    }
                )
            } else resolve();

        });
    }

    // Creates the custom permission level
    private static _customPermissionLevelName = "FFC Contributors";
    private static createPermissionLevel = (roles): PromiseLike<void> => {
        // Return a promise
        return new Promise(resolve => {
            // See if the roles contain the custom permission
            if (roles[this._customPermissionLevelName]) {
                // Resolve the request
                resolve();
            } else {
                // Create the custom permission
                Helper.copyPermissionLevel({
                    BasePermission: "Contribute",
                    Name: this._customPermissionLevelName,
                    Description: "Extends the contribute permission level and removes the ability to delete list items.",
                    RemovePermissions: [SPTypes.BasePermissionTypes.DeleteListItems],
                    WebUrl: this.SubWebUrl
                }).then(
                    role => {
                        // Update the mapper
                        roles[this._customPermissionLevelName] = role.Id;

                        // Resolve the request
                        resolve();
                    },
                    ex => {
                        // Log the error
                        console.error("Permission Level", "There was an error creating the custom permission level.", ex);
                    }
                );
            }
        });
    }

    // Configures the security groups
    private static configure(): PromiseLike<void> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Complete the async methods
            Promise.all([
                // Reset the list permissions
                this.resetListPermissions(),
                // Get the definitions
                this.getPermissionTypes()
            ]).then((requests) => {
                let permissions = requests[1];

                // Get the sub web object to update
                let subWeb = Web(this.SubWebUrl);
                // Get the list to update
                let inspectionReportsList = subWeb.Lists(Strings.Lists.IndividualProgramInspectionReports);
                let isrList = subWeb.Lists(Strings.Lists.ISR);
                let sitePages = subWeb.Lists(Strings.Lists.SitePages);
                // Get IG Home site to add new group
                let IGHome = Web();

                // Ensure the admin group exists
                if (this.AdminGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(this.AdminGroup.Id, permissions[SPTypes.RoleType.Administrator]).execute(() => {
                        // Log
                        console.log(`[${this.SubWebUrl}] The admin permission was added successfully.`);
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(this.AdminGroup.Id, permissions[SPTypes.RoleType.Administrator]).execute(() => {
                        // Log
                        console.log("[Individual Program Inspection Reports] The admin permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(this.AdminGroup.Id, permissions[SPTypes.RoleType.Administrator]).execute(() => {
                        // Log
                        console.log("[ISR] The admin permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(this.AdminGroup.Id, permissions[SPTypes.RoleType.Administrator]).execute(() => {
                        // Log
                        console.log("[Site Pages] The admin permission was added successfully.");
                    });
                }

                // Ensure the inspectors group exists
                if (this.InspectorsGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(this.InspectorsGroup.Id, permissions[SPTypes.RoleType.Contributor]).execute(() => {
                        // Log
                        console.log(`[${this.SubWebUrl}] The inspectors permission was added successfully.`);
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(this.InspectorsGroup.Id, permissions[SPTypes.RoleType.Contributor]).execute(() => {
                        // Log
                        console.log("[Individual Program Inspection Reports] The inspectors permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(this.InspectorsGroup.Id, permissions[SPTypes.RoleType.Contributor]).execute(() => {
                        // Log
                        console.log("[ISR] The inspectors permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(this.InspectorsGroup.Id, permissions[SPTypes.RoleType.Contributor]).execute(() => {
                        // Log
                        console.log("[Site Pages] The inspectors permission was added successfully.");
                    });
                }

                // Ensure the members group exists
                if (this.MembersGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(this.MembersGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log(`[${this.SubWebUrl}] The members permission was added successfully.`);
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(this.MembersGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log("[Individual Program Inspection Reports] The members permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(this.MembersGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log("[ISR] The members permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(this.MembersGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log("[Site Pages] The members permission was added successfully.");
                    });
                }

                // Ensure the sub web group exists
                if (this.SubWebGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(this.SubWebGroup.Id, permissions[SPTypes.RoleType.Contributor]).execute(() => {
                        // Log
                        console.log(`[${this.SubWebUrl}] The ${this.SubWebGroupName} permission was added successfully.`);
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(this.SubWebGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log(`[Individual Program Inspection Reports] The ${this.SubWebGroupName} permission was added successfully.`);
                    });
                    isrList.RoleAssignments().addRoleAssignment(this.SubWebGroup.Id, permissions[this._customPermissionLevelName]).execute(() => {
                        // Log
                        console.log(`[ISR] The ${this.SubWebGroupName} permission was added successfully.`);
                    });
                    sitePages.RoleAssignments().addRoleAssignment(this.SubWebGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log(`[Site Pages] The ${this.SubWebGroupName} permission was added successfully.`);
                    });
                    IGHome.RoleAssignments().addRoleAssignment(this.SubWebGroup.Id, permissions[SPTypes.RoleType.Reader]).execute(() => {
                        // Log
                        console.log(`[Command Inspections Home] The ${this.SubWebGroupName} permission was added successfully.`);
                    });
                }

                // Wait for the requests to complete
                inspectionReportsList.done(() => {
                    // Wait for the requests to complete
                    isrList.done(() => {
                        // Wait for the requests to complete
                        sitePages.done(() => {
                            //wait for IG home to update
                            IGHome.done(() => {
                                // Resolve the request
                                resolve();
                            });
                        });
                    });
                });
            }, reject);
        });
    }

    // Configures a web
    static configureWeb(webInfo: Types.SP.WebInformation): PromiseLike<void> {
        // Set the sub group name
        this.SubWebGroupName = webInfo.Title + " Command Inspections";
        this.SubWebUrl = webInfo.ServerRelativeUrl;

        // Return a promise
        return new Promise((resolve, reject) => {
            // Parse the groups to create
            Helper.Executor([this.AdminGroupName, this.InspectorsGroupName, this.SubWebGroupName], groupName => {
                // Return a promise
                return new Promise((resolve, reject) => {
                    // Get the group
                    Web(this.SubWebUrl).SiteGroups().getByName(groupName).execute(
                        // Exists
                        group => {
                            // Resolve the request
                            resolve(null);
                        },

                        // Doesn't exist
                        () => {
                            // Create the group
                            Web(this.SubWebUrl).SiteGroups().add({
                                Title: groupName,
                                Description: ""                                                           
                            }).execute(
                                // Successful
                                group => {

                                    // Update the group owner to the Admins
                                    Helper.setGroupOwner(group.Title, this.AdminGroupName, this.SubWebUrl)
                                        .then(() => {
                                            console.log(`[${group.Title}] The site group owner was successfully changed to ${this.AdminGroupName}.`);
                        
                                            // Resolve the request
                                            resolve(null);

                                        }).then(() => {
                                            // Resolve group add request
                                            resolve(group)
                                        });
                                    
                                },

                                // Error
                                () => {
                                    // The user is probably not an admin
                                    console.error("Error creating the security group.");

                                    // Reject the request
                                    reject();
                                }
                            );
                        }
                    );

                });
            }).then(() => {
                // Execute the requests
                Promise.all([
                    // Reset sub-web permissions
                    this.resetSubWebPermissions(),
                    // Re-initialize this class
                    this.loadGroups(),
                    // Configure the security groups
                    this.configure()
                ]).then(() => {
                    // Resolve the request
                    resolve();
                }, reject);
            });
        });
    }

    // Gets the role definitions for the permission types
    private static getPermissionTypes(): PromiseLike<{ [name: number]: number }> {
        // Return a promise
        return new Promise(resolve => {
            // Get the definitions
            Web(this.SubWebUrl).RoleDefinitions().execute(roleDefs => {
                let roles = {};

                // Parse the role definitions
                for (let i = 0; i < roleDefs.results.length; i++) {
                    let roleDef = roleDefs.results[i];

                    // Add the role by type
                    roles[roleDef.RoleTypeKind > 0 ? roleDef.RoleTypeKind : roleDef.Name] = roleDef.Id;
                }

                // Create the custom permission level
                this.createPermissionLevel(roles).then(() => {
                    // Resolve the request
                    resolve(roles);
                });
            });
        });
    }

    // Initializes the security
    static init(subwebName?: string): PromiseLike<void> {
        // Set the sub-web custom group name
        this.SubWebGroupName = subwebName ? subwebName + " Command Inspections" : null;

        // Return a promise
        return new Promise((resolve, reject) => {
            // Load the groups
            this.loadGroups().then(() => {
                // Load the current user's permissions
                this.loadUserPermissions().then(() => {
                    // Resolve the request
                    resolve();
                }, reject);
            }, reject);
        });
    }

    // Clears the security groups for the new sub web
    private static resetSubWebPermissions(): PromiseLike<any> {
        // Return a promise
        return new Promise(resolve => {
            // complete async methods
            Promise.all([
                // reset permissions
                Web(this.SubWebUrl).resetRoleInheritance().execute(),
                // clear permissions
                Web(this.SubWebUrl).breakRoleInheritance(false, true).execute()
            ]).then(resolve);
        });
    }

    // Load the security groups
    private static loadGroups(): PromiseLike<any> {
        // Return a promise
        return new Promise((resolve, reject) => {
            // Complete the async methods
            Promise.all([
                // Load the inspectors admin group
                this.loadAdminGroup(),
                // Load the inspectors group
                this.loadInspectorsGroup(),
                // Load the default site members group
                this.loadMembersGroup(),
                // Load the sub web command inspections group
                this.loadSubWebGroup()
            ]).then(resolve, reject);
        });
    }

    // Clears the security groups for a list
    private static resetListPermissions(): PromiseLike<void> {
        // Return a promise
        return new Promise(resolve => {
            Helper.Executor([
                Strings.Lists.IndividualProgramInspectionReports,
                Strings.Lists.ISR,
                Strings.Lists.SitePages
            ], listName => {
                // Return a promise
                return new Promise(resolve => {
                    // Get the list
                    let list = Web(this.SubWebUrl).Lists(listName);

                    // Reset the permissions
                    list.resetRoleInheritance().execute();

                    // Clear the permissions
                    list.breakRoleInheritance(false, true).execute(true);

                    // Wait for the requests to complete
                    list.done(resolve);
                });
            }).then(resolve);
        });
    }
}