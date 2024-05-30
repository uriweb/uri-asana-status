/**
 * SCRIPTS
 *
 * @package uri-asana-status
 */

( function() {

	const init = async () => {

		console.log('running...');

		// Get element on the page (return false if there isn't one)
		const el = document.getElementById( 'uri-asana-status' );

		if ( null === el ) {
			return false;
		}

		// Get info from the localized variable to make life a little easier
		const pat = uriAsanaStatus.token;
		const projectID = uriAsanaStatus.project;

		// Set the header
		const httpHeaders = { Authorization: `Bearer ${pat}` };

		// Validate the token
		validateToken( pat, httpHeaders );

		// Run the asynchronous extractTasks() function
		// This returns an array of objects, each representing a task
		const tasks = await extractTasks(
			projectID,
			httpHeaders
		);

		formatResults( tasks, el );

	}

	async function validateToken( pat, httpHeaders ) {

		console.log('validating token...');

		// Confirm that the personal access token works
		// For more information on personal access tokens, see: https://developers.asana.com/docs/personal-access-token
		// For more information on this API endpoint, see: https://developers.asana.com/reference/getuser
		const resp = await fetch(`https://app.asana.com/api/1.0/users/me`, {
			headers: httpHeaders,
		});

		// Display an error if we do not receive a 200 OK response
		if (!resp.ok) {
			const message = "Your personal access token is invalid. For documentation, see: https://developers.asana.com/docs/personal-access-token";
			console.log(message);
			return;
		}
	}

	async function extractTasks( projectID, httpHeaders ) {

		console.log('extracting tasks...');

		try {
			// Get all tasks from the project
			let items = await getTasks(projectID, {
				headers: httpHeaders,
			});

			// Parse just the fields we want for each task and push to a new array
			const tasks = new Array();

			for ( const i in items ) {
				let item = items[i];
				let meta = {};
				for ( const f in item.custom_fields ) {
					let field = item.custom_fields[f];
					if ( "RID" == field.name ) {
						meta.rid = field.display_value;
					}
					if ( "Status" == field.name ) {
						meta.status = field.display_value;
					}
				}
				tasks.push(meta);
			}
		
			// Return the formatted array of tasks
			return tasks;
		  } catch (error) {
			console.log(error);
			console.log( "Something went wrong... inpect the page to view the dev console or wait and try again" );
		  }
	}

	async function getTasks() {

		console.log('getting tasks...');

		const options = {
			method: 'GET',
			headers: {
				accept: 'application/json',
				authorization: 'Bearer ' + uriAsanaStatus.token // asana is a variable localized in 'uri_asana_status_shortcode'
			}
		};

		// Max retries for rate limited calls
		// For more information on rate limits, see: https://developers.asana.com/docs/rate-limits
		const maxRetries = 10;
		let retryCounter = 0;
	  
		// While we haven't finished the request, keep trying
		while (retryCounter < maxRetries) {
			// Get items from the portfolio with the exact fields we want
			// For more information on this API endpoint, see: https://developers.asana.com/reference/getitemsforportfolio
			// For more information on choosing which fields are returned in the response, see: https://developers.asana.com/docs/inputoutput-options
			const resp = await fetch(
				'https://app.asana.com/api/1.0/projects/' + uriAsanaStatus.project + '/tasks?opt_fields=name,custom_fields.name,custom_fields.display_value&completed_since=now&opt_pretty=true',
				options
			);
	  
			// The request succeeds, return the response from the API
			if ( 200 === resp.status ) {
				const results = await resp.json();
				return results.data;
			}
	  
			// If there is an error (due to lack of permissions, etc.), stop the iteration and display an error
			if (resp.status >= 400 && resp.status !== 429 && resp.status !== 500) {
				console.error('Could not retrieve tasks');
				break;
			}
	  
			// Back off exponentially in case we're hitting rate limits (i.e., wait before retrying)
			retryCounter++;
			const waitTime = retryCounter * retryCounter * 120;
			await new Promise((resolve) => setTimeout(resolve, waitTime));
		}
	  
		// Return an empty array by default
		return [];
	}

	function formatResults( tasks, el ) {

		console.log('formatting results...');

		console.log('tasks', tasks);

		let results = document.createElement( 'ul' );
		results.classList = 'uri-asana-results';

		for ( let t in tasks ) {
			let task = tasks[t];
			let li = document.createElement( 'li' );
			li.classList = `task ${task.status.toLowerCase().replace(' ','-')}`;

			let markup = `<div class="task-ID">${task.rid}</div>`;
			markup += `<div class="task-status">${task.status}</div>`;

			li.innerHTML = markup;
			results.appendChild( li );
		}

		el.appendChild( results );

	}

	window.addEventListener( 'load', init, false );


})();
