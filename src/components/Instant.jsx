import React from 'react';
import axios from 'axios';
import Mousetrap from 'mousetrap';

import { instantsService, lsService } from '../services';

class Instant extends React.Component {
	constructor (props) {
		super(props);

		this.props = props;
		this.state = {
			id      : this.props.id,
			title   : this.props.title || '',
			src     : instantsService.getUrlById(this.props.id),
			progress: 0,
			duration: 0,
			loop    : lsService.get('instant' + this.props.id + 'loop') || false,
			volume  : lsService.get('instant' + this.props.id + 'volume') || 1,
			disabled: true,
			pinned  : lsService.get('instant' + this.props.id + 'pinned') || false,
			status  : 'stopped',
			bindKey : lsService.get('instant' + this.props.id + 'shortcut') || '',
		};

		this.stop           = this.stop.bind(this);
		this.handlePin      = this.handlePin.bind(this);
		this.handleVolume   = this.handleVolume.bind(this);
		this.handleClick    = this.handleClick.bind(this);
		this.handleShortcut = this.handleShortcut.bind(this);
		this.handleLoop     = this.handleLoop.bind(this);
	}

	audioElement () {
		return document.getElementById('instant' + this.state.id);
	}

	setAudio (audioElement) {
		if (!audioElement) {
			return;
		}

		if (audioElement.readyState !== 4) {
			setTimeout(() => {
				this.setAudio(audioElement);
			}, 250);
			return;
		}

		audioElement.ontimeupdate = () => {
			this.setState({
				progress: (((audioElement.currentTime / audioElement.duration) * 100) / 100)
			});
		};

		audioElement.onended = () => {
			this.setState({
				progress: 0,
			});
		};

		audioElement.volume = this.state.volume;

		this.setState({
			disabled: false,
			duration: (Math.round(audioElement.duration * 100) / 100),
		});
	}

	componentWillMount () {
		// Global Stop
		Mousetrap.bind('ctrl+shift+0', this.stop);

		if (this.state.bindKey) {
			Mousetrap.bind('ctrl+shift+' + this.state.bindKey, this.handleClick);
		}

		if (this.state.title) {
			return;
		}

		instantsService.getInfoById(this.state.id)
			.then((response) => {
				this.setState({
					title: response.data.title,
				});
			});
	}

	componentDidMount () {
		let audioElement = this.audioElement();
		audioElement.load();

		this.setAudio(audioElement);
	}

	stop () {
		let audioElement = this.audioElement();

		if (!audioElement) {
			return;
		}

		audioElement.pause();
		audioElement.currentTime = 0;

		this.setState({
			status: 'stopped',
		});
	}

	handleLoop () {
		let audioElement = this.audioElement();
		const loopId     = 'instant' + this.state.id + 'loop';

		this.setState({
			loop: !this.state.loop,
		});

		if (this.state.loop) {
			audioElement.loop = false;
			lsService.remove(loopId);
			return;
		}

		audioElement.loop = true;

		lsService.set(loopId, true);
	}

	handleShortcut (evt) {
		const bindKey   = evt.target.value;
		const bindKeyId = 'instant' + this.state.id + 'shortcut';

		if (!bindKey) {
			lsService.remove(bindKeyId);
			Mousetrap.unbind('ctrl+shift+' + this.state.bindKey);

		} else {
			lsService.set(bindKeyId, bindKey);
			Mousetrap.bind('ctrl+shift+' + bindKey, this.handleClick);
		}

		this.setState({
			bindKey: bindKey,
		});
	}

	handlePin () {
		let pinned      = false;
		const pinId     = 'instant' + this.state.id + 'pinned';
		const volumeId  = 'instant' + this.state.id + 'volume';
		const bindKeyId = 'instant' + this.state.id + 'shortcut';
		const loopId    = 'instant' + this.state.id + 'loop';

		if (lsService.get(pinId)) {
			lsService.remove(pinId);
			lsService.remove(volumeId);
			lsService.remove(bindKeyId);
			lsService.remove(loopId);

		} else {
			pinned = true;
			lsService.set(pinId, true);
		}

		this.setState({
			pinned: pinned,
		});

		this.props.callback();
	}

	handleVolume () {
		const volumeId    = 'instant' + this.state.id + 'volume';
		let audioElement  = this.audioElement();
		let volumeElement = document.getElementById(volumeId);

		if (!audioElement || !volumeElement) {
			return;
		}

		audioElement.volume = (Math.round(volumeElement.value * 100) / 100);

		if (audioElement.volume === 1) {
			lsService.remove(volumeId);

		} else {
			lsService.set(volumeId, audioElement.volume);
		}

		this.setState({
			volume: audioElement.volume,
		});
	}

	handleClick () {
		let audioElement = this.audioElement();

		if (!audioElement) {
			return;
		}

		if (this.state.status === 'playing') {
			audioElement.currentTime = 0;
		}

		this.setState({
			status: 'playing',
		});

		audioElement.play();

		setTimeout(() => {
			if (audioElement.ended) {
				this.setState({
					status: 'stopped',
				});
			}
		}, parseInt((this.state.duration * 1000) + 250));
	}

	render () {
		return (
			<div className="instant">
				<input className="instant__vol"
					   type="range"
					   orient="vertical"
					   min="0"
					   max="1"
					   step="0.1"
					   title="Volume"
					   id={ 'instant' + this.state.id + 'volume' }
					   name={ 'instant' + this.state.id + 'volume' }
					   disabled={ this.state.disabled }
					   defaultValue={ this.state.volume }
					   onChange={ this.handleVolume } />
				<button className={ 'instant__btn ' + this.state.status }
						type="button"
						title="Play"
						id={ 'instant' + this.state.id + 'buttonPlay' }
						name={ 'instant' + this.state.id + 'buttonPlay' }
						disabled={ this.state.disabled }
						onClick={ this.handleClick }>
					<div className="instant__btn__status">
						{ this.state.status === 'stopped' ? 'Play ' : 'Replay ' }
						▶
					</div>
					<div className="instant__btn__title">
						{ this.state.title }
					</div>
					<div className="instant__btn__duration">
						{ this.state.duration } seconds
					</div>
					<audio id={ 'instant' + this.state.id }>
						<source src={ this.state.src } type="audio/mpeg" />
					</audio>
					<progress className="instant__progress"
							  id={ 'instant' + this.state.id + 'progress' }
							  value={ this.state.progress }
							  max="1">
					</progress>
				</button>
				<div className="instant__actions">
					<button className="instant__actions__btn"
							type="button"
							title={
								this.state.pinned ?
									'Remove from your Favorites Instants' :
									'Save to your Favorites Instants'
							}
							id={ 'instant' + this.state.id + 'buttonPin' }
							name={ 'instant' + this.state.id + 'buttonPin' }
							disabled={ this.state.disabled }
							onClick={ this.handlePin }>
						{ this.state.pinned ? '★' : '☆' }
					</button>
					<button className="instant__actions__btn"
							type="button"
							title="Stop"
							id={ 'instant' + this.state.id + 'buttonStop' }
							name={ 'instant' + this.state.id + 'buttonStop' }
							disabled={ this.state.disabled || this.state.status !== 'playing' }
							onClick={ this.stop }>
						◼
					</button>
					<button className={ 'instant__actions__btn' + (this.state.loop ? ' active' : '') }
							type="button"
							title="Loop"
							id={ 'instant' + this.state.id + 'buttonloop' }
							name={ 'instant' + this.state.id + 'buttonLoop' }
							disabled={ this.state.disabled }
							onClick={ this.handleLoop }>
						↻
					</button>
				</div>
				<div className="instant__shortcut">
					{	this.state.pinned ? (
							<div>
								<label className="instant__shortcut__label"
									   htmlFor={ 'instant' + this.state.id + 'shortcut' } >
									CTRL + Shift +
								</label>
								<input className="instant__shortcut__input"
									   type="text"
									   minLength="0"
									   maxLength="1"
									   id={ 'instant' + this.state.id + 'shortcut' }
									   name={ 'instant' + this.state.id + 'shortcut' }
									   defaultValue={ this.state.bindKey }
									   onChange={ this.handleShortcut } />
							</div>
						) : ('')
					}
				</div>
			</div>
		);
	}
}

Instant.defaultProps = {
	id      : 0,
	title   : 'Instant',
	src     : '',
	duration: 0,
	volume  : 1,
	disabled: true,
	pinned  : false,
	status  : 'stopped',
	bindKey : '',
};

export default Instant;
