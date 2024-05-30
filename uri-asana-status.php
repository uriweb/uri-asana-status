<?php
/**
 * Plugin Name: URI Asana Status
 * Plugin URI: http://www.uri.edu
 * Description: Provides a shortcode to display task statuses from an Asana project
 * Version: 0.1.0
 * Author: URI Web Communications
 * Author URI: https://www.uri.edu/
 *
 * @author: Brandon Fuller <bjcfuller@uri.edu>
 * @package uri-asana-status
 */

// Block direct requests
if ( ! defined( 'ABSPATH' ) ) {
	die( '-1' );
}

define( 'URI_ASANA_STATUS_PATH', plugin_dir_path( __FILE__ ) );
define( 'URI_ASANA_STATUS_URL', str_replace( '/assets', '/', plugins_url( 'assets', __FILE__ ) ) );


function uri_asana_status_cache_buster() {
	static $cache_buster;
	if ( empty( $cache_buster ) && function_exists( 'get_plugin_data' ) ) {
		$values = get_plugin_data( plugin_dir_path( __FILE__ ) . 'uri-asana-status.php', false );
		$cache_buster = $values['Version'];
	} else {
		$cache_buster = gmdate( 'Ymd', strtotime( 'now' ) );
	}
	return $cache_buster;
}


/**
 * Include css and js
 */
function uri_asana_status_enqueues() {

	wp_register_style( 'uri-asana-status-css', plugins_url( '/css/style.built.css', __FILE__ ), array(), uri_asana_status_cache_buster() );
	wp_enqueue_style( 'uri-asana-status-css' );

	wp_register_script( 'uri-asana-status-js', plugins_url( '/js/script.built.js', __FILE__ ), array(), uri_asana_status_cache_buster(), array( 'in_footer' => true ) );
	wp_enqueue_script( 'uri-asana-status-js' );

}
add_action( 'wp_enqueue_scripts', 'uri_asana_status_enqueues' );

// Include the admin settings screen
include( URI_ASANA_STATUS_PATH . 'inc/uri-asana-status-settings.php' );

// Include the shortcode
include( URI_ASANA_STATUS_PATH . 'inc/uri-asana-status-shortcode.php' );
