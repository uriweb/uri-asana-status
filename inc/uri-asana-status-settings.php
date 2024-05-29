<?php
/**
 * Create admin settings menu
 *
 * @package uri-asana-status
 */


/**
 * Register settings
 */
function uri_asana_status_register_settings() {

	register_setting(
	   'uri_asana_status',
	   'uri_asana_status_token',
	);

	add_settings_section(
	   'uri_asana_status_settings',
	   __( 'URI Asana Status Settings', 'uri' ),
	  'uri_asana_status_settings_section',
	  'uri_asana_status'
	);

	// register field
	add_settings_field(
	   'uri_asana_status_token', // id: as of WP 4.6 this value is used only internally
	  __( 'Personal Access Token', 'uri' ), // title
	  'uri_asana_status_token_field', // callback
	  'uri_asana_status', // page
	  'uri_asana_status_settings', // section
	  array( // args
		  'label_for' => 'uri-asana-status-field-token',
		  'class' => 'uri_asana_status_row',
	  )
	  );
}

 add_action( 'admin_init', 'uri_asana_status_register_settings' );

 /**
  * Callback for a settings section
  *
  * @param arr $args has the following keys defined: title, id, callback.
  * @see add_settings_section()
  */
function uri_asana_status_settings_section( $args ) {
	echo '<p id="' . esc_attr( $args['id'] ) . '">' . esc_html_e( 'URI Asana Status displays task statuses for an Asana project.', 'uri' ) . '</p>';
}

/**
 * Add the settings page to the settings menu
 *
 * @see https://developer.wordpress.org/reference/functions/add_options_page/
 */
function uri_asana_status_settings_page() {
	add_options_page(
		__( 'URI Asana Status Settings', 'uri' ),
		__( 'URI Asana Status', 'uri' ),
		'manage_options',
		'uri-asana-status-settings',
		'uri_asana_status_settings_page_html'
	);
}
add_action( 'admin_menu', 'uri_asana_status_settings_page' );

/**
 * Callback to render the HTML of the settings page.
 * Renders the HTML on the settings page
 */
function uri_asana_status_settings_page_html() {
	// check user capabilities
	// on web.uri, we have to leave this pretty loose
	// because web com doesn't have admin privileges.
	if ( ! current_user_can( 'manage_options' ) ) {
		echo '<div id="setting-message-denied" class="updated settings-error notice is-dismissible"> 
<p><strong>You do not have permission to save this form.</strong></p>
<button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button></div>';
		return;
	}
	?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form action="options.php" method="post">
				<?php
					// output security fields for the registered setting "uri_asana_status"
					settings_fields( 'uri_asana_status' );
					// output setting sections and their fields
					// (sections are registered for "uri_asana_status", each field is registered to a specific section)
					do_settings_sections( 'uri_asana_status' );
					// output save settings button
					submit_button( 'Save Settings' );
				?>
			</form>
		</div>
	<?php
}

/**
 * Field callback
 * outputs the field
 *
 * @see add_settings_field()
 */
function uri_asana_status_token_field( $args ) {
	// get the value of the setting we've registered with register_setting()
	$setting = get_option( 'uri_asana_status_token' );
	// output the field
	?>
		<input type="text" class="regular-text" aria-describedby="uri-asana-status-field-token" name="uri_asana_status_token" id="uri-asana-status-field-token" value="<?php print ( false !== $setting ) ? esc_attr( $setting ) : ''; ?>">
		<p class="uri-asana-status-field-token">
			<?php
				esc_html_e( 'Provide a Personal Access Token for authentication.', 'uri' );
				echo '<br />';
			?>
		</p>
	<?php
}
