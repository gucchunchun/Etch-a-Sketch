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
        private _bgColor: Color = JSON.parse(JSON.stringify(defaultBgColor)),
        private _nextColor: Color = JSON.parse(JSON.stringify(defaultNextColor)),
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
        self.style.backgroundColor = `rgba(${this._bgColor[ColorOption.Red]}, ${this._bgColor[ColorOption.Green]},${this._bgColor[ColorOption.Blue]},${this._bgColor[ColorOption.Alfa]})`;
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
            this._bgColor = updateFeature.color;
            box.style.backgroundColor = `rgba(${this._bgColor[ColorOption.Red]}, ${this._bgColor[ColorOption.Green]},${this._bgColor[ColorOption.Blue]},${this._bgColor[ColorOption.Alfa]})`;
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
            box.style.backgroundColor = `rgba(${this._nextColor[ColorOption.Red]}, ${this._nextColor[ColorOption.Green]},${this._nextColor[ColorOption.Blue]},${this._nextColor[ColorOption.Alfa]})`;
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

    updateBoxColor(newColor: Color=this._nextColor, percents: number=100, eraser: boolean=false) {
        const  row = this._boxes.length;
        let col = this._boxes[0].length;
        const color = eraser ? this._bgColor : newColor;
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
}

const sketchDiv = document.querySelector('#sketch');
const sketchBoxCtr = document.querySelector('#box-ctr');
const eraser = document.querySelector('#eraser');

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