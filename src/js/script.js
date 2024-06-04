/**
 * SCRIPTS
 *
 * @package uri-asana-status
 */

( function() {

	const init = async () => {

		//console.log('running...');

		// Get elements on the page (return false if there isn't one)
		const els = {
			parent: document.getElementById( 'uri-asana-status' ),
		};

		if ( null === els.parent ) {
			return false;
		}

		els.message = els.parent.getElementsByClassName( 'uri-asana-status-message' )[0];

		//console.log( 'proceeding...' );

		// Set the headers
		const httpHeaders = {
			accept: 'application/json',
			authorization: `Bearer ${uriAsanaStatus.token}`
		};

		// Validate the token
		validateToken( httpHeaders, els );

		// Run the asynchronous parseTasks() function
		// This returns an array of objects, each representing a task
		const tasks = await parseTasks(
			uriAsanaStatus.project,
			httpHeaders,
			els
		);

		displayResults( tasks, els );

	}

	/*
	 * Confirm that the personal access token works
	 * For more information on personal access tokens, see: https://developers.asana.com/docs/personal-access-token
	 * For more information on this API endpoint, see: https://developers.asana.com/reference/getuser
	 */
	async function validateToken( httpHeaders, els ) {

		//console.log('validating token...');

		const resp = await fetch(`https://app.asana.com/api/1.0/users/me`, {
			headers: httpHeaders,
		});

		// Display an error if we do not receive a 200 OK response
		if ( !resp.ok ) {
			els.message.innerHTML = "Your personal access token is invalid. For documentation, see: https://developers.asana.com/docs/personal-access-token";
			return;
		}
	}

	/*
	 * Parse the tasks returned for the fields we want
	 */
	async function parseTasks( projectID, httpHeaders, els ) {

		//console.log('parsing tasks...');

		els.message.innerHTML = '<span class="loading"></span>Loading...';

		try {
			// Get all tasks from the project
			let items = await getTasks( projectID, httpHeaders );

			//console.log('items', items);

			// Parse just the fields we want for each task and push to a new array
			const tasks = new Array();

			for ( const i in items ) {
				let item = items[i];
				let meta = {};
				for ( const f in item.custom_fields ) {
					let field = item.custom_fields[f];
					switch ( field.name ) {
						case "RID":
							meta.rid = field.display_value;
							break;
						case "Status":
							meta.status = field.display_value;
							break;
						default:
					}
				}
				tasks.push(meta);
			}

			// Return the formatted array of tasks
			return tasks;
		} catch (error) {
			console.error(error);
			els.message.innerHTML = "Something went wrong... inpect the page to view the dev console or wait and try again";
		}
	}

	/* 
	 * Get the tasks
	 */
	async function getTasks( projectID, httpHeaders ) {

		///console.log('getting tasks...');

		const options = {
			method: 'GET',
			headers: httpHeaders
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
				`https://app.asana.com/api/1.0/projects/${projectID}/tasks?opt_fields=custom_fields.name,custom_fields.display_value&completed_since=now&opt_pretty=true`,
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

	/*
	 * Custom comparison function to sort tasks by descending RID
	 */
	function compareRID( a, b ) {
		const x = Number( a.rid.split("-")[1] );
		const y = Number( b.rid.split("-")[1] );
		if ( x > y ){
			return -1;
		}
		if ( x < y ){
			return 1;
		}
		return 0;
	}
	  
	/*
	 * Display the results
	 */
	function displayResults( tasks, els ) {

		//console.log('formatting results...');

		//console.log('tasks', tasks);

		tasks.sort( compareRID );

		let results = document.createElement( 'ul' );
		results.classList = 'uri-asana-results type-mono';

		for ( let t in tasks ) {
			let task = tasks[t];
			let li = document.createElement( 'li' );

			// Simplify the statuses
			if ( true === uriAsanaStatus.simplify || "true" === uriAsanaStatus.simplify ) {
				switch ( task.status ) {
					case "Request":
						task.status = "Recieved";
						break;
					case "Scoping":
						task.status = "Evaluating";
						break;
					default:
						task.status = "In Progress";
				}
			}

			li.classList = `task ${task.status.toLowerCase().replace(' ','-')}`;

			let markup = `<div class="task-id">${task.rid}</div>`;
			markup += `<div class="task-status">${task.status}</div>`;

			li.innerHTML = markup;
			results.appendChild( li );
		}

		els.message.innerHTML = `There are <span>${tasks.length} tasks</span> in the queue:`;
		els.parent.appendChild( results );

	}

	window.addEventListener( 'load', init, false );


})();
