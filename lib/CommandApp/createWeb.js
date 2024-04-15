"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWeb = void 0;
var dattatable_1 = require("dattatable");
var gd_sprest_bs_1 = require("gd-sprest-bs");
var cfg_1 = require("./cfg");
var security_1 = require("../security");
var template_html_1 = require("./template.html");
/**
 * Create Web Dialog
 */
var CreateWeb = /** @class */ (function () {
    // Constructor
    function CreateWeb(props) {
        this._props = null;
        // Save the properties
        this._props = props;
        // Show the dialog
        this.show();
    }
    // Configure the homepage
    CreateWeb.prototype.configureHomepage = function (url) {
        // Show a loading dialog
        dattatable_1.LoadingDialog.setBody("Configuring the homepage...");
        // Delete the home page
        var deleteHomepage = function () {
            return new Promise(function (resolve) {
                // Get the default home page
                (0, gd_sprest_bs_1.Web)(url).getFileByUrl("sitepages/home.aspx").execute(
                // Success
                function (file) {
                    // Delete the file
                    file.delete().execute(resolve);
                }, 
                // Error
                function () {
                    // No need to do anything
                    resolve(null);
                });
            });
        };
        // Return a promise
        return new Promise(function (resolve, reject) {
            // Delete the home page
            deleteHomepage().then(function () {
                // Create the home page
                gd_sprest_bs_1.SitePages.createPage("home.aspx", "Home Page", gd_sprest_bs_1.SPTypes.ClientSidePageLayout.Home, url).then(function (homePage) {
                    homePage.item.update({
                        // Update the contents of the page
                        CanvasContent1: template_html_1.default
                    }).execute(function () {
                        //set comments to disabled
                        homePage.item.setCommentsDisabled(true).execute(function () {
                            // Publish the page                                
                            homePage.page.publish().execute(resolve, reject);
                        }, reject);
                    }, reject);
                }, reject);
            });
        });
    };
    // Configure the navigation
    CreateWeb.prototype.configureNav = function (url) {
        // set the icon and the quick launch to vertical
        var setWebProps = function () {
            return new Promise(function (resolve) {
                //get root site
                (0, gd_sprest_bs_1.Site)().RootWeb().execute(function (site) {
                    var icon = site.SiteLogoUrl;
                    // get web object
                    (0, gd_sprest_bs_1.Web)(url).execute(
                    //success
                    function (web) {
                        // set quick launch to horizontal, set icon to match parent site
                        // TODO: set access request email to IG Admins (RequestAccessEmail: Security.AdminGroup)
                        web.setUseAccessRequestDefaultAndUpdate;
                        web.update({ HorizontalQuickLaunch: true, SiteLogoUrl: icon, }).execute(resolve);
                    }, 
                    //error
                    function () {
                        resolve(null);
                    });
                }, 
                //error
                function () {
                    resolve(null);
                });
            });
        };
        //return a promise
        return new Promise(function (resolve, reject) {
            setWebProps().then(function () {
                //get the quick launch nav object
                (0, gd_sprest_bs_1.Web)(url).Navigation().QuickLaunch().execute(
                // Success
                function (ql) {
                    // Delete the file
                    gd_sprest_bs_1.Helper.Executor(ql.results, function (node) {
                        //delete each existing QL item
                        node.delete().execute(resolve, reject);
                    }).then(function () {
                        // add node for Command Inspections Home
                        ql.add({ 'Title': 'IG Home', 'Url': gd_sprest_bs_1.ContextInfo.webServerRelativeUrl }).execute(resolve, reject);
                    });
                }, 
                // Error
                function () {
                    // No need to do anything
                    reject;
                }), reject;
            });
        });
    };
    // Create the web
    CreateWeb.prototype.createWeb = function (props) {
        var _this = this;
        // Show a loading dialog
        dattatable_1.LoadingDialog.setHeader("Provisioning Web");
        dattatable_1.LoadingDialog.setBody("Creating the sub web...");
        dattatable_1.LoadingDialog.show();
        // Create the test site
        (0, gd_sprest_bs_1.Web)().WebInfos().add({
            Description: props.description,
            Title: props.name,
            Url: props.url,
            WebTemplate: gd_sprest_bs_1.SPTypes.WebTemplateType.Site
        }).execute(
        // Success
        function (web) {
            // Update the source item
            _this._props.sourceItem.update({
                url: {
                    __metadata: { type: "SP.FieldUrlValue" },
                    Description: web.Title,
                    Url: web.ServerRelativeUrl
                }
            }).execute(function () {
                // Update the loading dialog
                dattatable_1.LoadingDialog.setBody("Creating the lists...");
                // Create the list assets
                cfg_1.Configuration.setWebUrl(web.ServerRelativeUrl);
                cfg_1.Configuration.install().then(function () {
                    // Update the loading dialog
                    dattatable_1.LoadingDialog.setBody("Configuring the security...");
                    // Configure the security
                    security_1.Security.configureWeb(web).then(function () {
                        // update the dialog
                        dattatable_1.LoadingDialog.setBody("Creating the home page...");
                        // Configure the home page
                        _this.configureHomepage(web.ServerRelativeUrl).then(function () {
                            // update the dialog
                            dattatable_1.LoadingDialog.setBody("Configurating the navigation...");
                            // Configure the navigation
                            _this.configureNav(web.ServerRelativeUrl).then(
                            // Home page create successfully
                            function () {
                                // Close the loading dialog
                                dattatable_1.LoadingDialog.hide();
                                dattatable_1.Modal.clear();
                                dattatable_1.Modal.setHeader("Success");
                                dattatable_1.Modal.setBody("Successfully created the ".concat(web.Title, " home page."));
                                dattatable_1.Modal.show();
                                // Call the complete event
                                _this._props.onComplete ? _this._props.onComplete() : null;
                            }, 
                            // Error creating the home page
                            function () {
                                // TODO -> What happens now?
                                // Close the loading dialog
                                dattatable_1.LoadingDialog.hide();
                                dattatable_1.Modal.clear();
                                dattatable_1.Modal.setHeader("Error");
                                dattatable_1.Modal.setBody("Encounterd an error while creating the ".concat(web.Title, " home page."));
                                dattatable_1.Modal.show();
                                // Call the complete event
                                _this._props.onComplete ? _this._props.onComplete() : null;
                            });
                        }, function (err) {
                            // Close the loading dialog
                            dattatable_1.LoadingDialog.hide();
                            // Error creating the site
                            dattatable_1.Modal.clear();
                            dattatable_1.Modal.setHeader("Error configuring the home page");
                            dattatable_1.Modal.setBody("There was an error configuring the site home page.");
                            dattatable_1.Modal.show();
                            // Console Log
                            console.error("Error configuring the home page", err);
                        });
                    }, function (err) {
                        // Close the loading dialog
                        dattatable_1.LoadingDialog.hide();
                        // Error creating the site
                        dattatable_1.Modal.clear();
                        dattatable_1.Modal.setHeader("Error configuring site security");
                        dattatable_1.Modal.setBody("There was an error configuring the site security/permissions.");
                        dattatable_1.Modal.show();
                        // Console Log
                        console.error("Error creating the site security", err);
                    });
                }, function (err) {
                    // Close the loading dialog
                    dattatable_1.LoadingDialog.hide();
                    // Error creating the site
                    dattatable_1.Modal.clear();
                    dattatable_1.Modal.setHeader("Error Creating Site Assets");
                    dattatable_1.Modal.setBody("There was an error creating the site assets.");
                    dattatable_1.Modal.show();
                    // Console Log
                    console.error("Error creating the site assets", err);
                });
            }, function (err) {
                // Close the loading dialog
                dattatable_1.LoadingDialog.hide();
                // Error creating the site
                dattatable_1.Modal.clear();
                dattatable_1.Modal.setHeader("Error Creating Site Lists");
                dattatable_1.Modal.setBody("There was an error creating the site lists.");
                dattatable_1.Modal.show();
                // Console Log
                console.error("Error creating the site lists", err);
            });
        }, 
        // Error
        function (resp) {
            // Close the loading dialog
            dattatable_1.LoadingDialog.hide();
            // Error creating the site
            dattatable_1.Modal.clear();
            dattatable_1.Modal.setHeader("Error Creating Site");
            dattatable_1.Modal.setBody("There was an error creating the site.");
            dattatable_1.Modal.show();
            // Console Log
            console.error("Error creating the site", resp);
        });
    };
    // Shows the dialog
    CreateWeb.prototype.show = function () {
        var _this = this;
        // Clear the modal
        dattatable_1.Modal.clear();
        // Set the header
        dattatable_1.Modal.setHeader("Create New Web");
        // Set the body
        var form = gd_sprest_bs_1.Components.Form({
            el: dattatable_1.Modal.BodyElement,
            controls: [
                {
                    name: "name",
                    label: "Name",
                    description: "The title of the web.",
                    type: gd_sprest_bs_1.Components.FormControlTypes.TextField,
                    required: true,
                    value: this._props.name
                },
                {
                    name: "url",
                    label: "Url",
                    description: "The url of the web (this cannot be changed)",
                    type: gd_sprest_bs_1.Components.FormControlTypes.Readonly,
                    value: this._props.url,
                },
                {
                    name: "description",
                    label: "Description",
                    type: gd_sprest_bs_1.Components.FormControlTypes.TextField,
                    value: this._props.description
                }
            ]
        });
        // Set the footer
        gd_sprest_bs_1.Components.Tooltip({
            el: dattatable_1.Modal.FooterElement,
            content: "Creates the web.",
            btnProps: {
                text: "Create",
                type: gd_sprest_bs_1.Components.ButtonTypes.OutlinePrimary,
                onClick: function () {
                    // Ensure the form is valid
                    if (form.isValid()) {
                        // Close the dialog
                        dattatable_1.Modal.hide();
                        // Create the web
                        _this.createWeb(form.getValues());
                    }
                }
            }
        });
        // Show the modal
        dattatable_1.Modal.show();
    };
    return CreateWeb;
}());
exports.CreateWeb = CreateWeb;
