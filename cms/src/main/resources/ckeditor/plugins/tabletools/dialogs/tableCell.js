﻿/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.dialog.add( 'cellProperties', function( editor ) {
	var langTable = editor.lang.table,
		langCell = langTable.cell,
		langCommon = editor.lang.common,
		validate = CKEDITOR.dialog.validate,
		items = [
			{
				type: 'select',
				id: 'wordWrap',
				requiredContent: 'td{white-space}',
				label: langCell.wordWrap,
				'default': 'yes',
				items: [
					[ langCell.yes, 'yes' ],
					[ langCell.no, 'no' ]
				],
				setup: setupCells( function( element ) {
					var wordWrapAttr = element.getAttribute( 'noWrap' ),
						wordWrapStyle = element.getStyle( 'white-space' );

					if ( wordWrapStyle == 'nowrap' || wordWrapAttr ) {
						return 'no';
					}
				} ),
				commit: function( element ) {
					if ( this.getValue() == 'no' ) {
						element.setStyle( 'white-space', 'nowrap' );
					} else {
						element.removeStyle( 'white-space' );
					}

					element.removeAttribute( 'noWrap' );
				}
			},
			createSpacer( 'td{white-space}' ),
			{
				type: 'select',
				id: 'hAlign',
				requiredContent: 'td{text-align}',
				label: langCell.hAlign,
				'default': '',
				items: [
					[ langCommon.notSet, '' ],
					[ langCommon.left, 'left' ],
					[ langCommon.center, 'center' ],
					[ langCommon.right, 'right' ],
					[ langCommon.justify, 'justify' ]
				],
				setup: setupCells( function( element ) {
					var alignAttr = element.getAttribute( 'align' ),
						textAlignStyle = element.getStyle( 'text-align' );

					return textAlignStyle || alignAttr || '';
				} ),
				commit: function( selectedCell ) {
					var value = this.getValue();

					if ( value ) {
						selectedCell.setStyle( 'text-align', value );
					} else {
						selectedCell.removeStyle( 'text-align' );
					}

					selectedCell.removeAttribute( 'align' );
				}
			}, {
				type: 'select',
				id: 'vAlign',
				requiredContent: 'td{vertical-align}',
				label: langCell.vAlign,
				'default': '',
				items: [
					[ langCommon.notSet, '' ],
					[ langCommon.alignTop, 'top' ],
					[ langCommon.alignMiddle, 'middle' ],
					[ langCommon.alignBottom, 'bottom' ],
					[ langCell.alignBaseline, 'baseline' ]
				],
				setup: setupCells( function( element ) {
					var vAlignAttr = element.getAttribute( 'vAlign' ),
						vAlignStyle = element.getStyle( 'vertical-align' );

					switch ( vAlignStyle ) {
						// Ignore all other unrelated style values..
						case 'top':
						case 'middle':
						case 'bottom':
						case 'baseline':
							break;
						default:
							vAlignStyle = '';
					}

					return vAlignStyle || vAlignAttr || '';
				} ),
				commit: function( element ) {
					var value = this.getValue();

					if ( value ) {
						element.setStyle( 'vertical-align', value );
					} else {
						element.removeStyle( 'vertical-align' );
					}

					element.removeAttribute( 'vAlign' );
				}
			},
			createSpacer( [ 'td{text-align}', 'td{vertical-align}' ] ),
			{
				type: 'select',
				id: 'cellType',
				requiredContent: 'th',
				label: langCell.cellType,
				'default': 'td',
				items: [
					[ langCell.data, 'td' ],
					[ langCell.header, 'th' ]
				],
				setup: setupCells( function( selectedCell ) {
					return selectedCell.getName();
				} ),
				commit: function( selectedCell ) {
					selectedCell.renameNode( this.getValue() );
				}
			},
			createSpacer( 'th' ),
			{
				type: 'text',
				id: 'rowSpan',
				requiredContent: 'td[rowspan]',
				label: langCell.rowSpan,
				'default': '',
				validate: validate.integer( langCell.invalidRowSpan ),
				setup: setupCells( function( selectedCell ) {
					var attrVal = parseInt( selectedCell.getAttribute( 'rowSpan' ), 10 );
					if ( attrVal && attrVal != 1 ) {
						return attrVal;
					}
				} ),
				commit: function( selectedCell ) {
					var value = parseInt( this.getValue(), 10 );
					if ( value && value != 1 ) {
						selectedCell.setAttribute( 'rowSpan', this.getValue() );
					} else {
						selectedCell.removeAttribute( 'rowSpan' );
					}
				}
			}, {
				type: 'text',
				id: 'colSpan',
				requiredContent: 'td[colspan]',
				label: langCell.colSpan,
				'default': '',
				validate: validate.integer( langCell.invalidColSpan ),
				setup: setupCells( function( element ) {
					var attrVal = parseInt( element.getAttribute( 'colSpan' ), 10 );
					if ( attrVal && attrVal != 1 ) {
						return attrVal;
					}
				} ),
				commit: function( selectedCell ) {
					var value = parseInt( this.getValue(), 10 );
					if ( value && value != 1 ) {
						selectedCell.setAttribute( 'colSpan', this.getValue() );
					} else {
						selectedCell.removeAttribute( 'colSpan' );
					}
				}
			}
		],
	itemsCount = 0,
	index = -1,
	children = [ createColumn() ];

	items = CKEDITOR.tools.array.filter( items, function( item ) {
		var requiredContent = item.requiredContent,
			ret;

		// Remove it, as there is no need to filter again.
		delete item.requiredContent;

		ret = editor.filter.check( requiredContent );

		if ( ret && !item.isSpacer ) {
			itemsCount++;
		}

		return ret;
	} );

	if ( itemsCount > 5 ) {
		children = children.concat( [ createSpacer(), createColumn() ] );
	}

	CKEDITOR.tools.array.forEach( items, function( item ) {
		if ( !item.isSpacer ) {
			index++;
		}
		if ( itemsCount > 5 && index >= itemsCount / 2 ) {
			children[ 2 ].children.push( item );
		} else {
			children[ 0 ].children.push( item );
		}
	} );

	CKEDITOR.tools.array.forEach( children, function( item ) {
		if ( item.isSpacer ) {
			return;
		}

		var children = item.children;

		if ( children[ children.length - 1 ].isSpacer ) {
			children.pop();
		}
	} );

	return {
		title: langCell.title,
		minWidth: children.length === 1 ? 205 : 410,
		minHeight: 50,
		contents: [ {
			id: 'info',
			label: langCell.title,
			accessKey: 'I',
			elements: [ {
				type: 'hbox',
				widths: children.length === 1 ? [ '100%' ] : [ '40%', '5%', '40%' ],
				children: children
			} ]
		} ],
		getModel: function( editor ) {
			return CKEDITOR.plugins.tabletools.getSelectedCells( editor.getSelection() );
		},
		onShow: function() {
			var cells = this.definition.getModel( this.getParentEditor() );
			this.setupContent( cells );
		},
		onOk: function () {
			var selection = this._.editor.getSelection(),
				bookmarks = selection.createBookmarks(),
				editor = this.getParentEditor(),
				cells = this.definition.getModel( editor );

			for ( var i = 0; i < cells.length; i++ ) {
				this.commitContent( cells[ i ] );
			}

			editor.forceNextSelectionCheck();
			selection.selectBookmarks( bookmarks );
			editor.selectionChange();
		},
		onLoad: function() {
			var saved = {};

			// Prevent from changing cell properties when the field's value
			// remains unaltered, i.e. when selected multiple cells and dialog loaded
			// only the properties of the first cell (https://dev.ckeditor.com/ticket/11439).
			this.foreach( function( field ) {
				if ( !field.setup || !field.commit ) {
					return;
				}

				// Save field's value every time after "setup" is called.
				field.setup = CKEDITOR.tools.override( field.setup, function( orgSetup ) {
					return function() {
						orgSetup.apply( this, arguments );
						saved[ field.id ] = field.getValue();
					};
				} );

				// Compare saved value with actual value. Update cell only if value has changed.
				field.commit = CKEDITOR.tools.override( field.commit, function( orgCommit ) {
					return function() {
						if ( saved[ field.id ] !== field.getValue() ) {
							orgCommit.apply( this, arguments );
						}
					};
				} );
			} );
		}
	};

	function createSpacer( requiredContent ) {
		return {
			isSpacer: true,
			type: 'html',
			html: '&nbsp;',
			requiredContent: requiredContent ? requiredContent : undefined
		};
	}

	function createColumn() {
		return {
			type: 'vbox',
			padding: 0,
			children: []
		};
	}

	// Returns a function that runs a regular "setup" for all selected cells to find out
	// whether the initial value of the field would be the same for all cells. If so,
	// the value is displayed just as if a regular "setup" was executed. Otherwise,
	// when there are several cells with a different value of the property, a field
	// gets an empty value.
	//
	// * @param {Function} setup Setup function which returns a value instead of setting it.
	// * @returns {Function} A function to be used in the dialog definition.
	function setupCells( setup ) {
		return function( cells ) {
			var fieldValue = setup( cells[ 0 ] );

			// If one of the cells would have a different value of the
			// property, set the empty value for a field.
			for ( var i = 1; i < cells.length; i++ ) {
				if ( setup( cells[ i ] ) !== fieldValue ) {
					fieldValue = null;
					break;
				}
			}

			// Setting meaningful or empty value only makes sense
			// when setup returns some value. Otherwise, a *default* value
			// is used for that field.
			if ( typeof fieldValue != 'undefined' ) {
				this.setValue( fieldValue );

				// The only way to have an empty select value in Firefox is
				// to set a negative selectedIndex.
				if ( CKEDITOR.env.gecko && this.type == 'select' && !fieldValue ) {
					this.getInputElement().$.selectedIndex = -1;
				}
			}
		};
	}
} );
