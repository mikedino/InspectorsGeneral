import { ContextInfo } from 'gd-sprest-bs';
import * as jQuery from "jquery";
import HTML from './template.html';
import { DataSource, IContactItem, ICommandSiteItem, IHomePageLinksItem } from './ds';
import './styles.scss';

/**
 * Command Inspections Home Page
 */
export class InspectionHomePage {
    private _el: HTMLElement = null;

    // constructor
    constructor(el: HTMLElement) {
        this._el = el;

        // Render the dashboard
        this.render();

    }

    private render() {

        // render html template
        this._el.innerHTML = HTML;

        // render header
        this.renderHeader();

        // render icon links
        this.renderIconLinks();

        // render contacts
        this.renderContacts();

        // render command sites
        this.renderE3Sites();

    }

    // render the header portion
    private renderHeader() {
        let elArr = document.querySelectorAll(".siteTitle");
        elArr.forEach(element => {
            element.innerHTML = ContextInfo.webTitle
        });
    }

    // render the links for each icon
    private renderIconLinks() {

        let links = DataSource.Links;

        if (links.length > 0) {
            // if there is a link, loop thru and format
            jQuery.each(links, function (i, item: IHomePageLinksItem) {
                // remove spaces from title in order to get the element ID
                let title = item.Title.split(" ").join("");
                // find element and set onclick for items with a url defined
                if (item.url) {
                    jQuery(`#${title} .icon`).attr("onclick", `window.open('${item.url}');`);
                }
            });
        }

    }

    // render the contacts portion
    private renderContacts() {

        let el = this._el.querySelector("#USFFIGContactsContent");
        let items = DataSource.ContactItems;

        if (items.length > 0) {
            // if there is a contact, loop thru and format
            jQuery.each(items, function (i, item: IContactItem) {
                let elem: HTMLElement = document.createElement('p');
                elem.innerHTML = `<span class="contact-title">${item.Title}</span><br/><a href="mailto:${item.inspector.EMail}">${item.inspector.Title}</a>, ${item.inspector.WorkPhone ? item.inspector.WorkPhone : 'no phone'}`;
                el.appendChild(elem);
            });

        } else el.innerHTML = "No contacts exist.  Click the icon to create new contacts.";

    }

    // render the E3 Sites portion
    private renderE3Sites() {
        // Get the target element
        let el = this._el.querySelector("#CommandSitesContent");
        let items = DataSource.Commands;
        if (items.length > 0) {
            // if there is a command, loop thru and format
            jQuery.each(items, function (i, item: ICommandSiteItem) {
                let elem: HTMLElement = document.createElement('div');

                // if command is active and has a link
                if (item.active && item.url.Url) {
                    let link = document.createElement("a");
                    link.innerHTML = item.Title;
                    link.href = "#";
                    link.addEventListener("click", () => {
                        // Open in a new tab
                        window.open(item.url.Url, "_blank");
                    });
                    elem.appendChild(link);
                    //elem.innerHTML = `<a href="${item.url.Url}" target="_blank">${item.Title}</a>`;
                } else elem.innerHTML = item.Title;
                el.appendChild(elem);
            });

        } else el.innerHTML = "No commands exist. Open the Master Checklist to mannage commands.";

    }

}