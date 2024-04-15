"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Security = void 0;
var gd_sprest_bs_1 = require("gd-sprest-bs");
var strings_1 = require("./strings");
/**
 * Security
 * Code related to the security groups the user belongs to.
 */
var Security = /** @class */ (function () {
    function Security() {
    }
    Object.defineProperty(Security, "AdminGroup", {
        get: function () { return this._adminGroup; },
        enumerable: false,
        configurable: true
    });
    Security.loadAdminGroup = function () {
        var _this = this;
        // Return a Promise
        return new Promise(function (resolve, reject) {
            // Get the owner's group
            (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).SiteGroups().getByName(_this.AdminGroupName).execute(function (group) {
                // Set the group
                _this._adminGroup = group;
                // Resolve the request
                resolve();
            }, 
            // Group doesn't exist
            function () {
                // Reject the request
                reject();
            });
        });
    };
    Object.defineProperty(Security, "CurrentUser", {
        get: function () { return this._currentUser; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Security, "UserRoleDisplay", {
        get: function () { return this._userRoleDisplay; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Security, "IsAdmin", {
        get: function () { return this._isAdmin; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Security, "IsInspector", {
        get: function () { return this._isInspector; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Security, "IsAssessor", {
        get: function () { return this._isAssessor; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Security, "IsVistor", {
        get: function () { return this._isVistor; },
        enumerable: false,
        configurable: true
    });
    Security.loadUserPermissions = function () {
        var _this = this;
        // return a promise
        return new Promise(function (resolve, reject) {
            // get all user info
            (0, gd_sprest_bs_1.Web)().CurrentUser().query({
                Expand: ["Groups"]
            }).execute(function (user) {
                _this._currentUser = user;
                // set admin flag to true for SCA's
                if (user.IsSiteAdmin) {
                    _this._isAdmin = true;
                    _this._isInspector = true;
                    _this._isAssessor = true;
                    _this._userRoleDisplay = _this.AdminGroupName;
                }
                // parse groups
                for (var i = 0; i < user.Groups.results.length; i++) {
                    switch (user.Groups.results[i].Title) {
                        case _this.AdminGroupName:
                            _this._isAdmin = true;
                            _this._isInspector = true;
                            _this._isAssessor = true;
                            _this._userRoleDisplay = _this.AdminGroupName;
                            break;
                        case _this.InspectorsGroupName:
                            _this._isInspector = true;
                            _this._userRoleDisplay = _this._userRoleDisplay ? _this._userRoleDisplay : _this.InspectorsGroupName;
                            break;
                        case _this.SubWebGroupName:
                            _this._isAssessor = true;
                            _this._userRoleDisplay = _this._userRoleDisplay ? _this._userRoleDisplay : _this.SubWebGroupName;
                            break;
                        case _this.MembersGroup.Title:
                            _this._isVistor = true;
                            _this._userRoleDisplay = _this._userRoleDisplay ? _this._userRoleDisplay : "Visitor";
                            break;
                    }
                }
                resolve();
            }, reject);
        });
    };
    Object.defineProperty(Security, "InspectorsGroup", {
        get: function () { return this._inspectorsGroup; },
        enumerable: false,
        configurable: true
    });
    Security.loadInspectorsGroup = function () {
        var _this = this;
        // Return a Promise
        return new Promise(function (resolve, reject) {
            // Get the owner's group
            (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).SiteGroups().getByName(_this.InspectorsGroupName).execute(function (group) {
                // Set the group
                _this._inspectorsGroup = group;
                // Resolve the request
                resolve();
            }, 
            // Group doesn't exist
            function () {
                // Reject the request
                reject();
            });
        });
    };
    Object.defineProperty(Security, "MembersGroup", {
        get: function () { return this._membersGroup; },
        enumerable: false,
        configurable: true
    });
    Security.loadMembersGroup = function () {
        var _this = this;
        // Return a Promise
        return new Promise(function (resolve, reject) {
            // Get the members group
            (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).AssociatedMemberGroup().execute(function (group) {
                // Set the group
                _this._membersGroup = group;
                // Resolve the request
                resolve();
            }, 
            // Group doesn't exist
            function () {
                // Reject the request
                reject();
            });
        });
    };
    Object.defineProperty(Security, "SubWebGroup", {
        get: function () { return this._subWebGroup; },
        enumerable: false,
        configurable: true
    });
    Security.loadSubWebGroup = function () {
        var _this = this;
        // Return a Promise
        return new Promise(function (resolve, reject) {
            // ensure we're on the subweb
            if (_this.SubWebGroupName) {
                // Get the owner's group
                (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).SiteGroups().getByName(_this.SubWebGroupName).execute(function (group) {
                    // Set the group
                    _this._subWebGroup = group;
                    // Resolve the request
                    resolve();
                }, 
                // Group doesn't exist
                function () {
                    // Reject the request
                    reject();
                });
            }
            else
                resolve();
        });
    };
    // Configures the security groups
    Security.configure = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Complete the async methods
            Promise.all([
                // Reset the list permissions
                _this.resetListPermissions(),
                // Get the definitions
                _this.getPermissionTypes()
            ]).then(function (requests) {
                var permissions = requests[1];
                // Get the sub web object to update
                var subWeb = (0, gd_sprest_bs_1.Web)(_this.SubWebUrl);
                // Get the list to update
                var inspectionReportsList = subWeb.Lists(strings_1.default.Lists.IndividualProgramInspectionReports);
                var isrList = subWeb.Lists(strings_1.default.Lists.ISR);
                var sitePages = subWeb.Lists(strings_1.default.Lists.SitePages);
                // Get IG Home site to add new group
                var IGHome = (0, gd_sprest_bs_1.Web)();
                // Ensure the admin group exists
                if (_this.AdminGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(_this.AdminGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Administrator]).execute(function () {
                        // Log
                        console.log("[".concat(_this.SubWebUrl, "] The admin permission was added successfully."));
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(_this.AdminGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Administrator]).execute(function () {
                        // Log
                        console.log("[Individual Program Inspection Reports] The admin permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(_this.AdminGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Administrator]).execute(function () {
                        // Log
                        console.log("[ISR] The admin permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(_this.AdminGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Administrator]).execute(function () {
                        // Log
                        console.log("[Site Pages] The admin permission was added successfully.");
                    });
                }
                // Ensure the inspectors group exists
                if (_this.InspectorsGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(_this.InspectorsGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Contributor]).execute(function () {
                        // Log
                        console.log("[".concat(_this.SubWebUrl, "] The inspectors permission was added successfully."));
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(_this.InspectorsGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Contributor]).execute(function () {
                        // Log
                        console.log("[Individual Program Inspection Reports] The inspectors permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(_this.InspectorsGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Contributor]).execute(function () {
                        // Log
                        console.log("[ISR] The inspectors permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(_this.InspectorsGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Contributor]).execute(function () {
                        // Log
                        console.log("[Site Pages] The inspectors permission was added successfully.");
                    });
                }
                // Ensure the members group exists
                if (_this.MembersGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(_this.MembersGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[".concat(_this.SubWebUrl, "] The members permission was added successfully."));
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(_this.MembersGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[Individual Program Inspection Reports] The members permission was added successfully.");
                    });
                    isrList.RoleAssignments().addRoleAssignment(_this.MembersGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[ISR] The members permission was added successfully.");
                    });
                    sitePages.RoleAssignments().addRoleAssignment(_this.MembersGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[Site Pages] The members permission was added successfully.");
                    });
                }
                // Ensure the sub web group exists
                if (_this.SubWebGroup) {
                    // Set the Site permissions
                    subWeb.RoleAssignments().addRoleAssignment(_this.SubWebGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Contributor]).execute(function () {
                        // Log
                        console.log("[".concat(_this.SubWebUrl, "] The ").concat(_this.SubWebGroupName, " permission was added successfully."));
                    });
                    // Set the list permissions
                    inspectionReportsList.RoleAssignments().addRoleAssignment(_this.SubWebGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[Individual Program Inspection Reports] The ".concat(_this.SubWebGroupName, " permission was added successfully."));
                    });
                    isrList.RoleAssignments().addRoleAssignment(_this.SubWebGroup.Id, permissions[_this._customPermissionLevelName]).execute(function () {
                        // Log
                        console.log("[ISR] The ".concat(_this.SubWebGroupName, " permission was added successfully."));
                    });
                    sitePages.RoleAssignments().addRoleAssignment(_this.SubWebGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[Site Pages] The ".concat(_this.SubWebGroupName, " permission was added successfully."));
                    });
                    IGHome.RoleAssignments().addRoleAssignment(_this.SubWebGroup.Id, permissions[gd_sprest_bs_1.SPTypes.RoleType.Reader]).execute(function () {
                        // Log
                        console.log("[Command Inspections Home] The ".concat(_this.SubWebGroupName, " permission was added successfully."));
                    });
                }
                // Wait for the requests to complete
                inspectionReportsList.done(function () {
                    // Wait for the requests to complete
                    isrList.done(function () {
                        // Wait for the requests to complete
                        sitePages.done(function () {
                            //wait for IG home to update
                            IGHome.done(function () {
                                // Resolve the request
                                resolve();
                            });
                        });
                    });
                });
            }, reject);
        });
    };
    // Configures a web
    Security.configureWeb = function (webInfo) {
        var _this = this;
        // Set the sub group name
        this.SubWebGroupName = webInfo.Title + " Command Inspections";
        this.SubWebUrl = webInfo.ServerRelativeUrl;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Parse the groups to create
            gd_sprest_bs_1.Helper.Executor([_this.AdminGroupName, _this.InspectorsGroupName, _this.SubWebGroupName], function (groupName) {
                // Return a promise
                return new Promise(function (resolve, reject) {
                    // Get the group
                    (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).SiteGroups().getByName(groupName).execute(
                    // Exists
                    function (group) {
                        // Resolve the request
                        resolve(null);
                    }, 
                    // Doesn't exist
                    function () {
                        // Create the group
                        (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).SiteGroups().add({
                            Title: groupName,
                            Description: ""
                        }).execute(
                        // Successful
                        function (group) {
                            // Update the group owner to the Admins
                            gd_sprest_bs_1.Helper.setGroupOwner(group.Title, _this.AdminGroupName, _this.SubWebUrl)
                                .then(function () {
                                console.log("[".concat(group.Title, "] The site group owner was successfully changed to ").concat(_this.AdminGroupName, "."));
                                // Resolve the request
                                resolve(null);
                            }).then(function () {
                                // Resolve group add request
                                resolve(group);
                            });
                        }, 
                        // Error
                        function () {
                            // The user is probably not an admin
                            console.error("Error creating the security group.");
                            // Reject the request
                            reject();
                        });
                    });
                });
            }).then(function () {
                // Execute the requests
                Promise.all([
                    // Reset sub-web permissions
                    _this.resetSubWebPermissions(),
                    // Re-initialize this class
                    _this.loadGroups(),
                    // Configure the security groups
                    _this.configure()
                ]).then(function () {
                    // Resolve the request
                    resolve();
                }, reject);
            });
        });
    };
    // Gets the role definitions for the permission types
    Security.getPermissionTypes = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve) {
            // Get the definitions
            (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).RoleDefinitions().execute(function (roleDefs) {
                var roles = {};
                // Parse the role definitions
                for (var i = 0; i < roleDefs.results.length; i++) {
                    var roleDef = roleDefs.results[i];
                    // Add the role by type
                    roles[roleDef.RoleTypeKind > 0 ? roleDef.RoleTypeKind : roleDef.Name] = roleDef.Id;
                }
                // Create the custom permission level
                _this.createPermissionLevel(roles).then(function () {
                    // Resolve the request
                    resolve(roles);
                });
            });
        });
    };
    // Initializes the security
    Security.init = function (subwebName) {
        var _this = this;
        // Set the sub-web custom group name
        this.SubWebGroupName = subwebName ? subwebName + " Command Inspections" : null;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Load the groups
            _this.loadGroups().then(function () {
                // Load the current user's permissions
                _this.loadUserPermissions().then(function () {
                    // Resolve the request
                    resolve();
                }, reject);
            }, reject);
        });
    };
    // Clears the security groups for the new sub web
    Security.resetSubWebPermissions = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve) {
            // complete async methods
            Promise.all([
                // reset permissions
                (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).resetRoleInheritance().execute(),
                // clear permissions
                (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).breakRoleInheritance(false, true).execute()
            ]).then(resolve);
        });
    };
    // Load the security groups
    Security.loadGroups = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Complete the async methods
            Promise.all([
                // Load the inspectors admin group
                _this.loadAdminGroup(),
                // Load the inspectors group
                _this.loadInspectorsGroup(),
                // Load the default site members group
                _this.loadMembersGroup(),
                // Load the sub web command inspections group
                _this.loadSubWebGroup()
            ]).then(resolve, reject);
        });
    };
    // Clears the security groups for a list
    Security.resetListPermissions = function () {
        var _this = this;
        // Return a promise
        return new Promise(function (resolve) {
            gd_sprest_bs_1.Helper.Executor([
                strings_1.default.Lists.IndividualProgramInspectionReports,
                strings_1.default.Lists.ISR,
                strings_1.default.Lists.SitePages
            ], function (listName) {
                // Return a promise
                return new Promise(function (resolve) {
                    // Get the list
                    var list = (0, gd_sprest_bs_1.Web)(_this.SubWebUrl).Lists(listName);
                    // Reset the permissions
                    list.resetRoleInheritance().execute();
                    // Clear the permissions
                    list.breakRoleInheritance(false, true).execute(true);
                    // Wait for the requests to complete
                    list.done(resolve);
                });
            }).then(resolve);
        });
    };
    var _a;
    _a = Security;
    // Admin Security Group
    Security._adminGroup = null;
    Security.AdminGroupName = "N01IG Inspections Administrators";
    // Get current user info and roles
    Security._currentUser = null;
    Security._userRoleDisplay = null;
    Security._isAdmin = false;
    Security._isInspector = false;
    Security._isAssessor = false;
    Security._isVistor = false;
    // Inspectors Security Group
    Security._inspectorsGroup = null;
    Security.InspectorsGroupName = "N01IG Inspectors";
    // Site Members Security Group
    Security._membersGroup = null;
    // Sub-Web Security Group
    Security._subWebGroup = null;
    Security.SubWebGroupName = null;
    Security.SubWebUrl = null;
    // Creates the custom permission level
    Security._customPermissionLevelName = "FFC Contributors";
    Security.createPermissionLevel = function (roles) {
        // Return a promise
        return new Promise(function (resolve) {
            // See if the roles contain the custom permission
            if (roles[_a._customPermissionLevelName]) {
                // Resolve the request
                resolve();
            }
            else {
                // Create the custom permission
                gd_sprest_bs_1.Helper.copyPermissionLevel({
                    BasePermission: "Contribute",
                    Name: _a._customPermissionLevelName,
                    Description: "Extends the contribute permission level and removes the ability to delete list items.",
                    RemovePermissions: [gd_sprest_bs_1.SPTypes.BasePermissionTypes.DeleteListItems],
                    WebUrl: _a.SubWebUrl
                }).then(function (role) {
                    // Update the mapper
                    roles[_a._customPermissionLevelName] = role.Id;
                    // Resolve the request
                    resolve();
                }, function (ex) {
                    // Log the error
                    console.error("Permission Level", "There was an error creating the custom permission level.", ex);
                });
            }
        });
    };
    return Security;
}());
exports.Security = Security;
