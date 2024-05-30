<?php
/**
 * URI Asana Status Shortcode
 *
 * @package uri-asana-status
 */

/**
 * Create a shortcode for displaying calculator.
 */
function uri_asana_status_shortcode( $attributes, $content, $shortcode ) {

	// normalize attribute keys, lowercase
	$attributes = array_change_key_case( (array) $attributes, CASE_LOWER );

	// default attributes
	$attributes = shortcode_atts(
		 array(
			 'project' => '',
		 ),
		$attributes,
		$shortcode
	);

	$asana = array(
		'token' => get_option( 'uri_asana_status_token', false ),
		'project' => $attributes['project'],
	);
	// var_dump( $asana );
	wp_localize_script( 'uri-asana-status-js', 'uriAsanaStatus', $asana );

	return '<div id="uri-asana-status"><h2>Outstanding Tasks</h2></div>';
}
add_shortcode( 'uri-asana-status', 'uri_asana_status_shortcode' );