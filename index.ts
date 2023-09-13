enum ColorOption {
    Red = 'red',
    Green = 'green',
    Blue = 'blue',
    Alfa = 'alfa'
}
type Color = {
    [ColorOption.Red]:number,
    [ColorOption.Green]:number,
    [ColorOption.Blue]:number,
    [ColorOption.Blue]:number,
    [ColorOption.Alfa]:number,
}
const defaultBgColor: Color = {
    [ColorOption.Red]:255,
    [ColorOption.Green]:255,
    [ColorOption.Blue]:255,
    [ColorOption.Alfa]: 1,
}
const defaultNextColor: Color = {
    [ColorOption.Red]:0,
    [ColorOption.Green]:0,
    [ColorOption.Blue]:0,
    [ColorOption.Alfa]: 1,
};
interface BoxFeature {
    sketch: HTMLElement,
    width: number,
    color: Color,
    classList:string[]
}

class Box {
    public self: (HTMLElement|undefined) = undefined;

    constructor(
        private _sketch: HTMLElement,
        private _width: number,
        public bgColor: Color = JSON.parse(JSON.stringify(defaultBgColor)),
        public nextColor: Color = JSON.parse(JSON.stringify(defaultNextColor)),
        private _classList: string[] = []
    ) {
        this.colored = this.colored.bind(this);
    }

    add(insertBeforeElement: (HTMLElement|undefined)=undefined): void {
        let self = document.createElement('div');
        //default className
        self.classList.add('sketch__box');
        //additional className for style changes
        for(const name of this._classList) {
            self.classList.add(name);
        }
        self.style.width = this._width + 'px';
        self.style.height = this._width + 'px';
        self.style.backgroundColor = `rgba(${this.bgColor[ColorOption.Red]}, ${this.bgColor[ColorOption.Green]},${this.bgColor[ColorOption.Blue]},${this.bgColor[ColorOption.Alfa]})`;
        if(insertBeforeElement) {
            this._sketch.insertBefore(self, insertBeforeElement);
        }else {
             this._sketch.appendChild(self);
        }
        this.self = self;
    }
    update(updateFeature:Partial<Omit<BoxFeature, 'sketch'>>) {
        let box = this.self
        if(!box) {
            throw new Error('Target box element can not be found')
        }
        if(updateFeature.width) {
            this._width = updateFeature.width;
            box.style.width = this._width + '%';
        }
        // color is more primary than getting random color with colorOptions
        if(updateFeature.color) {
            this.bgColor = updateFeature.color;
            box.style.backgroundColor = `rgba(${this.bgColor[ColorOption.Red]}, ${this.bgColor[ColorOption.Green]},${this.bgColor[ColorOption.Blue]},${this.bgColor[ColorOption.Alfa]})`;
        }   
        if(updateFeature.classList) {
            this._classList = updateFeature.classList;
            const boxClassList = box.classList;
    
            // Remove any class not present in the updated class list
            for (const name of boxClassList) {
                if (name !== 'sketch__box' && !this._classList.includes(name)) {
                    boxClassList.remove(name);
                }
            }
            
            // Add any new classes from the updated class list
            for (const newName of this._classList) {
                if (newName !== 'sketch__box' && !boxClassList.contains(newName)) {
                    boxClassList.add(newName);
                }
            }
        }
    }
    colored() {
        let box = this.self
        if(!box) {
            throw new Error('Target box element can not be found')
        }else {
            box.style.backgroundColor = `rgba(${this.nextColor[ColorOption.Red]}, ${this.nextColor[ColorOption.Green]},${this.nextColor[ColorOption.Blue]},${this.nextColor[ColorOption.Alfa]})`;
        }
    }
}
enum BoxWidth {
    Small = 8,
    Medium = 16,
    Large= 24
}
class Sketch {
    private _boxes:Box[][] = [];
    constructor(
        private _container: HTMLElement,
        private _self: HTMLElement,
        private _boxWidth: BoxWidth = BoxWidth.Medium,
        private _bgColor: Color = JSON.parse(JSON.stringify(defaultBgColor)),
        private _nextColor: Color = JSON.parse(JSON.stringify(defaultNextColor)),
    ) {
        this.sketchStart = this.sketchStart.bind(this);
        this.sketchStop = this.sketchStop.bind(this);
    }

    initBoxes() {
        const sketchWidth = this._container.clientWidth;
        const sketchHeight = this._container.clientHeight;
        const col = Math.ceil(sketchWidth / this._boxWidth);
        const row = Math.ceil(sketchHeight / this._boxWidth);   
        this._self.style.gridTemplateColumns
            = `repeat(${col}, ${this._boxWidth}px)`;
        this._self.style.gridTemplateRows
            = `repeat(${row}, ${this._boxWidth}px)`;

        for (let i = 0; i < row ; i++) {
            this._boxes.push([]);
            for (let j = 0; j < col; j++) {
                const box = new Box(this._self, this._boxWidth, this._bgColor, this._nextColor, ['border']);
                box.add();
                this._boxes[i].push(box);
            }
        }  
        this._self.addEventListener('mousedown', this.sketchStart);
    }

    deleteAllBox() {
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                const box = this._boxes[i][j].self;
                if(!box) {
                    throw new Error(`box position ${i-j} is not found`);
                }else {
                    this._self.removeChild(box);
                }
            }
        }
        this._boxes =[];
    }

    updateBoxColor(nextColor: Color=this._nextColor, percents: number=100, eraser: boolean=false) {
        const  row = this._boxes.length;
        let col = this._boxes[0].length;
        this._nextColor = nextColor;
        const color = eraser ? this._bgColor : nextColor;
        col = Math.round(col * percents / 100);
        for(let i = 0; i < row; i++) {
            for(let j = 0; j < col; j++){
                this._boxes[i][j].update({color: color});
            }
        }
    }

    updateBoxWidth(width:BoxWidth) {
        this._boxWidth = width;
        //add sa
        this.deleteAllBox();
        this.initBoxes();
    }

    sketchStart() {
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                let box = this._boxes[i][j];
                if(!box.self) {
                    throw new Error(`box position ${i-j} is not found`);
                }else {
                    box.self.addEventListener("mouseenter", box.colored);
                }
            }
        }
        this._self.addEventListener('mouseup', this.sketchStop);
    }

    sketchStop() {
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                let box = this._boxes[i][j];
                if(!box.self) {
                    box
                    throw new Error(`box position ${i-j} is not found`);
                }else {
                    box.self.removeEventListener("mouseenter", box.colored);
                }
            }
        }
        this._self.removeEventListener('mouseup', this.sketchStop);
    }

    changeBgColor(bgColor: Color) {
        this._bgColor = bgColor;
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                const box = this._boxes[i][j];
                box.nextColor = bgColor;
            }
        }
        this.updateBoxColor(this._bgColor);
    }

    changeNextColor(nextColor: Color) {
        this._nextColor = nextColor;
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                const box = this._boxes[i][j];
                box.nextColor = nextColor;
            }
        }
    }
}


const sketchDiv = document.querySelector('#sketch');
const sketchBoxCtr = document.querySelector('#box-ctr');
const eraser = document.querySelector('#eraser');
const penColor = document.querySelector('#color--pen');
const bgColor = document.querySelector('#color--bg');
const size = document.querySelector('#size');
const sizeSwitch = document.querySelector('#switch-size');
const sizeButtons = document.querySelectorAll('.switch__label');

//initialize sketch
const sketch = new Sketch((sketchDiv as HTMLElement),(sketchBoxCtr as HTMLElement));
sketch.initBoxes();

function boxReinitialize() {
    sketch.deleteAllBox();
    sketch.initBoxes();
}
window.addEventListener('resize', boxReinitialize);

eraser?.addEventListener('input', (e)=>{
    if(!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }else {
        const input = e.target as HTMLInputElement;
        const percents = parseInt(input.value);
        sketch.updateBoxColor(undefined, percents, true);
    }
})
eraser?.addEventListener('mouseup', (e)=>{
    if(!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }else {
        const input = e.target as HTMLInputElement;
        input.value="0";
    }
});

//need change
penColor?.addEventListener('input', (e)=>{
    if(!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }else {
        const input = e.target as HTMLInputElement;
        // value = #FFFFFF hex
        //find method
        const color:Color = {
            [ColorOption.Red]: parseInt(input.value.replace('#', '').slice(0,2), 16),
            [ColorOption.Green]: parseInt(input.value.replace('#', '').slice(2,4), 16),
            [ColorOption.Blue]: parseInt(input.value.replace('#', '').slice(4), 16),
            [ColorOption.Alfa]: 1,
        };
        console.log(color);
        sketch.changeNextColor(color);
    }
})
bgColor?.addEventListener('input', (e)=>{
    if(!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }else {
        const input = e.target as HTMLInputElement;
        // value = #FFFFFF hex
        //find method
        const color:Color = {
            [ColorOption.Red]: parseInt(input.value.replace('#', '').slice(0,2), 16),
            [ColorOption.Green]: parseInt(input.value.replace('#', '').slice(2,4), 16),
            [ColorOption.Blue]: parseInt(input.value.replace('#', '').slice(4), 16),
            [ColorOption.Alfa]: 1,
        };
        console.log(color);
        sketch.changeBgColor(color);
    }
})
function sizeChange(nextSize:string) {
    switch(nextSize) {
        case 's':
            sketch.updateBoxWidth(BoxWidth.Small);
            return
        case 'm':
            sketch.updateBoxWidth(BoxWidth.Medium);
            return
        case 'l':
            sketch.updateBoxWidth(BoxWidth.Large);
            return
    }
}
size?.addEventListener('change', (e)=>{
    if(!e.target) {
        throw new Error(`${e}'s target can not be found`);
    }else {
        const input = e.target as HTMLSelectElement;
        sizeChange(input.value);
    }
})
sizeButtons.forEach((button)=>{
    button.addEventListener('click',(e)=>{
        e.preventDefault();
        if(button.classList.contains('selected')){
            return
        }
        const preSelected = button.parentElement?.querySelector('.selected');
        if(!preSelected) {
            throw new Error('element with selected class not found');
        }
        preSelected.classList.remove('selected');
        button.classList.add('selected');
        const nextSize = button.id.replace('size--', '');
        if(!size) {
            throw new Error('element with size classset not found');
        }
        (size as HTMLSelectElement).value = nextSize;
        sizeChange(nextSize);
    });
});
