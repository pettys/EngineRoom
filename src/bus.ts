/// <reference path="main.ts" />

// click comp-cell-click
interface IClickCompCellEvent {
	system: System;
	offset: Offset;
}

interface IShipSystemChangedEvent {
	ship: Ship;
	offset: Offset;
}

class Bus {

	// has a "click" channel, which has string-based messages that are
	// descriptions of the user action, as well as an optional param object.

	private handlers = {
		click: {}
	};

	public clickSubscribe(message: string, callback: Function) {
		return this.subscribe('click', message, <any>callback);
	}

	public subscribe<T>(channel: string, message: string, callback: (e:T)=>void);
	public subscribe(channel: string, message: string, callback: Function) {
		if(!this.handlers[channel]) this.handlers[channel] = {};
		if(!this.handlers[channel][message]) this.handlers[channel][message] = [];
		this.handlers[channel][message].push(callback);
	}

	public publish<T>(channel: string, message: string, arg: T);
	public publish(channel: string, message: string, arg?: any) {
		console.log('EVENT', channel, message, arg);
		var chan = this.handlers[channel];
		if(chan) {
			var msg = chan[message];
			if(msg) {
				msg.forEach(cb=>cb(arg));
			}
		}
	}

}
