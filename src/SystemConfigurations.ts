
module SystemConfigurations {

	export enum Pattern {
		None,
		MainPowerCore,
		Cannon,
		Shield,
		Thruster
	}

	export function findPattern(sys: System) : Pattern {
		if(isMainPowerCore(sys)) return Pattern.MainPowerCore;
		if(isCannon(sys)) return Pattern.Cannon;
		if(isShield(sys)) return Pattern.Shield;
		if(isThruster(sys)) return Pattern.Thruster;
		return Pattern.None;
	}

	function isThruster(sys: System): boolean {
		var hasThrusterCore = false;
		sys.extents.trimBorder(0, 2, 0, 0).enum((o,i)=>{
			if(sys.getComp(o) === CompType.Field
				&& sys.getComp(o.delta(1,0)) === CompType.Mass
				&& sys.getComp(o.delta(2,0)) === CompType.Field)
				hasThrusterCore = true;
		});
		return hasThrusterCore;
	}

	function isShield(sys: System): boolean {
		var leftFieldPairs: Offset[] = [];
		sys.extents.trimBorder(1, 0).enum((o,i) => {
			if(sys.getComp(o) === CompType.Field && sys.getComp(o.delta(1,0)) === CompType.Field) {
				leftFieldPairs.push(o);
			}
		});
		return leftFieldPairs.length > 0;
	}

	function isCannon(sys: System): boolean {
		var centerMass: Offset = null;
		var multipleMassCenters = false;

		sys.extents.trimBorder(1, 0).enum((o,i)=> {
			if(sys.getComp(o) === CompType.Mass && sys.getComp(o.delta(0,-1)) === CompType.Accelerator) {
				multipleMassCenters = !!centerMass;
				centerMass = o;
			}
		});

		return centerMass && !multipleMassCenters;
	}

	function isMainPowerCore(sys: System): boolean {
		var possibleMiddles = sys.extents.trimBorder();
		var middle: Offset = null;
		possibleMiddles.enum((o,i) => {
			if(sys.getComp(o) === CompType.Field) {
				middle = o;
			}
		});
		if(!middle) {
			return false;
		}

		var possibleRads = Rect.around(middle);
		var radCount = 0;
		var invalidCount = 0;
		sys.extents.enum((o,i) => {
			if(o.equals(middle)) return;
			var comp = sys.getComp(o);
			switch(comp){
				case CompType.Radiation:
					if(possibleRads.contains(o)) {
						radCount++;
					} else {
						invalidCount++;
					}
					break;
				case CompType.Plating:
				case CompType.None: break;
				default: invalidCount++;
			}
		});

		return invalidCount === 0 && radCount > 0;
	}

}
