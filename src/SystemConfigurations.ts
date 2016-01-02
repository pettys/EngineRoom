
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
	}

	export function nullPattern(sys: System): Pattern {
		var pat = {
			name: null,
			compAttr: []
		};
		for(var i=0, ln=sys.extents.height * sys.extents.width; i<ln; i++){
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
				pat.compAttr[i].flip = true;
				pat.compAttr[i+1].active = true;
				pat.compAttr[i+2].active = true;
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
			if(sys.getComp(o) === CompType.Field && sys.getComp(o.delta(1,0)) === CompType.Field) {
				leftFieldPairs.push(o);
				pat.compAttr[i].active = true;
				pat.compAttr[i+1].active = true;
			}
		});
		return leftFieldPairs.length > 0 ? name(pat, 'Shield') : null;
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
		rads.push(middle);
		rads.forEach(o => pat.compAttr[sys.extents.indexOf(o)].active = true);
		return pat;
	}

}
