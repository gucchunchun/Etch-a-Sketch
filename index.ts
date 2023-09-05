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
const defaultColor: Color = {
    [ColorOption.Red]:255,
    [ColorOption.Green]:255,
    [ColorOption.Blue]:255,
    [ColorOption.Alfa]: 1,
}
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
        private _color: Color = JSON.parse(JSON.stringify(defaultColor)),
        private _classList: string[] = []
    ) {}

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
        self.style.backgroundColor = `rgba(${this._color[ColorOption.Red]}, ${this._color[ColorOption.Green]},${this._color[ColorOption.Blue]},${this._color[ColorOption.Alfa]})`;
        self.addEventListener('mousedown', () =>{
            //some function to change color with specified color
        });
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
            this._color = updateFeature.color;
            box.style.backgroundColor = `rgba(${this._color[ColorOption.Red]}, ${this._color[ColorOption.Green]},${this._color[ColorOption.Blue]},${this._color[ColorOption.Alfa]})`;
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
}
enum BoxWidth {
    Small = 8,
    Medium = 16,
    Large= 24
}
class Sketch {
    private _boxes:Box[][] = [];
    constructor(
        private _self: HTMLElement,
        private _boxWidth: BoxWidth = BoxWidth.Medium
    ) {}

    initBoxes() {
        const sketchWidth = this._self.clientWidth;
        const sketchHeight = this._self.clientHeight;
        const row = Math.ceil(sketchWidth / this._boxWidth);
        const col = Math.ceil(sketchHeight / this._boxWidth);   
        this._self.style.gridTemplateColumns
            = `repeat(${row}, ${this._boxWidth}px)`;
        this._self.style.gridTemplateRows
            = `repeat(${col}, ${this._boxWidth}px)`;

        for (let i = 0; i < row ; i++) {
            this._boxes.push([]);
            for (let j = 0; j < col; j++) {
                const box = new Box(this._self, this._boxWidth, undefined, ['border']);
                box.add();
                this._boxes[i].push(box);
            }
        }  
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
    }

    updateAllBoxColor(newColor: Color) {
        for(let i = 0; i < this._boxes.length; i++) {
            for(let j = 0; j < this._boxes[i].length; j++){
                this._boxes[i][j].update({color:newColor});
            }
        }
    }

    updateBoxWidth(width:BoxWidth) {
        this._boxWidth = width;
        //add sa
        this.deleteAllBox();
        this.initBoxes();
    }

}

const sketchDiv = document.querySelector('#sketch') as HTMLElement;
if(!sketchDiv) {
    throw new Error('div for sketch is not found');
}
const sketch = new Sketch(sketchDiv);
sketch.initBoxes();
