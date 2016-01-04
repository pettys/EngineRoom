
module SystemConfigurations {

	export interface CompAttr {
		// the component is arranged in a manner that it is actively doing something.
		active: boolean;
		// due to the way it's arranged, this component will look better if it's visually rotated 180 deg.
		flip: boolean;
	}

	export interface Pattern {
		name: string;
		compAttr: CompAttr[];
		// system locations (relative to this system) that this system can provide power to.
		providesPower?: Offset[];
		// system locations (relative to this system) that this system is shielding.
		providesShield?: { to: Offset, level: number }[];
	}

	export function nullPattern(sys: System): Pattern {
		var pat = {
			name: null,
			compAttr: []
		};
		for(var i=0, ln=sys.extents.placeCount; i<ln; i++){
			pat.compAttr.push({active: false, flip: false});
		}
		return pat;
	}

	export function findPattern(sys: System) : Pattern {
		var pattern = nullPattern(sys);
		return isMainPowerCore(sys, pattern)
		 || isCannon(sys, pattern)
		 || isShield(sys, pattern)
		 || isThruster(sys, pattern)
		 || pattern;
	}

	function isThruster(sys: System, pat: Pattern): Pattern {
		var hasThrusterCore = false;
		sys.extents.enum((o,i)=>{
			if(sys.getComp(o) === CompType.Field
				&& sys.getComp(o.delta(1,0)) === CompType.Mass
				&& sys.getComp(o.delta(2,0)) === CompType.Field) {
				hasThrusterCore = true;
				pat.compAttr[i].active = true;
				pat.compAttr[i+1].active = true;
				pat.compAttr[i+2].active = true;
				pat.compAttr[i+2].flip = true;
			}
		});
		return hasThrusterCore ? name(pat, 'Thruster') : null;
	}

	function name(pat: Pattern, name: string): Pattern {
		pat.name = name;
		return pat;
	}

	function isShield(sys: System, pat: Pattern): Pattern {
		var leftFieldPairs: Offset[] = [];
		sys.extents.enum((o,i) => {
			if(sys.getComp(o) !== CompType.Field || sys.getComp(o.delta(1,0)) !== CompType.Field) {
				return;
			}
			if(leftFieldPairs.some(prevOffset => prevOffset.delta(1,0).equals(o))) {
				return;
			}
			leftFieldPairs.push(o);
			pat.compAttr[i].active = true;
			pat.compAttr[i+1].active = true;
		});
		if(leftFieldPairs.length === 0) {
			return null;
		}

		name(pat, 'Shield');
		pat.providesShield = [];
		Rect.around(Offset.zero).enum((o,i) => {
			pat.providesShield.push({ to: o, level: 1 });
		});
		return pat;
	}

	function isCannon(sys: System, pat: Pattern): Pattern {
		var centerMass: Offset = null;
		var multipleMassCenters = false;

		sys.extents.enum((o,i)=> {
			if(sys.getComp(o) === CompType.Mass && sys.getComp(o.delta(0,-1)) === CompType.Accelerator) {
				multipleMassCenters = !!centerMass;
				centerMass = o;
			}
		});

		if(!centerMass || multipleMassCenters) return null;

		pat.name = 'Cannon';
		pat.compAttr[sys.extents.indexOf(centerMass)].active = true;
		pat.compAttr[sys.extents.indexOf(centerMass.delta(0,-1))].active = true;
		return pat;
	}

	function isMainPowerCore(sys: System, pat: Pattern): Pattern {
		var possibleMiddles = sys.extents.trimBorder();
		var middle: Offset = null;
		possibleMiddles.enum((o,i) => {
			if(sys.getComp(o) === CompType.Field) {
				middle = o;
			}
		});
		if(!middle) {
			return null;
		}

		var possibleRads = Rect.around(middle);
		var rads = <Offset[]> [];
		var invalidCount = 0;
		sys.extents.enum((o,i) => {
			if(o.equals(middle)) return;
			var comp = sys.getComp(o);
			switch(comp){
				case CompType.Radiation:
					if(possibleRads.contains(o)) {
						rads.push(o);
					} else {
						invalidCount++;
					}
					break;
				case CompType.Plating:
				case CompType.None: break;
				default: invalidCount++;
			}
		});

		if(invalidCount > 0 || rads.length === 0) return null;
		pat.name = 'Main Power Core';
		pat.providesPower = [];
		rads.push(middle);
		rads.forEach(o => {
			pat.compAttr[sys.extents.indexOf(o)].active = true;
			pat.providesPower.push(middle.deltaTo(o));
		});
		return pat;
	}

}
