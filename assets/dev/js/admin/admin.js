( function( $, window, document ) {
	'use strict';

	var WroterAdminApp = {

		cacheElements: function() {
			this.cache = {
				$body: $( 'body' ),
				$switchMode: $( '#wroter-switch-mode' ),
				$goToEditLink: $( '#wroter-go-to-edit-page-link' ),
				$switchModeInput: $( '#wroter-switch-mode-input' ),
				$switchModeButton: $( '#wroter-switch-mode-button' ),
				$wroterLoader: $( '.wroter-loader' ),
				$builderEditor: $( '#wroter-editor' )
			};
		},

		toggleStatus: function() {
			var isBuilderMode = 'builder' === this.getEditMode();

			this.cache.$body
			    .toggleClass( 'wroter-editor-active', isBuilderMode )
			    .toggleClass( 'wroter-editor-inactive', ! isBuilderMode );
		},

		bindEvents: function() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( 'builder' === self.getEditMode() ) {
					self.cache.$switchModeInput.val( 'editor' );
				} else {
					self.cache.$switchModeInput.val( 'builder' );

					var $wpTitle = $( '#title' );

					if ( ! $wpTitle.val() ) {
						$wpTitle.val( 'Wroter #' + $( '#post_ID' ).val() );
					}

					wp.autosave.server.triggerSave();

					self.animateLoader();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						$( window ).off( 'beforeunload.edit-post' );
						window.location = self.cache.$goToEditLink.attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			self.cache.$goToEditLink.on( 'click', function() {
				self.animateLoader();
			} );

			$( 'div.notice.wroter-message-dismissed' ).on( 'click', 'button.notice-dismiss', function( event ) {
				event.preventDefault();

				$.post( ajaxurl, {
					action: 'wroter_set_admin_notice_viewed',
					notice_id: $( this ).closest( '.wroter-message-dismissed' ).data( 'notice_id' )
				} );
			} );

			$( '#wroter-library-sync-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'wroter_reset_library',
					_nonce: $thisButton.data( 'nonce' )
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();

			this.initTemplatesImport();
		},

		initTemplatesImport: function() {
			if ( ! this.cache.$body.hasClass( 'post-type-wroter_library' ) ) {
				return;
			}

			var self = this,
				$importButton = self.cache.$importButton = $( '#wroter-import-template-trigger' ),
				$importArea = self.cache.$importArea = $( '#wroter-import-template-area' );

			self.cache.$formAnchor = $( 'h1' );

			$( '#wpbody-content' ).find( '.page-title-action' ).after( $importButton );

			self.cache.$formAnchor.after( self.cache.$importArea );

			$importButton.on( 'click', function() {
				$importArea.toggle();
			} );
		},

		getEditMode: function() {
			return this.cache.$switchModeInput.val();
		},

		animateLoader: function() {
			this.cache.$goToEditLink.addClass( 'wroter-animate' );
		}
	};

	$( function() {
		WroterAdminApp.init();
	} );

}( jQuery, window, document ) );
