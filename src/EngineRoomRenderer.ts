class EngineRoomRenderer {

	private static nextId = 0;
	private prefix = `er_${EngineRoomRenderer.nextId++}`;
	private cx = 24;
	private cy = 24;
	private panelHeight = this.cy/2;
	private systemHeight = this.panelHeight + this.cx*4;
	private selectedInventory: CompType = CompType.None;
	public room = new EngineRoom();

	constructor() {
		bus.clickSubscribe('begin-ship-creation', () => {
			this.room.beginShipCreation();
			this.render();
		});
		bus.clickSubscribe('comp-cell-click', (arg: IClickCompCellEvent) => {
			arg.system.setComp(this.selectedInventory, arg.offset);
		});
		bus.subscribe<IShipSystemChangedEvent>('ship', 'system-changed', (args) => {
			if(this.room.ship !== args.ship) return;
			this.updateSystem(args.offset);
		});
		this.buildInventoryMenu();
	}

	private buildInventoryMenu() {
		var menuContainer = document.getElementById("ship-menu");
		for(var i=1; i<=5; i++){
			var btn = document.createElement("button");
			btn.id = 'inv_btn_' + CompType[i];
			btn.className = 'inventory-toggle-button';
			var svg = this.createSvgElement(this.cx*1.5, this.cy*1.5);
			this.setSvgPath(svg, <CompType>i);
			btn.appendChild(svg);
			btn.appendChild(document.createTextNode(CompType[i]));
			btn.setAttribute('click-message', 'comp-tool-select');
			btn['comp-tool-select'] = { buttonId: btn.id, compType: i };
			menuContainer.appendChild(btn);
		}
		bus.clickSubscribe('comp-tool-select', arg => {
			var list = document.getElementById("ship-menu").getElementsByClassName('inventory-toggle-button');
			this.selectedInventory = arg.compType;
			for(var i=0; i<list.length; i++){
				if(arg.buttonId === list[i].id) {
					list[i].classList.add('toggle-active');
				} else {
					list[i].classList.remove('toggle-active');
				}
			}
		});
	}

	public render() {
		var root = document.getElementById('engine-room');
		root.style.width = `${this.cx * 12}px`;
		root.style.height = `${this.systemHeight * 3}px`;
		document.getElementById('ship-menu').style.left = `${this.cx * 13}px`;
		while(root.childNodes.length > 0) {
			root.removeChild(root.childNodes[root.childNodes.length-1]);
		}

		if(!this.room.ship) {
			root.appendChild(document.createTextNode("No ship selected."));
			return;
		}

		this.renderShip(this.room.ship, root);
	}

	private renderShip(ship: Ship, target: Element) {
		ship.extents.enum((o,i) => {
			var systemDiv = document.createElement("div");
			systemDiv.id = `${this.prefix} ${o}`;
			systemDiv.className = 'system';
			systemDiv.style.left = `${(o.x+1)*this.cx*4}px`;
			systemDiv.style.top = `${(o.y+1)*(this.cy*4 + this.panelHeight)}px`;
			systemDiv.style.width = `${this.cx*4}px`;
			systemDiv.style.height = `${this.cy*4 + this.panelHeight}px`;
			this.renderSystem(ship.getSystemAtOffset(o), systemDiv);
			target.appendChild(systemDiv);
		});
	}

	private getSystemDivRect(o: Offset): Rect {
		var top = (o.y+1)*(this.cy*4 + this.panelHeight);
		var left = (o.x+1)*this.cx*4;
		return new Rect(top, left, left + this.cx*4, top + this.cy*4 + this.panelHeight);
	}

	private updateSystem(offset: Offset) {
		var systemDiv = document.getElementById(`${this.prefix} ${offset}`);
		var system = this.room.ship.getSystemAtOffset(offset);

		if(system.isPowered)
			systemDiv.classList.add('powered');
		else
			systemDiv.classList.remove('powered');

		systemDiv.style.borderWidth = `${system.shieldLevel * 2}px`;
		if(system.shieldLevel > 0)
			systemDiv.classList.add('shielded');
		else
			systemDiv.classList.remove('shielded');

		system.extents.enum((o, i) => {
			var compDiv = <HTMLElement> systemDiv.childNodes[i];
			this.renderComp(system, o, compDiv);
		});
		var panelDiv = systemDiv.getElementsByClassName("system-panel")[0];
		this.renderSystemPanel(system, panelDiv);
	}

	private renderSystem(system: System, target: Element) {
		//var ox = this.cx*1.5, oy = this.cy*1.5;
		var ox = 0, oy = 0;

		if(system.isPowered)
			target.classList.add('powered');
		else
			target.classList.remove('powered');

		system.extents.enum((o, i) => {
			var compDiv = document.createElement("div");
			compDiv.id = `${this.prefix} ${system.offset} ${o}`;
			compDiv.className = `comp comp_${CompType[system.getComp(o)]}`;
			compDiv.setAttribute('click-message', 'comp-cell-click');
			compDiv['comp-cell-click'] = {system: system, offset: o};
			compDiv.style.left = `${ox + o.x * this.cx}px`;
			compDiv.style.top = `${oy + o.y * this.cy}px`;
			compDiv.style.width = `${this.cy}px`;
			compDiv.style.height = `${this.cy}px`;

			var svg = this.createSvgElement();
			compDiv.appendChild(svg);
			this.renderComp(system, o, compDiv);

			target.appendChild(compDiv);
		});

		var panelDiv = document.createElement("div");
		panelDiv.id = `${this.prefix} ${system.offset} panel`;
		panelDiv.className = 'system-panel';
		panelDiv.style.left = '0';
		panelDiv.style.right = '0';
		panelDiv.style.bottom = '0';
		panelDiv.style.height = `${this.panelHeight}px`;
		this.renderSystemPanel(system, panelDiv);
		target.appendChild(panelDiv);
	}

	private renderSystemPanel(system: System, panelDiv: Element) {
		var text = system.currentFunctionName || '';
		if(panelDiv.childNodes.length===0){
			panelDiv.appendChild(document.createTextNode(text));
		} else {
			(<Text>panelDiv.childNodes[0]).data = text;
		}
	}

	private createSvgElement(width?: number, height?: number) {
		var svg = document.createElementNS (svgns, "svg");
		svg.setAttributeNS (null, "viewBox", "0 0 1000 1000");
		svg.setAttributeNS (null, "width", ''+(width || this.cx));
		svg.setAttributeNS (null, "height", ''+(height || this.cy));

		var path = <SVGPathElement> document.createElementNS(svgns, "path");
		path.setAttributeNS(null, "fill-rule", "evenodd");
		svg.appendChild(path);
		return svg;
	}

	private setSvgPath(svg: Node, type: CompType) {
		var path = <SVGPathElement> svg.childNodes[0];
		path.setAttribute('d', Svg.Paths.forComp(type));
	}

	private setSvgColor(svg: Node, color: string) {
		(<SVGPathElement>svg.childNodes[0]).setAttributeNS(null, "fill", color);
	}

	private renderComp(system: System, compOffset: Offset, compDiv: HTMLElement) {
		var svg = compDiv.childNodes[0];
		var comp = system.getCompInfo(compOffset);
		compDiv.style.transform = comp.flip ? 'rotate(180deg)' : '';
		this.setSvgPath(svg, comp.type);
		this.setSvgColor(svg, comp.active ? system.isPowered ? '#ff0000' : '#770000' : '#040404');
	}

}
