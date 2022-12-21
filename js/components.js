class EmptyMessage extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
	    <style>
	        div{
	            display:flex;
	            flex-direction:column;
	            justify-content:center;
	            align-items:center;
	        }
	        span{
	            margin-top:200px;
	            background-image:linear-gradient(green, blue);
	            -webkit-background-clip:text;
	            -webkit-text-fill-color:transparent;
	            font-size:50px;
	        }
	        p{
	            margin:10px auto;
	            color:#303030;
	            font-size:17px;
	        }
	    </style>
	        <div>
	         <span class="material-symbols-rounded">
	    	category
	    	</span>
	         <p>No items yet!</p>
	        </div>`;
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
	}
	connectedCallback() {
		this.shadowRoot.querySelector('span').innerText = this.getAttribute('icon');
		this.shadowRoot.querySelector('p').innerText = this.getAttribute('message');
	}
}

class GridMenu extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
	    <style>
	    div {
            display:grid;
		    gap:30px;
		    grid-template-columns:45% 45%;
		    padding:45px;
		    justify-content:space-around;
         }
         </style>
         <div>
         <slot name="block"></slot>
         </div>`;
         this.attachShadow({mode:'open'});
		 this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
}
class MenuBlock extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
	    <style>
		div {
		    text-align:center;
		    border:2px solid gray;
		    padding:8px;
		    border-radius:5px;
		    color:#303030;
		    font-size:14px;
		}
		span {
		    display:block;
		    margin:7px;
		    color:#303030;
		}
		</style>
            <div data-link="">
            <span class="material-symbols-rounded"></span>
            <span class="title"></span>
            </div>`;
            this.attachShadow({mode:'open'});
		    this.shadowRoot.appendChild(template.content.cloneNode(true));
	}
	connectedCallback() {
		this.shadowRoot.querySelector('.material-symbols-rounded').textContent = this.getAttribute('icon');
		this.shadowRoot.querySelector('.title').textContent = this.getAttribute('title');
	}
}
class AddButton extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
	    <style>
	    div {
		    --padding:10px;
		    background-color:darkorange;
		    color:white;
		    margin:auto;
		    width:30%;
		    padding:var(--padding);
		    border-radius:50px;
		    text-align:center;
		    position:fixed;
		    bottom:25px;
		    left:50%;
		    transform:translateX(-50%);
		}
		</style>
		<div>Add</div>`;
		this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
    	this.shadowRoot.querySelector('div').textContent = this.hasAttribute('text') ? this.getAttribute('text') : 'Add';
        if (this.hasAttribute('padding')) {
        	this.shadowRoot.querySelector('div').style.setProperty('--padding', this.getAttribute('padding'));
        }
    }
} 
class AddData extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
	    <style>
	    input{
		   display:block;
		    border-radius:5px;
		    border:1.5px solid gray;
		    padding:15px;
		    color:#303030;
		    font-size:15px;
		    box-sizing:border-box;
		    width:70%;
		    margin:auto;
		}
		input:invalid{
			outline:red;
		}
		label{
		    display:block;
		    width:70%;
		    margin:20px auto;
		}
		p{
			display:block;
		    width:70%;
		    margin:10px auto;
		    color:red;
        }
        </style>
        <label for="input">Text</label>
        <p class=".error"></p>
        <input type="text" id="input" placeholder="text" maxlength="25">`;
        this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const errorPara = this.shadowRoot.querySelector('p');
        const input = this.shadowRoot.querySelector('input');
        this.shadowRoot.querySelector('label').innerText = this.hasAttribute('data-label') ? this.getAttribute('data-label') : 'Label';
    	input.type = this.hasAttribute('type') ? this.getAttribute('type') : 'text';
        input.placeholder = this.hasAttribute('data-placeholder') ? this.getAttribute('data-placeholder') : '';
        if (this.hasAttribute('data-pattern')) {
        	input.setAttribute('pattern', this.getAttribute('data-pattern'));
        }
        input.addEventListener('keyup', function() {
            errorPara.innerText = this.validationMessage;
        });
    }
    get value() {
    	 return this.shadowRoot.querySelector('input').value;
    }
    set value(x) {
    	this.shadowRoot.querySelector('input').value = x;
    }
    set required(x) {
    	if (x === true) {
    	this.shadowRoot.querySelector('input').required = true;
        }
    }
    get validity() {
    	return this.shadowRoot.querySelector('input').checkValidity();
    }
}
class AddNumber extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
	    <style>
	    input{
		   display:block;
		    border-radius:5px;
		    border:1.5px solid gray;
		    padding:15px;
		    color:#303030;
		    font-size:15px;
		    box-sizing:border-box;
		    width:70%;
		    margin:auto;
		}
		input:invalid{
			outline:red;
		}
		label{
		    display:block;
		    width:70%;
		    margin:20px auto;
		}
		p{
			display:block;
		    width:70%;
		    margin:10px auto;
		    color:red;
        }
        </style>
        <label for="input">Text</label>
        <p></p>
        <input type="number" id="input" placeholder="text" step = "1" required>`;
        this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
        const errorPara = this.shadowRoot.querySelector('p');
        const input = this.shadowRoot.querySelector('input');
        this.shadowRoot.querySelector('label').innerText = this.hasAttribute('data-label') ? this.getAttribute('data-label') : 'Label';
        input.placeholder = this.hasAttribute('placeholder') ? this.getAttribute('placeholder') : '';
        input.step = this.hasAttribute('step') ? this.getAttribute('step') : '1';
        input.addEventListener('keyup', function() {
            errorPara.innerText = this.validationMessage;
        })
    }
    static get observedAttributes() {
    	return ['data-label'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
    	this.shadowRoot.querySelector('label').innerText = this.hasAttribute('data-label') ? this.getAttribute('data-label') : 'Label';
    }
    get value() {
    	 return this.shadowRoot.querySelector('input').value;
    }
    set value(x) {
    	this.shadowRoot.querySelector('input').value = x;
    }
    validity() {
    	return this.shadowRoot.querySelector('input').checkValidity();
    }
}
class SubmitData extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
	    <style>
	    button {
		    display:block;
		    margin:30px auto;
		    background-color:darkorange;
		    padding:15px;
		    border:none;
		    border-radius:5px;
		    width:70%;
		    color:white;
		    box-sizing:border-box;
         }
         </style>
         <button>Submit</button>`;
         this.attachShadow({mode:'open'});
		 this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
    	const button = this.shadowRoot.querySelector('button');
        button.innerText = this.hasAttribute('data-label') ? this.getAttribute('data-label') : 'Submit';
        button.style.backgroundColor = this.hasAttribute('data-color') ? this.getAttribute('data-color') : 'darkorange';
    }
    static get observedAttributes() {
    	return ['data-label'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
    	this.shadowRoot.querySelector('button').innerText = this.hasAttribute('data-label') ? this.getAttribute('data-label') : 'Label';
    }
}
class CategoryBlock extends HTMLElement {
    constructor() {
        super();
		const template = document.createElement('template');
		template.innerHTML = `
		<style>
		    div{
			    margin:20px auto;
			    padding:20px;
			    width:80%;
			    border-radius:5px;
			    background-color:#ffffff;
			    color:#303030;
			    box-shadow:0 1px 10px lightgray;
			}
		</style>
		<div></div>
		`;
        this.attachShadow({mode:'open'});
		this.shadowRoot.appendChild(template.content.cloneNode(true));
    }
    connectedCallback() {
    	this.shadowRoot.querySelector('div').textContent = this.getAttribute('data-name');
    }
}
class AddProperty extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<style>
		    div{
			    color:#f8f8f8;
			    font-size:15px;
                margin:25px auto;
			    border-radius:5px;
			    padding:15px 20px;
			    background-color:#303030;
			    width:70%;
			    box-sizing:border-box;
			    text-align:center;
			}
		</style>
		<div>Custom property +</div>
        `;
        this.attachShadow({mode:'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
	}
}
class CustomSelect extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
		<style>
		    .title{
		        width:70%;
		        margin:20px auto;
		        width:100%;
			}
		    .custom{
			   position:relative;
			   color:#303030;
		       width:70%;
			   box-sizing:border-box;
			   margin:auto;
			}
		    .selected-option{
			    border-radius:5px;
			    border:1.5px solid gray;
			    padding:13px;
			    color:#303030;
			    font-size:15px;
			    box-sizing:border-box;
			    width:100%;
			    margin: 25px auto;
			    background-color:white;
			    display:flex;
			    justify-content:space-between;
			}
			select{
				display:none;
			}
			.drop-down{
				display:none;
				position:absolute;
				background-color:#ffffff;
				font-size:15px;
				border:1px solid lightgray;
				color:#303030;
				top:30px;
				right:0;
				width:60%;
			}
			.drop-down > div{
				width:100%;
				text-align:left;
				padding:15px;
				box-sizing:border-box;
			}
			.drop-down > div:not(:last-child){
				border-bottom:1px solid lightgray;
			}
        </style>
        <div class="custom">
        <select>
        </select>
        <div class="title">label</div>
        <div class="selected-option">
        <span class="selected"></span>
        <span class="material-symbols-rounded">
	    	arrow_drop_down
	    	</span>
	    </div>
	    <div class="drop-down">
	    </div>
        </div>
        `;
        this.attachShadow({mode:'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
	}
	connectedCallback() {
		const div = this.shadowRoot.querySelector('.selected-option');
		const selected = this.shadowRoot.querySelector('.selected');
		const select = this.shadowRoot.querySelector('select');
		const dropDown = this.shadowRoot.querySelector('.drop-down');
		selected.innerText = select.value;
		const showSelect = (e) =>{
			div.removeEventListener('click', showSelect);
			const options = select.options;
			for (let option of options){
			    const newDiv = document.createElement('div');
			    newDiv.innerText = option.text;
			    newDiv.addEventListener('click', function() {
				    for (let i=0; i<options.length;i++) {
					    if (this.innerText === options[i].text){
						    select.selectedIndex = i;
						    selected.innerText = select.value;
						}
					}
                 });
			    dropDown.appendChild(newDiv);
			}
			dropDown.style.display = 'block';
			const closeSelect = () =>{
				div.addEventListener('click', showSelect);
				while (dropDown.hasChildNodes()) {
					dropDown.removeChild(dropDown.firstChild);
					dropDown.style.display = 'none';
				}
			}
			e.stopPropagation();
			document.addEventListener('click', closeSelect);
		}
		div.addEventListener('click', showSelect);
		this.shadowRoot.querySelector('.title').innerText = this.hasAttribute('data-label')? this.getAttribute('data-label') : 'Label';
	}
	addOptions(...options) {
		const select = this.shadowRoot.querySelector('select');
	        options.forEach(e =>{
				const option = document.createElement('option');
				option.text = e;
				select.add(option);
			});
	}
	get value() {
    	 return this.shadowRoot.querySelector('select').value;
    }
    inputChange(func) {
    	const mainDiv = this.shadowRoot.querySelector('.drop-down');
    	const divs = mainDiv.querySelectorAll('div');
        mainDiv.addEventListener('click', func);
    }
}
class ItemBlock extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<style>
		.item{
			margin:20px auto;
			padding:20px;
			width:80%;
			border-radius:5px;
			background-color:#ffffff;
			color:#303030;
			font-size:14px;
			box-shadow:0 1px 10px lightgray;
		}
		span{
			display:inline-block;
			color:darkred;
			padding:5px 10px;
			border:1px solid gray;
			border-radius:50px;
			font-size:14px;
			box-sizing:border-box;
			margin:3px 3px 3px 0;
		}
		.category{
			border-color:#001253;
			color:#001253;
		}
		.tagline{
		    color:gray;
		    font-size:14px;
		    margin:10px 0;
		}
		</style>
		<div class="item">
       <p><p>
       <div class="price tagline"></div>
       <div class="stock tagline"></div>
       <br/>
       <span class="category"></span>
       </div>`;
       this.attachShadow({mode:'open'});
       this.shadowRoot.append(template.content.cloneNode(true));
	}
	connectedCallback() {
		const title = this.shadowRoot.querySelector('p');
		const  price = this.shadowRoot.querySelector('.price');
		const stock = this.shadowRoot.querySelector('.stock');
		const properties = this.shadowRoot.querySelectorAll('span');
		title.innerText = this.hasAttribute('data-item-name') ? this.getAttribute('data-item-name') : 'Item';
		price.innerText = this.hasAttribute('data-price') ? this.getAttribute('data-price') != '' ? `₹${this.getAttribute('data-price')}` : 'Not specified' : '- : -';
		stock.innerText = this.hasAttribute('data-stock') ? this.getAttribute('data-stock') != '' ? this.getAttribute('data-stock') == 1 ? '1 item left' : `${this.getAttribute('data-stock')} Items left` : 'Not specified'  : '- : -';
		if (this.hasAttribute('data-category-name')) {
			this.shadowRoot.querySelector('.category').innerText = this.getAttribute('data-category-name');
        }else {
        	this.shadowRoot.querySelector('.category').style.display = 'none';
        }
	}
	showProperties(...properties) {
		const parent = this.shadowRoot.querySelector('.item');
		properties.forEach(p =>{
			const span = document.createElement('span');
			span.innerText = `${p.name} : ${p.value}`;
			if (p.value) {
			    parent.appendChild(span);
			}
        });
	}
}
class CategoryView extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
		<style>
		div{
			display:flex;
			justify-content:space-between;
			align-items:center;
			width:80%;
			padding:0 10px 0 0;
			margin:auto;
			border-bottom:1.5px solid lightgray;
		}
		p{
			color:#303030;
			font-size:18px;
			font-weight:bold;
		}
		span{
			color:orange;
		}
       .material-symbols-outlined {
            font-variation-settings:
		    'FILL' 0,
		    'wght' 400,
		    'GRAD' 0,
		    'opsz' 48
       }
		</style>
		<div>
		<p></p>
		<span class="material-symbols-rounded">
info
</span>
		</div>
		`;
		this.attachShadow({mode:'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
    }
    connectedCallback() {
    	const p = this.shadowRoot.querySelector('p');
        p.innerText = this.hasAttribute('data-name') ? this.getAttribute('data-name') : 'Not found';
    }
}
class CustomProperty extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
		<style>
		.prop{
		    margin:20px auto;
		    width:70%;
		    color:gray;
		    font-size:14px;
		    font-family:Arial;
		    border-radius:5px;
		    box-shadow:0 1px 10px lightgray;
		    padding:10px;
		    display:flex;
		    align-items:center;
		    justify-content:space-around;
		    box-sizing:border-box;
        }
		span{
		    color:darkred;
		}
		</style>
		<div class="prop">
            <div>
            <div class='name'>Custom property : Color</div>
            <div><i></i></div>
            </div>
            <span class="material-symbols-rounded">
cancel
</span>
        </div>`;
        this.attachShadow({mode:'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
	}
	connectedCallback() {
		const name = this.shadowRoot.querySelector('.name');
		const dataType = this.shadowRoot.querySelector('i');
		name.innerText = this.hasAttribute('data-name') ? `Custom property : ${this.getAttribute('data-name')}` : '';
		dataType.innerText = this.hasAttribute('data-type') ? `Data type : ${this.getAttribute('data-type')}` : '';
	}
	giveFunc(x) {
		this.shadowRoot.querySelector('span').addEventListener('click', x.bind(this));
	}
}
//info-box
class InfoBox extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <style>
        .container{
		    margin:auto;
		    position:relative;
		    width:85%;
		    border-radius:12px;
		    box-shadow:0 1px 10px lightgray;
		    padding:20px;
		    font-size:15px;
		    color:#303030;
		    height:200px;
		}
		.edit{
			position:absolute;
		    display:flex;
		    align-items:center;
		    justify-content:center;
		    background-color:darkorange;
		    color:white;
		    border-radius:50%;
		    width:42px;
		    height:42px;
		    left:50%;
		    bottom:-19px;
		    transform:translate(-50%, 0);
		}
        </style>
        <div class="container">
            <div class="name"></div>
            <div class="stock"></div>
            <div class="outofstock">
            </div>
            <div class="edit">
            <span class="material-symbols-rounded">
edit
</span>
        </div>
        </div>`;
        this.attachShadow({mode:'open'});
        this.shadowRoot.append(template.content.cloneNode(true));
	}
	connectedCallback() {
		const catName = this.shadowRoot.querySelector('.name');
		const stock = this.shadowRoot.querySelector('.stock');
		const outOfStock = this.shadowRoot.querySelector('.outofstock');
		catName.innerText = this.hasAttribute('data-name') ? `Category : ${this.getAttribute('data-name')}` : '';
		stock.innerText = this.hasAttribute('data-stock-number') ? `Stock : ${this.getAttribute('data-stock-number')}` : '';
		outOfStock.innerText = this.hasAttribute('data-outofstock') ? `Out of stock : ${this.getAttribute('data-outofstock')}` : '';
	}
	set editable(x) {
		if (x === false) {
			this.shadowRoot.querySelector('.edit').style.display = 'none';
		}
	}
}
//itemView
class ItemView extends HTMLElement {
	constructor() {
		super();
		const template = document.createElement('template');
		template.innerHTML = `
		<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
		<style>
		.container{
		    margin:auto;
            position:relative;
            width:85%;
            border-radius:12px;
            box-shadow:0 1px 10px lightgray;
            padding:20px;
            font-size:15px;
            color:#303030;
            height:200px;
		}
		.edit{
			float:right;
			color:darkorange;
		}
		.item-name{
		    font-weight:bold;
		    clear:both;
		}
		.button-section{
		    display:flex;
		    align-items:center;
		    justify-content:center;
		}
		button{
		    border:none;
		    background-color:darkorange;
		    padding:15px;
		    color:white;
		    border-radius:5px;
		    margin:10px;
		}
		</style>
		<div class="container">
		<div class="edit">
            <span class="material-symbols-rounded">
edit
</span>
        </div>
       <p class="item-name"></p>
       <p class="item-price"></p>
       <p class="item-stock"></p>
       </div>
       <br>
       <div class="button-section">
       <button class="decrease-stock" data-mode="decrease">Stock -</button>
       <button class="increase-stock" data-mode="increase">Stock +</button>
       </div>`;
       this.attachShadow({mode:'open'});
       this.shadowRoot.append(template.content.cloneNode(true));
	}
	connectedCallback() {
		const item = this.shadowRoot.querySelector('.item-name');
		const price = this.shadowRoot.querySelector('.item-price');
        const stock = this.shadowRoot.querySelector('.item-stock');
        item.innerText = this.hasAttribute('data-item-name') ? this.getAttribute('data-item-name') : 'Not Found';
        price.innerText = this.hasAttribute('data-price') ? `Price : ${this.getAttribute('data-price')}` : 'Not Found';
        stock.innerText = this.hasAttribute('data-stock') ? `Stock : ${this.getAttribute('data-stock')}` : 'Not Found';
	}
	static get observedAttributes() {
    	return ['data-stock'];
    }
    attributeChangedCallback(name, oldValue, newValue) {
    	this.shadowRoot.querySelector('.item-stock').innerText = `Stock : ${this.getAttribute('data-stock')}`;
    }
}
customElements.define('empty-message', EmptyMessage);
customElements.define('grid-menu', GridMenu);
customElements.define('menu-block', MenuBlock);
customElements.define('add-button', AddButton);
customElements.define('add-data', AddData);
customElements.define('add-number', AddNumber);
customElements.define('submit-data', SubmitData);
customElements.define('category-block', CategoryBlock);
customElements.define('add-property', AddProperty);
customElements.define('custom-select', CustomSelect);
//321
customElements.define('item-block', ItemBlock);
customElements.define('category-view', CategoryView);
//504
customElements.define('custom-property', CustomProperty);
//551
customElements.define('info-box', InfoBox);
//664
customElements.define('item-view', ItemView);
