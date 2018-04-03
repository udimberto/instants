import React from 'react';

import Instant from './Instant.jsx';
import InstantsList from './InstantsList.jsx';

import { instantsService, lsService } from '../services';

export default class App extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			term     : '',
			pinned   : [],
			found    : [],
			total    : 0,
			searching: false,
			notFound : false,
		};

		this.clearSearch  = this.clearSearch.bind(this);
		this.handleSearch = this.handleSearch.bind(this);
	}

	componentWillMount () {
		this.timer = null;
		this.getPinned();
	}

	getPinned () {
		if (!lsService.ls.length) {
			this.setState({
				pinned: [],
			});

			return;
		}

		let instantPinned    = null;
		const instantsPinned = [];

		for (let key in lsService.ls) {
			if (key.includes('pinned')) {
				instantPinned = key;
				instantPinned = instantPinned.replace('pinned', '');
				instantPinned = instantPinned.replace('instant', '');
				instantPinned = parseInt(instantPinned);

				instantsPinned.push({ id: instantPinned, title: '', togglePin: this.getPinned });
			}
		}

		this.setState({
			pinned: instantsPinned,
		});
	}

	clearSearch () {
		let searchInput = document.getElementById('searchInstant');

		this.setState({
			term     : '',
			searching: false,
			total    : 0,
			found    : [],
		});

		if (searchInput) {
			searchInput.value = '';
		}
	}

	handleSearch (e) {
		e.preventDefault();

		let searchInput = document.getElementById('searchInstant');

		if (!searchInput || this.state.searching) {
			return;
		}

		clearTimeout(this.timer);

		this.setState({
			term     : searchInput.value,
			searching: true,
			total    : 0,
			found    : [],
		});

		if (!searchInput.value) {
			this.setState({
				searching: false,
				notFound : false,
			});

			return;
		}

		this.timer = 
			setTimeout(() => {
				instantsService.search(this.state.term, 0)
					.then((response) => {
						this.setState({
							found    : response.data.items,
							total    : response.data.count,
							searching: false,
							notFound : !response.data.count ? true : false,
						});
					})
					.catch((error) => {
						console.error(error);
						this.setState({
							searching: false,
							notFound : true,
						});
					});
			}, 1500);
	}

	render () {
		const pinned = this.state.pinned.length && !this.state.term ? 
			(
				<section className="section">
					<div className="container fluid text-center">
						<h2>
							Favorites
						</h2>
						<InstantsList instants={ this.state.pinned } callback={ this.getPinned.bind(this) } />
					</div>
				</section>
			) : ('')
		;

		const found = this.state.searching || this.state.total || this.state.notFound ? 
			(
				<section className="section">
					<div className="container fluid text-center">
						<h2>
							{ this.state.searching ? 'Searching...' : (this.state.notFound ? 'No instants found :-(' : 'Found ' + this.state.total) }
						</h2>
						<InstantsList instants={ this.state.found } callback={ this.getPinned.bind(this) } />
					</div>
				</section>
			) : ('')
		;

		return (
			<div>
				<section className="section"
						 style={ { marginBottom: '40px' } }>
					<div className="container text-center">
						<form className="form"
							  noValidate="novalidate"
							  onSubmit={ this.handleSearch }>
							<h1>
								Instants Table
								<small>
									<div>
										fan adaptation of
									</div>
									<a href="https://www.myinstants.com"
									   target="_blank"
									   title="Visit 'My Instants' website">
									   	www.myinstants.com
									</a>
								</small>
							</h1>
							<div className="form__control-container"
								 style={ { marginBottom: '20px' } }>
								<input className="form__control"
									   type="search"
									   id="searchInstant"
									   name="searchInstant"
									   defaultValue={ this.state.term }
									   placeholder="Search somenthing" />
								{
									this.state.term ? 
									(
										<button className="form__control-container__btn"
												type="button"
												onClick={ this.clearSearch }>×</button>
									)
									:
									('')
								}
							</div>
							<small>
								<div>
									Provided by CleanVoice API
								</div>
								<a href="https://api.cleanvoice.ru/myinstants/"
								   target="_blank"
								   title="Visit 'CleanVoice My Instants' API documentation">
								   	api.cleanvoice.ru/myinstants
								</a>
							</small>
						</form>
					</div>
				</section>
				{ pinned }
				{ found }
			</div>
		);
	}
}
