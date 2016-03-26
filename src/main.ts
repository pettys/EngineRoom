var svgns = "http://www.w3.org/2000/svg";

enum CompType {
	None,
	Field,
	Radiation,
	Accelerator,
	Plating,
	Mass
}

var CompTypeFullName = ["None", "Field Inducer", "Radiation Core", "Particle Accelerator", "Hull Plating", "Mass Driver"];

class Ship {
	public name: string;
	public systems = <System[]>[];
	private _extents: Rect = new Rect(-1, -1, 1, 1);
	public get extents() { return this._extents; }
	constructor() {
		this.extents.enum((o, i) => {
			this.systems.push(new System(this, o));
		})
	}
	public getSystemAtOffset(offset: Offset): System {
		if(!this.extents.contains(offset)){
			throw `Offset ${offset} is not a system in this ship's extents ${this.extents}.`;
		}
		var sys = this.systems[this.extents.indexOf(offset)];
		if(!sys)
		console.log('odd', offset);
		return sys;
	}

	// When a system changes, it can cascade other system changes; this variable
	// tracks all changes so they can be de-duplicated and dispatched all at once.
	private queuedSystemChanges: { [key:string]: Offset } = null;
	// Called by a containing system when its contents have changed.
	public onSystemChanged(source: System) {
		var shouldPublish: boolean;
		if(this.queuedSystemChanges) {
			shouldPublish = false;
		} else {
			shouldPublish = true;
			this.queuedSystemChanges = {};
		}

		this.queuedSystemChanges[source.offset.toString()] = source.offset;
		this.recalculateSystemPower();
		this.recalculateSystemShields();
		if(shouldPublish) {
			for(var key in this.queuedSystemChanges) {
				bus.publish<IShipSystemChangedEvent>('ship', 'system-changed', { ship: this, offset: this.queuedSystemChanges[key] });
			}
			this.queuedSystemChanges = null;
		}
	}

	private recalculateSystemPower() {
		var len = this.extents.placeCount;
		var hasPower: boolean[] = [];
		for(var i=0; i<len; i++) hasPower[i] = false;
		this.extents.enum((o,i)=> {
			var sys = this.getSystemAtOffset(o);
			var poweredOffsets = sys.providesPower;
			if(poweredOffsets){
				poweredOffsets.forEach(po => {
					var target = o.add(po);
					if(this.extents.contains(target)) {
						hasPower[this.extents.indexOf(target)] = true;
					}
				})
			}
		});
		this.extents.enum((o,i)=> {
			this.getSystemAtOffset(o).isPowered = hasPower[i];
		});
	}

	private recalculateSystemShields() {
		var len = this.extents.placeCount;
		var shieldLevel: number[] = [];
		for(var i=0; i<len; i++) shieldLevel[i] = 0;
		this.extents.enum((o,i)=> {
			var sys = this.getSystemAtOffset(o);
			var shieldsProvided = sys.providesShield;
			if(shieldsProvided && sys.isPowered) {
				shieldsProvided.forEach(s => {
					var target = o.add(s.to);
					if(this.extents.contains(target)) {
						shieldLevel[this.extents.indexOf(target)] += s.level;
					}
				})
			}
		});
		this.extents.enum((o,i)=> {
			this.getSystemAtOffset(o).shieldLevel = shieldLevel[i];
		});
	}
}

class System {
	public offset: Offset;
	private _comps = <CompType[]>[];
	private activePattern: SystemConfigurations.Pattern;
	private _extents: Rect = new Rect(0,0,3,3);
	private _isPowered = false;
	private _shieldLevel = 0;
	public get extents() { return this._extents; }
	public get currentFunctionName() { return this.activePattern.name; }
	public get providesPower() { return this.activePattern.providesPower; }
	public get providesShield() { return this.activePattern.providesShield; }
	public get isPowered() { return this._isPowered; }
	public set isPowered(value: boolean) {
		if(value != this._isPowered) {
			this._isPowered = value;
			this.owner.onSystemChanged(this);
		}
	}
	public get shieldLevel() { return this._shieldLevel; }
	public set shieldLevel(value: number) {
		if(value != this._shieldLevel) {
			this._shieldLevel = value;
			this.owner.onSystemChanged(this);
		}
	}

	constructor(private owner: Ship, offset: Offset){
		this.offset = offset;
		this.extents.enum(()=>this._comps.push(CompType.None));
		this.activePattern = SystemConfigurations.nullPattern(this);
	}
	public setComp(type: CompType, place: Offset) {
		this._comps[this.extents.indexOf(place)] = type;
		this.activePattern = SystemConfigurations.findPattern(this);
		this.owner.onSystemChanged(this);
	}
	public getCompInfo(place: Offset): { type: CompType, active?: boolean, flip?: boolean} {
		if(!this.extents.contains(place)) return { type: CompType.None };
		var idx = this.extents.indexOf(place);
		var attr = this.activePattern.compAttr[idx];
		return {
		 	type: this._comps[idx],
			active: attr.active,
			flip: attr.flip
		};
	}
	public getComp(place: Offset): CompType {
		return this.getCompInfo(place).type;
	}
	public toString() {
		return this._extents.toString();
	}
}

class EngineRoom {

	private myShips = <Ship[]>[];
	public ship: Ship = null;
	public currentComp = CompType.Field;
	public beginShipCreation() {
		this.myShips.push(this.ship = new Ship());
	}
}

var bus: Bus;

document.addEventListener("DOMContentLoaded", e => {
	bus = new Bus();
	var renderer = new EngineRoomRenderer();
	renderer.render();
	document.body.addEventListener("click", e => {
		var el = <Element>e.target;
		while(el.tagName==='path' || el.tagName==='svg') el=el.parentElement;
		var msg = el.getAttribute('click-message');
		if(msg) {
			bus.publish('click', msg, el[msg]);
		}
	});
});
