// MODEL TENANCY FORM

/* global require grecaptcha expireRecaptcha */

'use strict';

const formObject = {'propertyType':null, 'propertyInRpz': false, 'buildingOther':null,'furnishingType':'','propertyAddress':{'addressLine1':null,'addressLine2':null,'addressLine3':null,'postcode':null},'hmoProperty':'','hmo24ContactNumber':null,'hmoRegistrationExpiryDate':null,'hmoRenewalApplicationSubmitted':false,'tenancyStartDate':null,'rentAmount':null,'rentPaymentFrequency':null,'rentPaymentScheduleObject':{},'rentPaymentSchedule': null,'rentPayableInAdvance':null,'rentPaymentMethod':null,'firstPaymentAmount':null,'firstPaymentDate':null,'firstPaymentPeriodEnd':null,'servicesIncludedInRent':[],includedAreasOrFacilities:[],sharedFacilities:[],excludedAreasFacilities:[],'communicationsAgreement':'','depositAmount':null,'tenancyDepositSchemeAdministrator':null,'services':null,'facilities':[],'landlords':{'landlord-1':{}},'lettingAgent':{'name':null,'address':{'addressLine1':null,'addressLine2':null,'addressLine3':null,'postcode':null},'telephone':null,'registrationNumber':null},'agent':{'name':null,'address':{'addressLine1':null,'addressLine2':null,'addressLine3':null,'postcode':null},'telephone':null},'factor':{'name':null,'address':{'addressLine1':null,'addressLine2':null,'addressLine3':null,'postcode':null},'telephone':null,'registrationNumber':null},'tenants':{'tenant-1':{}},'optionalTerms':{'contentsAndConditions':null,'localAuthorityTaxesAndCharges':null,'utilities':null,'commonParts':null,'alterations':null,'privateGarden':null,'roof':null,'binsAndRecycling':null,'storage':null,'dangerousSubstances':null,'pets':null,'smoking':null,'liquidPetroleumGas':null},'additionalTerms':{'additional-term-1':{}}};

import $ from 'jquery';
import feedback from '../../components/feedback';
import EditableTable from '../../components/editable-table';
import MultiPageForm from '../../components/multi-page-form';
import PostcodeLookup from '../../components/postcode-lookup';
import formSections from '../../components/mygov/housing-forms/model-tenancy-sections';
import HousingTemplates from '../../components/mygov/housing-forms/housing-templates';
import formMapping from '../../components/mygov/housing-forms/model-tenancy-mapping';
import commonForms from '../../tools/forms';
import commonHousing from '../../tools/housing';
import moment from '../../vendor/moment';
import DSDatePicker from '../../../../../node_modules/@scottish-government/pattern-library/src/components/date-picker/date-picker';

const modelTenancySummaryOneTemplate = require('../../templates/model-tenancy-summary-1.hbs');
const modelTenancySummaryTwoTemplate = require('../../templates/model-tenancy-summary-2.hbs');
const modelTenancySummaryTwoExcludedTemplate = require('../../templates/model-tenancy-summary-2-excluded.hbs');
const modelTenancyMandatoryTemplate = require('../../templates/model-tenancy-mandatory-1.hbs');
const modelTenancyMandatoryTwoTemplate = require('../../templates/model-tenancy-mandatory-2.hbs');
const housingFormPageNavTemplate = require('../../templates/housing-form-pagenav.hbs');
const modelTenancyPaymentTemplate = require('../../templates/model-tenancy-payment-dates.hbs');

$('form').each(function() {
    this.reset();
});

const modelTenancyForm = {
    form: new MultiPageForm({
        formId: 'model-tenancy-form',
        formSections: formSections,
        formMapping: formMapping,
        formObject: formObject,
        formEvents: {
            updateSummary1: function () {
                const html = modelTenancySummaryOneTemplate(modelTenancyForm.form.settings.formObject);
                document.querySelector('#summary-container-1').innerHTML = html;
                commonHousing.summaryAccordion(document.getElementById('summary-container-1'));
            },
            updateSummary2: function () {
                modelTenancyForm.form.settings.formObject.mandatory2 = true;
                const mandatoryHtml = modelTenancyMandatoryTemplate(modelTenancyForm.form.settings.formObject);
                delete modelTenancyForm.form.settings.formObject.mandatory2;
                const mandatoryEditableHtml = modelTenancyMandatoryTwoTemplate(modelTenancyForm.form.settings.formObject);
                const extraTermsHtml = modelTenancySummaryTwoTemplate(modelTenancyForm.form.settings.formObject);
                const excludedHtml = modelTenancySummaryTwoExcludedTemplate(modelTenancyForm.form.settings.formObject);
                document.querySelector('#summary-container-2').innerHTML = mandatoryHtml + mandatoryEditableHtml + extraTermsHtml;
                document.querySelector('#summary-container-2-excluded').innerHTML = excludedHtml;
                commonHousing.summaryAccordion(document.getElementById('summary-container-2'));
                commonHousing.summaryAccordion(document.getElementById('summary-container-2-excluded'));
            },
            updateMandatoryTerms: function () {
                const html = modelTenancyMandatoryTemplate(modelTenancyForm.form.settings.formObject);
                document.querySelector('#mandatory-terms-container').innerHTML = html + '</div>';
                commonHousing.summaryAccordion(document.getElementById('mandatory-terms-container'));
            }
        },
        modifiers: [{
            pattern: new RegExp(/\.postcode$/),
            transformFunction: function () {
                return arguments[0].toUpperCase();
            }
        }],
        pageNavFunction: pageNavFunction,
        pageNavTemplate: housingFormPageNavTemplate
    }),

    downloadCount: { word: 0, pdf: 0 },

    init: function () {

        feedback.init();
        this.getDefaultText();
        commonHousing.setManualLinkSections();
        this.setupExtraTerms();
        this.setupRepeatingSections();
        this.setupDatePickers();
        this.setupValidations();
        this.setupPostcodeLookups();
        this.setupPaymentDatePickers();
        commonForms.setupRecaptcha();
        modelTenancyForm.form.validateStep = modelTenancyForm.validateStep;

        new EditableTable({ // NOSONAR
            tableContainer: $('#facilities-table'),
            dataPath: 'facilities',
            fields: [{
                title: 'Facility name',
                slug: 'name',
                validation: 'requiredField'
            }, {
                title: 'Type',
                slug: 'type',
                validation: 'requiredField',
                options: [
                    {displayName: '', value: ''},
                    {displayName: 'Included', value: 'INCLUDED'},
                    {displayName: 'Excluded', value: 'EXCLUDED'},
                    {displayName: 'Shared', value: 'SHARED'}
                ]
            }],
            addText: 'Add area or facility'
        });

        new EditableTable({ // NOSONAR
            tableContainer: $('#services-table'),
            dataPath: 'servicesIncludedInRent',
            fields: [{
                title: 'Service name',
                slug: 'name',
                validation: 'requiredField'
            }, {
                title: 'Amount (per rent payment)',
                slug: 'value',
                format: 'currency',
                validation: 'validCurrency requiredField'
            }],
            addText: 'Add a service'
        });

        new EditableTable({ // NOSONAR
            tableContainer: $('#letting-agent-services-table'),
            dataPath: 'servicesProvidedByLettingAgent',
            fields: [{
                title: 'Service name',
                slug: 'name',
                validation: 'requiredField'
            }, {
                title: 'Is the letting agent the first point of contact for this service?',
                slug: 'lettingAgentIsFirstContact',
                type: 'radio',
                options: [
                    {displayName: 'Yes', value: 'YES'},
                    {displayName: 'No', value: 'NO'}
                ],
                validation: 'requiredRadio'
            }],
            addText: 'Add a service'
        });

        new EditableTable({ // NOSONAR
            tableContainer: $('#letting-agent-other-services-table'),
            dataPath: 'servicesLettingAgentIsFirstContactFor',
            fields: [{
                title: 'Service name',
                slug: 'name',
                validation: 'requiredField'
            }],
            addText: 'Add a service'
        });
    },

    getDefaultText: function(section, termSection){
        $.ajax('/service/housing/model-tenancy/template')
            .done(function(data){
                if (section && termSection) {
                    modelTenancyForm.form.settings.formObject[termSection][section] = data[termSection][section];
                    $(`[data-term-title=${section}]`).val(data[termSection][section]).trigger('change');
                } else {
                    modelTenancyForm.form.settings.formObject = data;
                    modelTenancyForm.form.settings.formObject.rentPaymentScheduleObject = {};
                }
            })
            .always(function(){
                if (!section){
                    modelTenancyForm.form.init();
                }
                modelTenancyForm.form.settings.formObject.tenants = { 'tenant-1': { name: '', email: '', telephone: '', address: {} } };
                modelTenancyForm.form.settings.formObject.landlords = { 'landlord-1': { name: '', email: '', telephone: '', address: {}, registrationNumber: '' } };
                modelTenancyForm.form.settings.formObject.additionalTerms = { 'additional-term-1': { title: '', content: '' } };
                modelTenancyForm.form.settings.formObject.excludedTerms = {};
                modelTenancyForm.form.settings.formObject.facilities = [];
                // Terms sections need to not be fully hidden initally to accurately resize them for content length
                $('#extra-terms, #extra-terms section').addClass('hidden--hard');
            });
    },



    setupExtraTerms: function () {
        const toggleOptionalTerm = function (fieldName, termSection, exclude) {
            modelTenancyForm.form.settings.formObject.excludedTerms = modelTenancyForm.form.settings.formObject.excludedTerms || {};

            if (exclude === true) {
                modelTenancyForm.form.settings.formObject.excludedTerms[fieldName] = modelTenancyForm.form.settings.formObject[termSection][fieldName];
                delete modelTenancyForm.form.settings.formObject[termSection][fieldName];
            } else {
                modelTenancyForm.form.settings.formObject[termSection][fieldName] = modelTenancyForm.form.settings.formObject.excludedTerms[fieldName];
                delete modelTenancyForm.form.settings.formObject.excludedTerms[fieldName];
            }
        };

        $('body').on('click', '.js-edit-term', function(event){
            event.preventDefault();
            $(this).parent().siblings('.js-term-content').attr('disabled', false).removeClass('remove').focus();
            $(this).siblings('.js-reset-term, .js-save-term').removeClass('fully-hidden');
            $(this).addClass('fully-hidden');
        });

        $('body').on('change', '.js-include-term', function(){
            const currentStep = modelTenancyForm.form.currentStep;
            const currentSection = `[data-step="${currentStep.slug}"]`;
            const fieldName = $(currentSection).find('.js-term-content').attr('data-term-title');
            let termSection = 'optionalTerms';
            if (currentStep.section === 'must-include-terms'){
                termSection = 'mustIncludeTerms';
            }

            if (this.checked === true){
                currentStep.excluded = false;
                $(currentSection).find('.js-term-content').attr('disabled', true).removeClass('remove');
                $(currentSection).find('.js-edit-term').removeClass('fully-hidden');
                modelTenancyForm.form.updateFormNav();
                toggleOptionalTerm(fieldName, termSection, false);
            } else {
                currentStep.excluded = true;
                $(currentSection).find('.js-term-content').attr('disabled', true).addClass('remove');
                $(currentSection).find('.js-reset-term, .js-edit-term').addClass('fully-hidden');
                modelTenancyForm.form.updateFormNav();
                toggleOptionalTerm(fieldName, termSection, true);
            }
            $(currentSection).find('.js-save-term').addClass('fully-hidden');
        });

        $('body').on('click', '.js-reset-term', function(event){
            event.preventDefault();
            // open modal to confirm revert to default text
            $(this).parent().siblings('textarea').after(HousingTemplates.confirmDefaultModal);
            $('.modal')[0].focus();

            $('#js-modal-cancel, #js-modal-close, .modal__overlay').on('click', function(){
                $('.modal').remove();
            });

            const resetButton = this;

            $('#js-modal-continue').on('click', function(){
                const currentTextArea = $(resetButton).parent().siblings('textarea')[0];
                const sectionTitle = currentTextArea.getAttribute('data-term-title');

                // find out if we're in the optionalTerms or the mustIncludeTerms
                const currentStep = modelTenancyForm.form.currentStep;
                let termSection = 'optionalTerms';
                if (currentStep.section === 'must-include-terms'){
                    termSection = 'mustIncludeTerms';
                }
                modelTenancyForm.getDefaultText(sectionTitle, termSection);

                $(currentTextArea).attr('disabled', true).removeClass('remove');
                $(resetButton).siblings('.js-save-term, .js-edit-term').addClass('fully-hidden');
                $(resetButton).addClass('fully-hidden');
                $('.modal').remove();
            });
        });

        $('body').on('click', '.js-save-term', function(event){
            event.preventDefault();
            $(this).parent().siblings('textarea').attr('disabled', true);
            $(this).siblings('.js-edit-term').removeClass('fully-hidden');
            $(this).addClass('fully-hidden');
        });

        // make textareas resize to fit content for terms
        $('#extra-terms textarea, #must-include-terms textarea').each(function(){
            // set initial height
            const contentHeight = $(this)[0].scrollHeight;
            $(this).height(contentHeight);

            $(this).on('paste input change', function () {
                const borderTop = parseFloat($(this).css('borderTopWidth'));
                const borderBottom = parseFloat($(this).css('borderBottomWidth'));

                if ($(this).outerHeight() > this.scrollHeight) {
                    $(this).height('84px');
                }
                while ($(this).outerHeight() < this.scrollHeight + borderTop + borderBottom) {
                    $(this).height($(this).height() + 1);
                }
            });

            $(this).on('keypress', function() {
                modelTenancyForm.form.settings.formObject.editedTerms = modelTenancyForm.form.settings.formObject.editedTerms || [];
                const termTitle = $(this).attr('data-term-title');

                if ($.inArray(termTitle, modelTenancyForm.form.settings.formObject.editedTerms) < 0) {
                    modelTenancyForm.form.settings.formObject.editedTerms.push(termTitle);
                }
            });
        });
    },

    setupRepeatingSections: function () {
        const sections = [
            {
                name: 'tenants',
                nameInput: '.js-tenant-name',
                container: '.js-tenants-container',
                template: 'tenantHtml',
                slug: 'tenant',
                stepTitle: 'Tenant',
                guarantor: true,
                fieldMappings: function(number) {
                    const fieldMappings = {};
                    fieldMappings['tenants[\'tenant-' + number + '\'].name'] = `#tenant-${number}-name`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].email'] = `#tenant-${number}-email`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].telephone'] = `#tenant-${number}-phone`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].address.building'] = `#tenant-${number}-address-building`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].address.street'] = `#tenant-${number}-address-street`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].address.town'] = `#tenant-${number}-address-town`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].address.region'] = `#tenant-${number}-address-region`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].address.postcode'] = `#tenant-${number}-postcode`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.name'] = `#guarantor-${number}-name`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].hasGuarantor'] = `[name="guarantor${number}Query"]`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.address.building'] = `#guarantor-${number}-address-building`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.address.street'] = `#guarantor-${number}-address-street`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.address.town'] = `#guarantor-${number}-address-town`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.address.region'] = `#guarantor-${number}-address-region`;
                    fieldMappings['tenants[\'tenant-' + number + '\'].guarantor.address.postcode'] = `#guarantor-${number}-postcode`;
                    return fieldMappings;
                },
                initPostcodeLookups: function(number) {
                    new PostcodeLookup({ rpz: false, lookupId: `tenant-${number}-postcode-lookup` }); // NOSONAR
                    new PostcodeLookup({ rpz: false, lookupId: `guarantor-${number}-postcode-lookup` }); // NOSONAR
                }
            },
            {
                name: 'landlords',
                group: 'managing-the-property',
                nameInput: '.js-landlord-name',
                container: '.js-landlords-container',
                template: 'landlordHtml',
                slug: 'landlord',
                stepTitle: 'Landlord',
                fieldMappings: function(number) {
                    const fieldMappings = {};
                    fieldMappings['landlords[\'landlord-' + number + '\'].name'] = `#landlord-${number}-name`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].email'] = `#landlord-${number}-email`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].telephone'] = `#landlord-${number}-phone`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].address.building'] = `#landlord-${number}-address-building`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].address.street'] = `#landlord-${number}-address-street`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].address.town'] = `#landlord-${number}-address-town`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].address.region'] = `#landlord-${number}-address-region`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].address.postcode'] = `#landlord-${number}-postcode`;
                    fieldMappings['landlords[\'landlord-' + number + '\'].registrationNumber'] = `#landlord-${number}-registration`;
                    return fieldMappings;
                },
                initPostcodeLookups: function(number) {
                    new PostcodeLookup({ rpz: false, lookupId: `landlord-${number}-postcode-lookup` }); // NOSONAR
                }
            },
            {
                name: 'additional-terms',
                container: '.js-terms-container',
                slug: 'additional-term',
                template: 'additionalTermHtml',
                stepTitle: 'Additional terms',
                fieldMappings: function(number) {
                    const fieldMappings = {};
                    fieldMappings['additionalTerms[\'additional-term-' + number + '\'].title'] = `#additional-term-${number}-title`;
                    fieldMappings['additionalTerms[\'additional-term-' + number + '\'].content'] = `#additional-term-${number}-content`;
                    return fieldMappings;
                }
            }
        ];

        commonHousing.setupRepeatingSections(sections, this.form);

        // additional page change event:
        // if the summary page has been visited AND we're on a page before the summary page, show the "back to summary" button
        $('#page-nav').on('change', function(){
            const summaryStep = modelTenancyForm.form.getStep('slug', 'part-1-summary');
            const formSectionsFlattened = modelTenancyForm.form.flattenedSections(true);

            const thisStepIndex = formSectionsFlattened.findIndex(function (element) {
                return element.slug === modelTenancyForm.form.currentStep.slug;
            });
            const summaryStepIndex = formSectionsFlattened.findIndex(function (element) {
                return element.slug === summaryStep.slug;
            });

            const goToSummaryButton = $('#go-to-summary');

            if (summaryStep.visited && thisStepIndex < summaryStepIndex) {
                goToSummaryButton.removeClass('fully-hidden');
            } else {
                goToSummaryButton.addClass('fully-hidden');
            }
        });
    },

    setupDatePickers: function () {
        const startDatePicker = new DSDatePicker(document.getElementById('tenancy-start-date-picker'), {minDate: new Date()});
        const hmoDatePicker = new DSDatePicker(document.getElementById('hmo-expiry-date-picker'), {minDate: new Date()});
        const firstPaymentDatePicker = new DSDatePicker(document.getElementById('first-payment-date-picker'), {minDate: new Date()});
        const firstPaymentEndDatePicker = new DSDatePicker(document.getElementById('first-payment-end-date-picker'), {minDate: new Date()});

        startDatePicker.init();
        hmoDatePicker.init();
        firstPaymentDatePicker.init();
        firstPaymentEndDatePicker.init();
    },

    setupValidations: function () {
        // the "other" radio option needs to enable/disable validation on its associated text input
        $('[name="property-building"]').on('change', function () {
            if ($('[name="property-building"]:checked').val() === 'OTHER') {
                $('#building-other').attr('data-validation', 'requiredField')
                    .parent().removeClass('fully-hidden');
            } else {
                $('#building-other').removeAttr('data-validation aria-invalid')
                    .removeClass('ds_input--error')
                    .next('.current-errors')
                    .remove();
                $('#building-other').parent().addClass('fully-hidden');
            }
        });
    },

    setupPostcodeLookups: function() {
        const rpzComplete = function(rpzData){
            modelTenancyForm.form.settings.formObject.inRentPressureZone = rpzData.inRentPressureZone;
        };

        const notScottishMessage = 'The postcode you\'ve entered is not a Scottish postcode.' +
        ' You can only create a Scottish Government Model Tenancy Agreement for' +
        ' homes in Scotland. <a href="https://www.gov.uk/tenancy-agreements-a-guide-for' +
        '-landlords" target="_blank">Find out more about UK tenancy agreements' +
        ' (opens in a new window)</a>.';

        new PostcodeLookup({ rpz: true, // NOSONAR
            lookupId: 'property-postcode-lookup',
            rpzComplete: rpzComplete,
            notScottishMessage: notScottishMessage,
            readOnly: true
        });
        new PostcodeLookup({ rpz: false, lookupId: 'landlord-1-postcode-lookup' }); // NOSONAR
        new PostcodeLookup({ rpz: false, lookupId: 'letting-agent-postcode-lookup' }); // NOSONAR
        new PostcodeLookup({ rpz: false, lookupId: 'agent-postcode-lookup' }); // NOSONAR
        new PostcodeLookup({ rpz: false, lookupId: 'property-factor-postcode-lookup' }); // NOSONAR
        new PostcodeLookup({ rpz: false, lookupId: 'tenant-1-postcode-lookup' }); // NOSONAR
        new PostcodeLookup({ rpz: false, lookupId: 'guarantor-1-postcode-lookup' }); // NOSONAR
    },

    setupPaymentDatePickers: function() {
        const that = this;
        // On choosing a payment frequency, display more options for when during each period rent is due
        $('#tenancy-payment-frequency').on('change', function(){
            if (!$(this).val()) {
                return;
            }

            const paymentData  = {};
            paymentData[$(this).val()] = true;

            const paymentHtml = modelTenancyPaymentTemplate(paymentData);
            $('#tenancy-payment-dates').html(paymentHtml);

            // Reset the form's data on what the schedule is
            that.form.settings.formObject.rentPaymentScheduleObject = {};

            // Map new fields to formObject
            const fieldMappings = {
                'rentPaymentScheduleObject.day': '#tenancy-payment-frequency-day',
                'rentPaymentScheduleObject.week': '#tenancy-payment-frequency-week',
                'rentPaymentScheduleObject.date': '#tenancy-payment-frequency-date'
            };

            for (const key in fieldMappings) {
                if (!fieldMappings.hasOwnProperty(key)) { continue; }
                that.form.mapField(key, fieldMappings[key]);
            }
        });
    },

    validateStep: function () {
        return commonHousing.validateStep(modelTenancyForm.form.currentStep);
    },

    prepareFormDataForPost: function (formData) {
        // 1. build up the guarantors
        const tenants = formData.tenants,
            guarantors = [];

        for (const key in tenants) {
            const tenant = tenants[key];

            if (tenant.hasGuarantor === 'guarantor-yes') {
                let guarantorMatch = false;
                tenant.guarantor.address = tenant.guarantor.address || {};

                for (let i = 0, il = guarantors.length; i < il; i++) {
                    const guarantor = guarantors[i];

                    if (guarantor.name === tenant.guarantor.name &&
                        guarantor.address.street === tenant.guarantor.address.street
                    ) {
                        guarantor.tenantNames.push(tenant.name);
                        guarantorMatch = true;
                    }
                }

                if (!guarantorMatch) {
                    guarantors.push({
                        name: tenant.guarantor.name,
                        address: {
                            building: tenant.guarantor.address.building,
                            street: tenant.guarantor.address.street,
                            town: tenant.guarantor.address.town,
                            region: tenant.guarantor.address.region,
                            postcode: tenant.guarantor.address.postcode
                        },
                        tenantNames: [ tenant.name ]
                    });
                }
            }
            delete tenant.guarantor;
            delete tenant.hasGuarantor;
            delete tenant.hasGuarantor_text;
        }

        if (guarantors.length > 0) {
            formData.guarantors = guarantors;
        }

        // 2. Format dates to YYYY-MM-DD
        const dateFields = ['tenancyStartDate', 'firstPaymentDate', 'firstPaymentPeriodEnd', 'hmoRegistrationExpiryDate'];

        for (let j = 0; j < dateFields.length; j++) {
            const field = dateFields[j];
            const value = formData[field];
            if (value === null || value.split(' ').join('') === ''){
                continue;
            }

            const momentDate = moment(value, 'DD/MM/YYYY');
            formData[field] = momentDate.format('YYYY-MM-DD');
        }

        // 3. Add value from 'other' option in property type field if selected
        if ($('#building-other-query').is(':checked')) {
            formData.propertyType = $('#building-other').val();
        } else {
            formData.propertyType = $('[name="property-building"]:checked + label').text();
        }

        // 4. Shred the facilities into expected places
        formData.includedAreasOrFacilities = formData.includedAreasOrFacilities || [];
        formData.excludedAreasFacilities = formData.excludedAreasFacilities || [];
        formData.sharedFacilities = formData.sharedFacilities || [];
        for (let j = 0, jl = formData.facilities.length; j < jl; j++) {
            const facility = formData.facilities[j];

            if (facility.type === 'INCLUDED') {
                formData.includedAreasOrFacilities.push(facility.name);
            } else if (facility.type === 'EXCLUDED') {
                formData.excludedAreasFacilities.push(facility.name);
            } else if (facility.type === 'SHARED') {
                formData.sharedFacilities.push(facility.name);
            }
        }

        // 5. Format tenants, landlords, additional and excluded terms into arrays
        formData.tenants = commonForms.objectValues(formData.tenants);
        formData.landlords = commonForms.objectValues(formData.landlords);
        formData.additionalTerms = commonForms.objectValues(formData.additionalTerms);
        formData.excludedTerms = commonForms.objectKeys(formData.excludedTerms);

        // 6. Format rent payment schedule into a sentence string
        const frequency = formData.rentPaymentFrequency;
        const schedule = formData.rentPaymentScheduleObject;

        let scheduleString = '';
        const day = schedule.day || '';
        const week = schedule.week || '';
        const date = schedule.date || '';

        if (commonForms.objectKeys(schedule).length > 0){
            switch (frequency) {
            case 'WEEKLY':
                scheduleString = day;
                break;
            case 'FORTNIGHTLY':
            case 'EVERY_FOUR_WEEKS':
                scheduleString = `{$day} of the ${week.toLowerCase()}`;
                break;
            case 'CALENDAR_MONTH':
                scheduleString = `the ${date} of the month`;
                break;
            case 'QUARTERLY':
            case 'EVERY_SIX_MONTHS':
                scheduleString = `the ${date}`;
                break;
            default:
                break;
            }
        }

        formData.rentPaymentSchedule = scheduleString;

        // 7. Remove letting agent details if user has said there is none
        if (formData.hasLettingAgent === 'letting-agent-no'){
            formData.lettingAgent = null;
        }
        return formData;
    }
};

function pageNavFunction () {
    // which extra buttons do we show?
    const pageNavData = {};
    const currentStep = modelTenancyForm.form.currentStep;

    pageNavData.backToDetails = currentStep.slug === 'part-2-summary';
    pageNavData.startPage = currentStep.slug === 'summary';

    const stepIsLastInSection = currentStep.slug === $(`[data-step="${currentStep.section}"] section:last`).attr('data-step');

    if (stepIsLastInSection) {
        pageNavData.addLandlord = (currentStep.section === 'managing-the-property' && currentStep.slug !== 'letting-agent');
        pageNavData.addTenant = currentStep.section === 'tenants';
        pageNavData.addTerm = currentStep.section === 'additional-terms';
    }

    return pageNavData;
}

$('.js-download-file').on('click', function (event) {
    event.preventDefault();
    const documentDownloadForm = $('#mta-document-download');
    documentDownloadForm.find('input[name="type"]').val($(this).closest('.document-info').attr('data-documenttype'));
    documentDownloadForm.submit();
});

$('#mta-document-download').on('submit', function() {
    // make a copy of the form data to manipulate before posting
    const formData = JSON.parse(JSON.stringify(modelTenancyForm.form.settings.formObject));
    const data = modelTenancyForm.prepareFormDataForPost(formData);
    data.recaptcha = grecaptcha.getResponse();

    // analytics tracking
    const downloadType = $(this).find('input[name=type]').val();
    modelTenancyForm.downloadCount[downloadType.toLowerCase()]++;

    const includedTerms = commonForms.objectKeys(data.optionalTerms);
    const excludedTerms = data.excludedTerms || [];
    const editedTerms = data.editedTerms || [];
    delete data.editedTerms;

    commonForms.track({
        'event': 'formSubmitted',
        'formId': 'model-tenancy-form',
        'downloadType': downloadType,
        'downloadCount': modelTenancyForm.downloadCount,
        'tenantNumber': data.tenants.length,
        'landlordNumber': data.landlords.length,
        'additionalTermNumber': data.additionalTerms.length,
        'includedTerms': includedTerms,
        'excludedTerms': excludedTerms,
        'editedTerms': editedTerms
    });

    // Set hidden data field to have value of JSON data
    $(this).find('input[name="data"]').val(encodeURIComponent(JSON.stringify(data)));
    expireRecaptcha();
});

window.format = modelTenancyForm;
window.format.init();

export default modelTenancyForm;