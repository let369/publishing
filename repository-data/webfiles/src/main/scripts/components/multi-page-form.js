// MULTI-PAGE FORM

'use strict';

import Handlebars from '../vendor/hbs/handlebars';
import '../vendor/jquery.routes';
import '../vendor/polyfills';
import _ from '../vendor/lodash/dist/tinydash.es6';
import $ from 'jquery';

const MultiPageForm = function (settings) {
    this.settings = {};
    this.settings = $.extend(this.settings, settings);

    this.init = init;
    this.initRouting = initRouting;
    this.getCurrentStep = getCurrentStep;
    this.getStep = getStep;
    this.getRelativeStep = getRelativeStep;
    this.flattenedSections = flattenedSections;
    this.getPrevStep = getPrevStep;
    this.getNextStep = getNextStep;
    this.goToStart = goToStart;
    this.goToStep = goToStep;
    this.updateFormNav = updateFormNav;
    this.updatePageNav = updatePageNav;
    this.updatePageLabelWithCurrentStep = updatePageLabelWithCurrentStep;
    this.disableStep = disableStep;
    this.enableStep = enableStep;
    this.addStep = addStep;
    this.removeStep = removeStep;
    this.renameStep = renameStep;
    this.configureFieldMapping = configureFieldMapping;
    this.mapField = mapField;
    this.setupStepValidation = setupStepValidation;
    this.setupBackToSummary = setupBackToSummary;
    this.resetProgressToStep = resetProgressToStep;

    this.templates = {
        sectionNav:
        '{{#unless hideSectionNav}}' +
        '<div class="grid grid--full"><div class="grid__item  large--ten-twelfths">' +
        '<nav aria-label="sections in this form" class="section-nav">' +
            '{{#groups}}' +

                '{{#unless hideFromSectionNav}}' +
                        '{{#unless current}}' +
                            '<div class="section-nav__group  section-nav__link group" style="padding: 0;">' +
                                '<a class="ds_no-margin  ds_button  ds_button--small  ds_button--secondary  ds_button--has-icon  {{#if iconLeft}}ds_button--has-icon--left{{/if}}" href="#!/{{sections.[0].slug}}/{{sections.[0].pages.[0].slug}}/">' +
                                    '{{#if iconLeft}}' +
                                        '<svg class="ds_icon">' +
                                        '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/assets/images/icons/icons.stack.svg#chevron-left">' +
                                        '</use></svg>' +
                                    '{{/if}}' +
                                    '{{title}}' +
                                    '{{#unless iconLeft}}' +
                                        '<svg class="ds_icon">' +
                                        '<use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="/assets/images/icons/icons.stack.svg#chevron-right">' +
                                        '</use></svg>' +
                                    '{{/unless}}' +
                                '</a>' +
                            '</div>' +
                        '{{/unless}}' +
                        '{{#if current}}' +
                        '<div class="section-nav__group  group">' +
                            '<ol class="section-nav__list">' +
                                '{{#each sections}}' +
                                    '{{#unless hideFromSectionNav}}' +
                                    '<li class="section-nav__list-item  {{#if current}}section-nav__list-item--active{{/if}}">' +
                                        '{{#each pages}}{{#unless hidden}}' +
                                            '<a href="#!/{{../section}}/{{slug}}/" class="section-nav__item {{#if ../../current}}section-nav__item--current{{/if}}  js-validate-step">{{../../title}}</a>' +
                                        '{{/unless}}{{/each}}' +
                                    '</li>' +
                                    '{{/unless}}' +
                                '{{/each}}' +
                            '</ol>' +
                        '</div>' +
                        '{{/if}}' +
                '{{/unless}}' +
            '{{/groups}}' +
        '</nav>' +
        '</div></div>' +
        '{{/unless}}',
        subsectionNav:
            '{{#unless hideSubsectionNav}}' +
                '<nav role="navigation" aria-label="Subsections in this section" class="ds_side-navigation  ds_no-margin--top" data-module="ds-side-navigation">' +
                    '<input type="checkbox" class="fully-hidden  js-toggle-side-navigation" id="show-side-navigation" aria-controls="side-navigation-root">' +
                    '<label class="ds_side-navigation__expand  ds_link" for="show-side-navigation"><span class="visually-hidden">Show all</span> Pages in this section <span class="ds_side-navigation__expand-indicator"></span></label>' +

                    '<ul class="ds_side-navigation__list  ds_side-navigation__list--root" id="side-navigation-root">' +
                        '{{#pages}}' +
                        '{{#unless hidden}}' +
                            '<li class="ds_side-navigation__item {{#if disabled}}ds_side-navigation__item--disabled{{/if}}">' +
                                '{{#if disabled}}' +
                                    '<span class="ds_side-navigation__link {{#if current}}ds_current{{/if}}">' +
                                        '{{title}}' +
                                    '</span>' +
                                '{{else}}' +
                                    '{{#if current}}' +
                                    '<span class="ds_side-navigation__link  ds_current">{{title}}</span>' +
                                    '{{else}}' +
                                    '<a href="#!/{{section}}/{{slug}}/" class="ds_side-navigation__link  js-validate-step">' +
                                        '{{title}}' +
                                    '</a>' +
                                    '{{/if}}' +
                                '{{/if}}' +
                            '</li>' +
                        '{{/unless}}' +
                    '{{/pages}}' +
                    '</ul>' +
                '</nav>' +
            '{{/unless}}',

        pageNav: `<div class="button-group">
            {{#if prevStep}}
                <a title="{{prevStep.title}}" id="button-back" href="#!/{{prevStep.section}}/{{prevStep.slug}}/" class="ds_button  ds_button--cancel  ds_button--has-icon  ds_button--has-icon--left  js-validate-step">
                    <svg class="ds_icon" aria-hidden="true" role="img"><use xlink:href="/assets/images/icons/icons.stack.svg#chevron-left"></use></svg>
                    Back
                </a>
            {{/if}}

            {{#if nextStep}}
                <a title="{{nextStep.title}}" id="button-next" href="#!/{{nextStep.section}}/{{nextStep.slug}}/" class="ds_button  ds_button--has-icon  js-validate-step" {{#if startPage}}data-gtm="btn-start"{{/if}}>
                    {{#if startPage}}Start{{else}}Next{{/if}}

                    <svg class="ds_icon" aria-hidden="true" role="img"><use xlink:href="/assets/images/icons/icons.stack.svg#chevron-right"></use></svg>
                </a>
            {{/if}}
        </div>`
    };
};

function init() {
    Handlebars.registerHelper('ifCond', function(v1, v2, options) {
        if(v1 === v2) {
            return options.fn(this);
        }
        return options.inverse(this);
    });

    const form = this;

    form.initRouting();
    form.configureFieldMapping();
    form.setupStepValidation();
}

/**
 * Sets up routing using jQuery Routes
 * Executes the current route when called (i.e. on load)
 */
function initRouting() {
    const form = this;

    window.$.routes.addDataType('slug', { regexp: /[a-z0-9][a-z0-9\-]*[a-z0-9]/ });

    window.$.routes.add('!/{section:slug}/{page:slug}/{table:slug}/{tableindex}/{field:slug}/', 'cell', function () {
        const step = form.getStep('slug', this.page);
        if (step) {
            form.goToStep(step);

            // enable editing on the relevant row
            const table = $('#' + this.table);
            const row = table.find('tbody tr:nth-child(' + (parseInt(this.tableindex, 10) + 1) + ')');

            // switch the row to edit mode
            row.find('.js-edit-button').click();

            // if this matches on name, it's a radio
            const radio = row.find($('[name="' + this.field + '-' + this.tableindex + '"]:checked'));
            if (radio.length > 0) {
                radio.focus();
            } else {
                row.find(('[id="' + this.field + '-' + this.tableindex + '"]')).focus();
            }
        } else {
            window.$.routes.find('section').routeTo({
                section: this.section
            });
        }
    });

    window.$.routes.add('!/group/{group:slug}/', 'group', {}, function () {
        // find the first step in the group & route to it
        const groupSections = form.settings.formSections.filter(section => section.group.slug === this.group);
        let sectionPages, step;

        if (groupSections && groupSections.length) {sectionPages = groupSections[0].pages;}
        if (sectionPages && sectionPages.length) {step = sectionPages[0];}

        if (step) {
            // update URL and navigate
            window.history.replaceState({}, document.title, `#!/${step.section}/${step.slug}/`);
            form.goToStep(step);
        } else {
            form.goToStart();
        }
    });

    window.$.routes.add('!/{section:slug}/{page:slug}/{field:slug}/', 'field', {}, function () {
        const step = form.getStep('slug', this.page);
        if (step) {
            form.goToStep(step);

            // if this matches on name, it's a radio
            const radio = $('[name="' + this.field + '"]:checked');
            if (radio.length > 0) {
                radio.focus();
            } else {
                $('#' + this.field).focus();
            }
        } else {
            window.$.routes.find('section').routeTo({
                section: this.section
            });
        }
    });

    window.$.routes.add('!/{section:slug}/{page:slug}/', 'page', {}, function () {
        const step = form.getStep('slug', this.page);
        if (step) {
            form.goToStep(step);
        } else {
            window.$.routes.find('section').routeTo({
                section: this.section
            });
        }
    });

    window.$.routes.add('!/{section:slug}/', 'section', {}, function () {
        const step = form.getStep('slug', this.section);
        if (step) {
            form.goToStep(step);
        } else {
            form.goToStart();
        }
    });

    // and now go to the current route
    const route = window.$.routes.findRoute(window.location.hash.substr(1));

    if (route) {
        const params = route.extract(window.location.hash);
        window.$.routes.load(window.location.hash);
        // show section & page
        $('#' + params.section).removeClass('fully-hidden').attr('aria-hidden', false)
            .siblings('section').addClass('fully-hidden').attr('aria-hidden', true);
        $('#' + params.page).removeClass('fully-hidden').attr('aria-hidden', false)
            .siblings('section').addClass('fully-hidden').attr('aria-hidden', true);
    } else {
        form.goToStart();
    }
}

/**
 * Gets the current step
 * @return {object} currently-active step
 */
function getCurrentStep() {
    const currentStep = this.getStep('current', true);
    this.currentStep = currentStep;
    return currentStep;
}

/**
 * Gets a step from the form structure tree from a provided property and condition
 * @param {string} property - property to match
 * @param {string|bool|number} condition
 * @return {object} step
 */
function getStep (property, condition) {

    let step,
        // forEach has no native break, so let's hack something in
        pageFound = false;

    this.settings.formSections.forEach(function (section) {
        let value;

        const page = section.pages.find(page => page[property] === condition);
        if (page && !pageFound) {
            step = page;
            pageFound = true;
        }

        // if we haven't found a page that matches, try to match the section
        if (!pageFound) {
            value = _.get(section, property);

            if (value === condition && !pageFound) {
                const availablePages = section.pages.filter(page => !page.hidden && !page.disabled);
                step = availablePages[0];
                pageFound = true;
            }
        }
    });

    return step;
}

/**
 * Gets a step from the section tree
 * @param {number} offset - the amount to traverse through the form section tree
 * @return {object} step
 */
function getRelativeStep (offset) {
    const form = this;

    const flattenedSections = form.flattenedSections(true);

    const currentIndex = flattenedSections.findIndex(function (element) {
        return element.slug === form.getCurrentStep().slug;
    });

    const targetIndex = currentIndex + offset;
    //
    // // handle cases of requested index being out of bounds
    // if (targetIndex < 0) {
    //     targetIndex = 0;
    // } else if (targetIndex > flattenedSections.length - 1){
    //     targetIndex = flattenedSections.length - 1;
    // }

    return flattenedSections[targetIndex];
}

/**
 * @param {boolean} excludeDisabled
 * @return {array} all form sections as a flat array
 */
function flattenedSections (excludeDisabled) {
    const sections = this.settings.formSections;
    let section;
    let flattenedSections;
    let page;

    const filterfunction = function (page) {
        return page.disabled !== true;
    };

    if (excludeDisabled) {

        //filter to enabled sections/pages only
        const enabledSections = [];

        // filter out disabled sections
        for (let i = 0, il = sections.length; i < il; i++) {
            // remove group sections as this causes a cyclic data structure
            delete sections[i].group.sections;

            // make a copy of the section to filter disabled sections out of
            section = $.extend(true, {}, sections[i]);

            if (!section.disabled){
                enabledSections.push(section);
            }
        }

        // filter out disabled pages within a section
        for (let j = 0, jl = enabledSections.length; j < jl; j++) {
            section = enabledSections[j];

            section.pages = section.pages.filter(filterfunction);
        }

        // flatten the structure
        flattenedSections = [];

        for (let k = 0, kl = enabledSections.length; k < kl; k++) {
            section = enabledSections[k];

            for (let l = 0, ll = section.pages.length; l < ll; l++) {
                page = section.pages[l];

                page.section = section.slug;
                page.sectionTitle = section.title;
            }

            flattenedSections = flattenedSections.concat(section.pages);
        }

        return flattenedSections;
    } else {

        // flatten the structure
        flattenedSections = [];

        for (let m = 0, ml = sections.length; m < ml; m++) {
            section = sections[m];

            for (let n = 0, nl = section.pages.length; n < nl; n++) {
                page = section.pages[n];

                page.section = section.slug;
                page.sectionTitle = section.title;
            }

            flattenedSections = flattenedSections.concat(section.pages);
        }

        return flattenedSections;
    }
}

/**
 * @return {object} previous step
 */
function getPrevStep () {
    return this.getRelativeStep(-1);
}

/**
 * @return {object} next step
 */
function getNextStep () {
    return this.getRelativeStep(1);
}

function goToStart () {
    const flattenedSections = this.flattenedSections(false);

    this.goToStep(flattenedSections[0]);
}

/**
 * Navigates to a specified step, sets that step as current, and updates the view
 * @param {object} step - step to navigate to
 */
function goToStep (step) {
    const currentStep = this.getCurrentStep();

    if (currentStep) {
        delete currentStep.current;
    }

    let section = $(`section[data-step="${step.section}"]`);
    let subsection = $(`section[data-step="${step.slug}"]`);
    // show section
    section.removeClass('fully-hidden').attr('aria-hidden', false)
        .siblings('section').addClass('fully-hidden').attr('aria-hidden', true);

    // show subsection
    section.find('section:not(.document-section)').addClass('fully-hidden').attr('aria-hidden', true);
    subsection.removeClass('fully-hidden').attr('aria-hidden', false);

    for (let i = 0, il = this.settings.formSections.length; i < il; i++) {
        delete this.settings.formSections[i].current;

        for (let j = 0, jl = this.settings.formSections[i].pages.length; j < jl; j++) {
            if (this.settings.formSections[i].pages[j].slug === step.slug){
                this.settings.formSections[i].pages[j].current = true;
                this.settings.formSections[i].pages[j].visited = true;
            }
            if (this.settings.formSections[i].pages[j].current) {
                this.settings.formSections[i].current = true;
            }
        }
    }

    $(`section[data-step="${step.slug}"]`).focus();

    if ($('#section-progess-indicator').length > 0) {
        const formTopOffset = $('#section-progess-indicator').offset().top;

        if (window.pageYOffset > formTopOffset) {
            window.scrollTo(window.pageXOffset, formTopOffset);
        }
    }

    if (step.noFormBox) {
        $('.multi-page-form').removeClass('form-box');
    } else {
        $('.multi-page-form').addClass('form-box');
    }

    this.updateFormNav();
    this.updatePageLabelWithCurrentStep();

    if (step.triggerEvent) {
        if (this.settings.formEvents[step.triggerEvent]) {
            this.settings.formEvents[step.triggerEvent].apply();
        } else {
            console.log('Cannot find form event "' + step.triggerEvent + '"');
        }
    }
}

/**
 * Updates the navigation for the form
 * Updates the primary section nav
 * Updates the secondary (sub)section nav
 */
function updateFormNav (navs) {
    let navsToUpdate = {pageNav: true, sectionNav: true, subsectionNav: true};
    navsToUpdate = $.extend(navsToUpdate, navs);

    const flattenedSections = this.flattenedSections(false);

    const currentStep = this.getCurrentStep();

    if (!currentStep) {
        return;
    }

    if (navsToUpdate.sectionNav) {
        let sectionTemplate;

        if (this.settings.sectionTemplate) {
            sectionTemplate = this.settings.sectionTemplate;
        } else {
            sectionTemplate = Handlebars.compile(this.templates.sectionNav);
        }

        const groups = [];

        const findIndexFunction = function (element) {
            return element.slug === this.group.slug;
        };

        this.settings.formSections.forEach(function (formSection) {
            let groupIndex = groups.findIndex(findIndexFunction, formSection);

            if (formSection.group && groupIndex < 0) {
                delete formSection.group.current;
                groups.push(formSection.group);
                groupIndex = groups.length - 1;
                groups[groupIndex].sections = [];
            }

            for (let j = 0; j < formSection.pages.length; j++) {
                if (formSection.pages[j].visited === true){
                    formSection.visited = true;
                }
            }

            formSection.firstActivePage = formSection.pages.filter(page => !page.hidden).shift();
            groups[groupIndex].sections.push(formSection);

            if (formSection.current) {
                groups[groupIndex].current = true;
            }
        });

        const sectionHtml = sectionTemplate({
            groups: groups,
            hideSectionNav: currentStep.hideSectionNav
        });
        $('#section-progess-indicator').html(sectionHtml);
    }

    if (navsToUpdate.subsectionNav) {
        const subsectionPages = {
            pages: flattenedSections.filter(function (page) {
                return page.section === currentStep.section;
            }),
            sectionTitle: currentStep.sectionTitle,
            hideSubsectionNav: currentStep.hideSubsectionNav
        };

        let subsectionTemplate;

        if (this.settings.subsectionTemplate) {
            subsectionTemplate = this.settings.subsectionTemplate;
        } else {
            subsectionTemplate = Handlebars.compile(this.templates.subsectionNav);
        }

        const subsectionHtml = subsectionTemplate(subsectionPages);
        $('#subsection-progess-indicator').html(subsectionHtml);
    }

    if (navsToUpdate.pageNav) {
        this.updatePageNav();
    }
}

function updatePageNav () {
    let templateData = {};
    let pageNavTemplate;

    if (this.settings.pageNavFunction) {
        templateData = this.settings.pageNavFunction() || {};
    }

    templateData.currentStep = this.getCurrentStep();
    const prevStep = this.getPrevStep();
    const nextStep = this.getNextStep();

    if (nextStep) { templateData.nextStep = nextStep; }

    if (prevStep) { templateData.prevStep = prevStep; }

    if (this.settings.pageNavTemplate) {
        pageNavTemplate = this.settings.pageNavTemplate;
    } else {
        pageNavTemplate = Handlebars.compile(this.templates.pageNav);
    }
    const pageNavHtml = pageNavTemplate(templateData);

    $('#page-nav').html(pageNavHtml);
    $('#page-nav').trigger('change');
}

function updatePageLabelWithCurrentStep () {
    const form = this;

    const pageLabelElement = $('.form-step:not(.fully-hidden) > h2');

    const currentSection = this.settings.formSections.filter(function (section) {
        return section.slug === form.currentStep.section;
    })[0];

    const currentStepNumber = currentSection.pages.findIndex(function (page) {
        return page.slug === form.currentStep.slug;
    });

    const currentStep = currentStepNumber + 1;
    const totalSteps = currentSection.pages.length;

    if (totalSteps > 1) {
        pageLabelElement.attr('data-suffix', '(' + currentStep + ' of ' + totalSteps + ')');
    }
}

/**
 * Disables a step
 * @param {string} step to disable's slug
 */
function disableStep (slug) {
    const formSections = this.settings.formSections;

    for (let i = 0; i < formSections.length; i++) {
        const pages = formSections[i].pages;

        for (let j = 0; j < pages.length; j++) {
            if (pages[j].slug === slug) {
                pages[j].disabled = true;
            }
        }
    }
}

/**
 * Enables a step
 * @param {string} step to disable's slug
 */
function enableStep (slug) {
    const formSections = this.settings.formSections;

    for (let i = 0; i < formSections.length; i++) {
        const pages = formSections[i].pages;

        for (let j = 0; j < pages.length; j++) {
            if (pages[j].slug === slug) {
                pages[j].disabled = false;
            }
        }
    }
}

/**
 * Adds a step
 * @param {string} section - the section's slug
 * @param {object} step - object with keys 'slug' (string) and 'title' (string)
*/
function addStep (section, step) {

    for (let i = 0, il = this.settings.formSections.length; i < il; i++) {
        const formSection = this.settings.formSections[i];
        if (formSection.slug === section) {
            formSection.pages.push(step);

            formSection.pages.sort(formSectionPagesSortFunction);
        }
    }

    this.updateFormNav();
}

function formSectionPagesSortFunction (a, b) {
    const aWeight = a.weight || 0;
    const bWeight = b.weight || 0;

    return aWeight - bWeight;
}

/**
 * Removes a step
 * @param {string} slug - the step to be removed's slug
*/
function removeStep (slug) {
    const formSections = this.settings.formSections;

    for (let i = 0; i < formSections.length; i++) {
        const pages = formSections[i].pages;

        for (let j = 0; j < pages.length; j++) {
            if (pages[j].slug === slug) {
                pages.splice(j, 1);
            }
        }
    }

    this.updateFormNav();
}

function renameStep (slug, newName) {
    const formSections = this.settings.formSections;

    for (let i = 0; i < formSections.length; i++) {
        const pages = formSections[i].pages;

        for (let j = 0; j < pages.length; j++) {
            if (pages[j].slug === slug) {
                pages[j].title = newName;
            }
        }
    }

    this.updateFormNav({pageNav: false});
}

/*
    * Setup for data binding.
    */
function configureFieldMapping () {
    for (const key in this.settings.formMapping) {
        if (!this.settings.formMapping.hasOwnProperty(key)) { continue; }

        // populate initial values
        let value = _.get(this.settings.formObject, key) || '';
        let elements = [].slice.call(document.querySelectorAll(this.settings.formMapping[key]));

        if (elements.length > 1 && elements[0].type === 'radio') {
            // special case: radio buttons
            for (let i = 0, il = elements.length; i < il; i++) {
                if (elements[i].value === value) {
                    elements[i].checked = true;
                    break;
                }
            }
        } else if (elements.length > 1 && elements[0].type === 'checkbox') {
            // special case: checkbox group
        } else {
            if (elements.length) {
                elements[0].value = value;
                // trigger change to resize MTA textareas
                if (elements[0].type === 'textarea'){
                    $(elements[0]).trigger('change');
                }
            }
        }

        this.mapField(key, this.settings.formMapping[key]);
    }
}

/**
 * @param {string} dataPath - object path to the data property, e.g. `foo[2].bar.baz`
 * @param {string} selector - DOM selector for the field
 */
function mapField (dataPath, selector) {
    const that = this;
    const el = [].slice.call(document.querySelectorAll(selector));
    let value;
    let text;
    let fieldModifier;

    for (let i = 0, il = that.settings.modifiers.length; i < il; i++) {
        if (dataPath.match(that.settings.modifiers[0].pattern)) {
            fieldModifier = that.settings.modifiers[0].transformFunction;
            break;
        }
    }

    // special case: radio
    if (el.length > 1 && el[0].type === 'radio') {
        const changeFunction = function (event) {
            const checkedRadio = $('[name="' + event.target.name + '"]:checked');
            value = checkedRadio.val();

            text = document.querySelector('label[for="' + checkedRadio.attr('id') + '"]').innerText;

            if (fieldModifier) {
                value = fieldModifier(value);
            }

            _.set(that.settings.formObject, dataPath, value);
            _.set(that.settings.formObject, dataPath + '_text', text);

            const dependantElements = document.querySelectorAll('[data-mapped="' + dataPath + '"]');

            for (let j = 0, jl = dependantElements.length; j < jl; j++) {
                const element = dependantElements[j];

                element.innerText = text;
            }
        };

        for (let k = 0, kl = el.length; k < kl; k++) {
            const element = el[k];

            $(element).on('change', changeFunction);
        }
    // special case: checkbox group
    } else if (el.length > 1 && el[0].type === 'checkbox') {
        $(el).on('change', function () {
            let selectedItems = el.filter(el => el.checked);
            let itemsArray = [];
            for (let i = 0, il = selectedItems.length; i < il; i++) {
                let selectedItem = selectedItems[i];
                itemsArray.push({
                    id: selectedItem.value,
                    name: $('label[for="' + selectedItem.id + '"]').text()
                });
            }

            _.set(that.settings.formObject, dataPath, itemsArray);
        });
    // special case: checkbox
    } else if (el.length > 0 && el[0].type === 'checkbox') {

        $(el[0]).on('change', function () {
            value = el[0].checked;

            _.set(that.settings.formObject, dataPath, value);
        });

    } else {
        // bind DOM changes to the formObject's data
        if (el.length > 0) {
            $(el).on('change blur', function (event) {
                value = event.currentTarget.value;

                if (fieldModifier) {
                    value = fieldModifier(value);
                }

                _.set(that.settings.formObject, dataPath, value);

                // special case: SELECT
                if (el[0].nodeName === 'SELECT') {
                    text = el[0].options[el[0].selectedIndex].text;
                    _.set(that.settings.formObject, dataPath + '_text', text);
                }

                const dependantElements = document.querySelectorAll('[data-mapped="' + dataPath + '"]');
                for (let k = 0, kl = dependantElements.length; k < kl; k++) {
                    const element = dependantElements[k];

                    element.innerText = text;
                }
            });
        }
    }

    // for debugging purposes
    window.formObject = this.settings.formObject;
}

/**
 * Adds validation to page navigation buttons
 */
function setupStepValidation () {
    const form = this;
    if (typeof form.validateStep === 'function') {
        $('body').on('click', '.js-validate-step', function (event) {
            // clear all errors before checking for new/remaining ones
            $('.form-errors').html('');

            // only perform validation on nav if we are progressing forward in the form
            // todo: AND it's a form people can't skip forward in
            const flattenedSections = form.flattenedSections(true);
            const targetSlug = event.currentTarget.href.match(/([a-z0-9]+(?:-[a-z0-9]+)*)\/$/)[1];

            const currentIndex = flattenedSections.findIndex(function (element) {
                return element.slug === form.getCurrentStep().slug;
            });

            const targetIndex = flattenedSections.findIndex(function (element) {
                return element.slug === targetSlug;
            });

            const navigatingForward = targetIndex > currentIndex || targetIndex === -1;

            if (!navigatingForward) {
                $('.client-error').addClass('fully-hidden').attr('aria-hidden', 'true');
                return;
            }

            const stepIsValid = form.validateStep(form.getCurrentStep());

            if (!stepIsValid){
                // push information about the error to Google Analytics data layer
                const fieldIds = $('.ds_input--error').map(function(){ return this.id; }).get();
                const identifier = this.id || this.className;
                const details = {
                    'event': 'formNavigation',
                    'formId': form.settings.formId,
                    'state': 'inlineValidationError',
                    'fields': fieldIds,
                    'originatingElement': identifier
                };

                window.dataLayer = window.dataLayer || [];
                window.dataLayer.push(details);

                $('.client-error').removeClass('fully-hidden').attr('aria-hidden', 'false');
                $('.client-error h2').focus();
            } else {
                $('.client-error').addClass('fully-hidden').attr('aria-hidden', 'true');
            }
            return stepIsValid;
        });
    }
}

function setupBackToSummary() {
    const that = this;
    // additional page change event:
    // if the summary page has been visited AND we're on a page before the summary page, show the "back to summary" button
    $('#page-nav').on('change', function () {
        const summaryStep = that.getStep('slug', 'summary');
        const formSectionsFlattened = that.flattenedSections(true);

        const thisStepIndex = formSectionsFlattened.findIndex(function (element) {
            return element.slug === that.currentStep.slug;
        });
        const summaryStepIndex = formSectionsFlattened.findIndex(function (element) {
            return element.slug === summaryStep.slug;
        });

        const goToSummaryButton = $('#go-to-summary');

        if (summaryStep.visited && thisStepIndex < summaryStepIndex) {
            goToSummaryButton.removeClass('fully-hidden').attr('aria-hidden', false);
        } else {
            goToSummaryButton.addClass('fully-hidden').attr('aria-hidden', true);
        }
    });
}

function resetProgressToStep(stepSlug) {
    let step = this.getStep('slug', stepSlug);
    let formSections = this.settings.formSections;
    let targetSectionIndex = formSections.findIndex(section => section.slug === step.section);
    let targetPageIndex = formSections[targetSectionIndex].pages.findIndex(page => page.slug === stepSlug);

    formSections.forEach(function (section, sectionIndex) {
        if (sectionIndex >= targetSectionIndex) {
            section.visited = false;

            section.pages.forEach(function (page, pageIndex) {
                if (targetSectionIndex === sectionIndex) {
                    if (pageIndex > targetPageIndex) {
                        page.visited = false;
                    }
                } else {
                    page.visited = false;
                }
            });

        }
    });

    this.updateFormNav();
}

export default MultiPageForm;