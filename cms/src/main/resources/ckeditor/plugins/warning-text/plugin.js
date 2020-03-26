CKEDITOR.plugins.add('warning-text', {
    requires: 'widget',
    icons: 'warning-text',
    init: function (editor) {
        editor.widgets.add('warning-text', {
            button: 'Add warning text',

            template: `<div class="ds_warning-text">
                <strong class="ds_warning-text__icon" aria-hidden="true">!</strong>
                <strong class="visually-hidden">Warning</strong>
                <div class="ds_warning-text__text">

                </div>
            </div>`,

            editables: {
                content: {
                    selector: '.ds_warning-text__text',
                    pathName: 'warning'
                },
            },

            allowedContent:
            'strong(!ds_warning-text__icon); strong(!visually-hidden); div(!ds_warning-text__text)',

            upcast: function( element ) {
                return element.name == 'div' && element.hasClass( 'ds_warning-text' );
            }
        });
    }
});
