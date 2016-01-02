module Svg {

	export var Paths = {
		empty: "M0 0",
		comment: "M499.968 214.336q-113.832 0 -212.877 38.781t-157.356 104.625 -58.311 142.29q0 62.496 39.897 119.133t112.437 97.929l48.546 27.9 -15.066 53.568q-13.392 50.778 -39.06 95.976 84.816 -35.154 153.45 -95.418l23.994 -21.204 31.806 3.348q38.502 4.464 72.54 4.464 113.832 0 212.877 -38.781t157.356 -104.625 58.311 -142.29 -58.311 -142.29 -157.356 -104.625 -212.877 -38.781zm499.968 285.696q0 97.092 -66.96 179.397t-181.908 130.014 -251.1 47.709q-39.06 0 -80.91 -4.464 -110.484 97.65 -256.68 135.036 -27.342 7.812 -63.612 12.276h-2.79q-8.37 0 -15.066 -5.859t-8.928 -15.345v-.558q-1.674 -2.232 -.279 -6.696t1.116 -5.58 2.511 -5.301l3.348 -5.022t3.906 -4.743 4.464 -5.022q3.906 -4.464 17.298 -19.251t19.251 -21.204 17.298 -22.041 18.135 -28.458 15.066 -32.922 14.508 -42.408q-87.606 -49.662 -138.105 -122.76t-50.499 -156.798q0 -97.092 66.96 -179.397t181.908 -130.014 251.1 -47.709 251.1 47.709 181.908 130.014 66.96 179.397z",
		field: "m460,122c-12,-12 -33,-13 -47,0c-13,13 -13,34 0,47c182,182 181.753418,477.549927 0,659.336975c-6.489929,6.489807 -9.73114,14.983521 -9.73114,23.489502c0,8.498535 3.243713,16.992188 9.73114,23.482056c12.974915,12.977417 33.993713,12.977417 46.97113,0c207.671936,-207.67688 207.671936,-545.610657 0,-753.282593 "
		      +"M700,122c-12,-12 -33,-13 -47,0c-13,13 -13,34 0,47c182,182 181.753418,477.549927 0,659.336914c-6.489929,6.489868 -9.73114,14.983643 -9.73114,23.489624c0,8.498413 3.243713,16.992188 9.73114,23.481934c12.974915,12.977417 33.993713,12.977417 46.97113,0c207.671936,-207.676819 207.671936,-545.610596 0,-753.282532 "
			  +"M220,128c-12,-12 -33,-13 -47,0c-13,13 -13,34 0,47c182,182 181.753387,477.549957 0,659.336945c-6.489929,6.489868 -9.73114,14.983643 -9.73114,23.489624c0,8.498413 3.243713,16.992188 9.73114,23.481934c12.974915,12.977417 33.993713,12.977417 46.97113,0c207.671906,-207.67688 207.671906,-545.610626 0,-753.282562z",
		radiation: "M350,625 a 90,90 90 1,1 10,10 z " // lower-left ball
		 	  +"m-30 15 l-300 150 -10 -15 z m30 -15 " // lower-left ray 1
			  +"m-15 30 l-150 300 15 10 z m15 -30 " // lower-left ray 2
			  +"m-22 22 l-260 255 10 10 z " // lower-left ray 3
			  +"M650,375 a 90,90 90 1,1 -10,-10z " // upper-right ball
			  +"m30 -15 l300 -150 -10 -15 z m-30 15 "
			  +"m15 -30 l150 -300 15 10 z m-15 30 "
			  +"m22 -22 l260 -255 10 10 z",
		accelerator: "",
		plating: "",
		mass: "",

		forComp: (type: CompType) => {
			switch(type){
				case CompType.None: return Paths.empty;
				case CompType.Field: return Paths.field;
				case CompType.Radiation: return Paths.radiation;
				case CompType.Accelerator: return Paths.accelerator;
				case CompType.Plating: return Paths.plating;
				case CompType.Mass: return Paths.mass;
				default: return Paths.comment;
			}
		}
	}

	buildAcceleratorPath();
	buildPlatingPath();
	buildMassPath();

	function buildAcceleratorPath(){
		var w = 80; // width of arrow shaft
		var aw = 150; // width of arrow head
		var ah = 110; // height of arrow head
		var awd = aw-w/2; // width of arrow head beyond shaft
		var a1 = 100; // length of shortest arrow
		var a2 = 150;
		var a3 = 200; // length of longest arrow
		var gap = 75; // space between arrows

		var arrowPath = `l ${awd} 0 l ${-aw} ${-ah} l ${-aw} ${ah} l ${awd} 0`;

		Paths.accelerator =
			`M${500+w/2} 980 l0 ${-a1} ${arrowPath} l 0 ${a1}z`+
			`m0 ${-a1-ah-gap} l0 ${-a2} ${arrowPath} l 0 ${a2}z`+
			`m0 ${-a2-ah-gap} l0 ${-a3} ${arrowPath} l 0 ${a3}z`;

	}

	function buildPlatingPath() {
		var w = 800;
		var h = 180;
		var hgap = 40;
		var r = 60;
		var bar =
			`l${w} 0 l0 ${h} l${-w},0z`+
			`m${w/2-r},${h/2} a ${r} ${r}, 0, 1, 1, 0 1z`+
			`m${-w/4},0  a ${r} ${r}, 0, 1, 1, 0 1z`+
			`m${w/2},0  a ${r} ${r}, 0, 1, 1, 0 1z`;

		Paths.plating =
			`M${500-w/2} ${500-h/2} ${bar}`+
			`M${500-w/2} ${500-h-hgap-h/2} ${bar}`+
			`M${500-w/2} ${500+h+hgap-h/2} ${bar}`;
	}

	function buildMassPath() {
		var r = 450;
		Paths.mass = `M500,${500-r} a ${r} ${r}, 0, 1, 1, -1 0z`;
	}

}
