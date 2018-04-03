import React from 'react';
import Instant from './Instant.jsx';

export default class InstantsList extends React.Component {
	constructor (props) {
		super(props);

		this.props = props;
	}

	render () {
		const instants  = this.props.instants;

		if (!instants) {
			return ('');
		}

		const listItems = instants.map((instant) =>
			<Instant key={ 'instant' + instant.id } id={ instant.id } title={ instant.title } callback={ this.props.callback.bind(this) } />
		);

		return (
			<div className="instants">
				{ listItems }
			</div>
		);
	}
}
