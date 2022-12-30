const main = (() => {
	if (!window.indexedDB) {
		console.log('indexedDB not supported!');
	}
	let db;
	const dbConnection = window.indexedDB.open('shelfo_db', 11);
	dbConnection.onupgradeneeded = event =>{
        const db = event.target.result;
        const categories = db.createObjectStore('categories', {keyPath:'categoryId', autoIncrement:true});
        const items = db.createObjectStore('items', {keyPath:'itemId', autoIncrement:true});
		const categoriesIndex = categories.createIndex('name', 'name', {unique:true});
		const itemsIndex = items.createIndex('name', 'name', {unique:false});
		const itemsIndex2 = items.createIndex('categoryId', 'categoryId', {unique:false});
		const uncategorized = {name:'Uncategorized'};
		categories.add(uncategorized);
	}
	dbConnection.onsuccess = event =>{
		db = event.target.result;
	}
	//declarations
	const menuIcon = document.querySelector('#menu-icon');
	const menu = document.querySelector('#menu-container');
	const rootDiv = document.getElementById('root');
	const searchDiv = document.getElementById('search-view');
	const menuLinks = document.querySelectorAll('#menu span');
	//template objs
    class Page {
    	constructor(view) {
    	    this.view = view;
        }
        clean() {
        	const view = this.view;
            while (view.hasChildNodes()) {
					view.removeChild(view.firstChild);
			}
		}
        removeList() {
        	menu.style.width = 0;
            menuIcon.querySelector('span').innerText='menu';
	        menuIcon.removeEventListener('click',closeMenu);
            menuIcon.addEventListener('click',openMenu);
        }
        cleanElm(elm){
        	while (elm.hasChildNodes()) {
					elm.removeChild(elm.firstChild);
			}
        }
        smartCase(string){
        	return string.charAt(0).toUpperCase() + string.slice(1);
        }
        setActivePage() {
			const current = menu.querySelector('.current');
			const shortcut = menu.querySelector('.current-short-cut');
			const pathname = window.location.pathname;
			const link = menu.querySelector(`[data-link = '${pathname}']`);
			if (current && !link.classList.contains('short-cut')) {
				current.classList.remove('current');
				if (shortcut) {
				    shortcut.classList.remove('current-short-cut');
				}
				link.classList.add('current');
			}else if (!current && !link.classList.contains('short-cut')) {
				if (shortcut) {
				    shortcut.classList.remove('current-short-cut');
				}
				link.classList.add('current');
			}else if (shortcut) {
				shortcut.classList.remove('current-short-cut');
				if (current) {
				    current.classList.remove('current');
				}
		        link.classList.add('current-short-cut');
	        }else{
	        	link.classList.add('current-short-cut');
	            if (current) {
				    current.classList.remove('current');
				}
	        }
	    }
    }
    //menu page
	const menuPage = new Page(rootDiv);
	menuPage.render = function() {
		menu.style.width = '70%';
	};
	//search
    const searchShelf = new Page(rootDiv);
    searchShelf.render = function() {
    	this.clean();
        const input = document.querySelector('#search-shelf input');
        if (window.location.pathname == '/search') {
        	history.replaceState({}, ' ', `search?q=${input.value}`);
        }else {
            history.pushState({}, ' ', `search?q=${input.value}`);
        }
    	const transaction = db.transaction(['items', 'categories'], 'readonly');
        const itemsStore = transaction.objectStore('items');
        const categoryStore = transaction.objectStore('categories');
        const request = itemsStore.openCursor();
        request.onsuccess = (e) =>{
        	const cursor = e.target.result;
            if (cursor) {
	            const i = cursor.value;
            	if (cursor.value.name.toLowerCase().includes(input.value.toLowerCase())) {
            	    const item = document.createElement('item-block');
		            const categoryQuery = categoryStore.get(cursor.value.categoryId);
		            categoryQuery.onsuccess = e =>{
			            const catName = e.target.result.name;
                        item.setAttribute('data-category-name', catName);
                        item.setAttribute('data-item-name', i.name);
			            item.setAttribute('data-price', i.price);
			            item.setAttribute('data-stock', i.stockCount);
			            item.showProperties(...i.customProperties);
			            item.setAttribute('data-link', `/item-view?id=${i.itemId}`);
			            item.addEventListener('click', onNavigate);
			            rootDiv.appendChild(item);
			       }
            	}
                cursor.continue();
            }
        }
    }
	//items
	const itemsPage = new Page(rootDiv);
	itemsPage.render = function(e) {
		this.setActivePage();
		this.clean();
		let currentKey;
		let observer;
		const loadMore = (entries, observer) =>{
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					observer.unobserve(entry.target);
					loadItems(IDBKeyRange.upperBound(currentKey), true);
				}
            });
		}
		const options = {
			root:null,
			rootMargin:'0px',
			threshold:1.0
        };
        observer = new IntersectionObserver(loadMore, options);
		const loadItems = (key) =>{
			let loaded = 0;
			const transaction= db.transaction(['items', 'categories'], 'readonly');
            const itemsStore = transaction.objectStore('items');
            const categoryStore = transaction.objectStore('categories');
            itemsStore.openCursor(key, 'prev').onsuccess = event =>{
            	const cursor = event.target.result;
	            if (cursor) {
		            const i = cursor.value;
		            const item = document.createElement('item-block');
		            const categoryQuery = categoryStore.get(i.categoryId);
		            categoryQuery.onsuccess = e =>{
			            const catName = e.target.result.name;
                        item.setAttribute('data-category-name', catName);
                        item.setAttribute('data-item-name', i.name);
			            item.setAttribute('data-price', i.price);
			            item.setAttribute('data-stock', i.stockCount);
			            item.showProperties(...i.customProperties);
			            item.setAttribute('data-link', `/item-view?id=${i.itemId}`);
			            item.addEventListener('click', onNavigate);
			            this.view.appendChild(item);
			            loaded++;
					    if (loaded <= 15) {
					        cursor.continue();
					    }else {
						    currentKey = i.itemId;
						    const itemBlocks = document.getElementsByTagName('ITEM-BLOCK');
				            observer.observe(itemBlocks[itemBlocks.length-6]);
						}
			        }
		        }
	        }
        };
        loadItems(null);
		const bttn = document.createElement('add-button');
		bttn.setAttribute('data-link', '/add-item');
		bttn.className = 'fixed-elem';
		bttn.addEventListener('click', onNavigate);
		this.view.appendChild(bttn);
	    this.removeList();
	};
	//itemview
    const itemView = new Page(rootDiv);
    itemView.render = function() {
    	this.clean();
    	const params = new URLSearchParams(window.location.search);
        const itemId = parseInt(params.get('id'));
        const transaction= db.transaction('items', 'readonly');
        const store = transaction.objectStore('items');
        const query = store.get(itemId);
        query.onsuccess = e =>{
        	let mode, status;
	        const elem = document.createElement('div');
	        const input = document.createElement('add-number');
	        const bttn = document.createElement('submit-data');
	        const currentStock = document.createElement('p');
	        input.required = true;
        	const submitStock = () =>{
        	    const transaction= db.transaction('items', 'readwrite');
		        const store = transaction.objectStore('items');
		        const query = store.get(itemId);
		        query.onsuccess = e =>{
			        let valid;
			        let newStock;
			        const item = e.target.result;
			        const value = parseInt(input.value);
			        const stock = parseInt(item.stockCount);
			        if (mode === 'increase' && stock != '') {
				        newStock = stock + value;
				    }else{
					    valid = false;
					}
                    if (mode === 'decrease' && stock != '' && value <= stock) {
					    newStock = stock - value;
					}else{
						if (value > stock) {
							input.shadowRoot.querySelector('p').innerText = `Please insert correct value`;
						}
						valid = false;
					}
					if (newStock) {
					    item.stockCount = newStock;
					    valid = true;
					}else {
						valid = false;
					}
					const submit = store.put(item);
					if (valid) {
						submit.onsuccess = () =>{
						    navigate(`/item-view?id=${itemId}`);
						}
					}
		        }
        	}
        	const showStock = (e) =>{
        	    mode = e.target.getAttribute('data-mode');
                if (status == 'open') {
                	history.replaceState({}, ' ', `${mode}`);
                }else {
                	history.pushState({}, ' ', `${mode}`);
                }
	            input.value = 1;
	            input.setAttribute('data-label', `${this.smartCase(mode)} stock`);
	            currentStock.style.textAlign = 'center';
	            currentStock.style.fontWeight = 'bold';
	            currentStock.innerText = `Current stock : ${stock}`;
	            elem.style.position = 'fixed';
	            elem.style.bottom = 0;
	            elem.style.padding = '25px 0';
	            elem.style.width = '100%';
	            elem.style.borderTop = '1px solid darkorange';
	            elem.appendChild(input);
	            elem.appendChild(bttn);
	            elem.appendChild(currentStock);
	            bttn.addEventListener('click', submitStock);
	            this.view.appendChild(elem);
	            status = 'open';
            }
        	const item = e.target.result;
            const stock = item.stockCount;
            const container = document.createElement('item-view');
            container.setAttribute('data-item-name', item.name);
            container.setAttribute('data-price', item.price);
            container.setAttribute('data-stock', stock);
            container.shadowRoot.querySelector('.edit').setAttribute('data-link', `/edit-item?id=${itemId}`);
            container.shadowRoot.querySelector('.edit').addEventListener('click', onNavigate);
            container.shadowRoot.querySelector('.increase-stock').addEventListener('click', showStock);
            container.shadowRoot.querySelector('.decrease-stock').addEventListener('click', showStock);
            this.view.appendChild(container);
        }
    }
    //edit item
    const editItem = new Page(rootDiv);
    editItem.render = function() {
    	this.clean();
    	const params = new URLSearchParams(window.location.search);
        const itemId = parseInt(params.get('id'));
        const transaction = db.transaction(['items', 'categories'], 'readwrite');
        const itemsStore = transaction.objectStore('items');
        const itemQuery = itemsStore.get(itemId);
        itemQuery.onsuccess = e =>{
        	const item = e.target.result;
            const itemName = item.name;
            const fragment = document.createDocumentFragment();
            const nameInput = document.createElement('add-data');
            const priceInput = document.createElement('add-data');
            const stockInput = document.createElement('add-number');
            const showPropBttn = document.createElement('submit-data');
            const container = document.createElement('div');
            const submitBttn = document.createElement('submit-data');
            const deleteBttn = document.createElement('submit-data');
            const customProperties = item.customProperties;
            nameInput.setAttribute('data-label', 'Item name');
            nameInput.value = item.name;
            priceInput.setAttribute('data-label', 'Price');
            priceInput.value = item.price;
            stockInput.setAttribute('data-label', 'Stock');
            stockInput.value = item.stockCount;
            container.style.display = 'none';
            deleteBttn.setAttribute('data-label', 'Delete');
            deleteBttn.setAttribute('data-color', 'darkred');
            showPropBttn.setAttribute('color', '#303030');
            showPropBttn.setAttribute('data-label', 'Show custom properties');
            showPropBttn.addEventListener('click', (e) =>{
            	if (container.style.display == 'none') {
            	    container.style.display = 'block';
                    e.currentTarget.setAttribute('data-label', 'Hide custom properties');
            	}else {
            	    container.style.display = 'none';
                    e.currentTarget.setAttribute('data-label', 'Show custom properties');
            	}
            });
            if (customProperties.length > 0) {
	            customProperties.forEach(c =>{
	            	let input;
	            	if (c.dataType == 'number' || c.dataType =='float') {
	            	    input = document.createElement('add-number');
	                    if (c.dataType == 'float') {
	                    	input.setAttribute('step', '0.0001');
	                    }
	            	}else {
	            	    input = document.createElement('add-data');
	                    input.setAttribute('pattern', '[a-zA-Z0-9]( ?[a-zA-Z0-9])*');
	            	}
	                input.setAttribute('data-label', this.smartCase(c.name));
	                input.setAttribute('data-type', c.dataType);
	                input.className = 'custom-property';
	                input.value = c.value;
	                container.appendChild(input);
	            });
	        }else {
		        container.style.textAlign = 'center';
		        container.innerText = 'No custom properties';
	        }
            submitBttn.addEventListener('click', ()=>{
            	let exist;
            	const transaction = db.transaction(['categories', 'items'], 'readonly');
            	const itemsStore = transaction.objectStore('items');
                const categoryStore = transaction.objectStore('categories');
                const customProps = container.querySelectorAll('.custom-property');
            	item.name = nameInput.value;
                item.price = priceInput.value;
                item.stockCount = stockInput.value;
                item.customProperties = [];
                for (prop of customProps) {
                	const obj = {};
                    obj.name = prop.getAttribute('data-label');
                    obj.dataType = prop.getAttribute('data-type');
                    obj.value = prop.value;
                	item.customProperties.push(obj);
                }
                const request = itemsStore.openCursor();
                request.onsuccess = (e) =>{
                	const cursor = e.target.result;
                    if (cursor) {
	                    if (cursor.value.name.toLowerCase() == nameInput.value.toLowerCase() && cursor.value.categoryId == item.categoryId) {
	                    	exist = true;
	                        return exist;
	                    }else {
	                    	cursor.continue();
	                    }
                    }
                }
                transaction.oncomplete = () =>{
                	const itemsStore = db.transaction('items', 'readwrite').objectStore('items');
                	if (itemName == nameInput.value) {
                	    alert(itemName);
                	    const putRequest = itemsStore.put(item);
		                putRequest.onsuccess = () =>{
		                	navigate(`/item-view?id=${itemId}`);
		                }
                	}else if (exist != true) {
                	    alert(2);
                	    const putRequest = itemsStore.put(item);
		                putRequest.onsuccess = () =>{
		                	navigate(`/item-view?id=${itemId}`);
		                }
                	}else {
                	    alert(3);
                	    nameInput.shadowRoot.querySelector('p').innerText = 'Item name already exists';
                	}
                }
            });
            deleteBttn.addEventListener('click', () =>{
            	const transaction = db.transaction('items', 'readwrite');
            	const itemsStore = transaction.objectStore('items');
                const deleteItem = itemsStore.delete(item.itemId);
                deleteItem.onsuccess = () =>{
                	navigate('/');
                }
            });
            fragment.append(nameInput, priceInput, stockInput, showPropBttn, container, submitBttn, deleteBttn);
            this.view.appendChild(fragment);
        }
    }
	//out of stock
	const outofStock = new Page(rootDiv);
	outofStock.render = function() {
		this.setActivePage();
		this.clean();
		const el = document.createElement('empty-message');
		el.setAttribute('icon', 'sentiment_satisfied');
		el.setAttribute('message', 'No items Yet!');
		this.view.appendChild(el);
	    this.removeList();
	};
	//new order
	const newOrder = new Page(rootDiv);
	newOrder.render = function() {
		this.setActivePage();
		this.clean();
		const el = document.createElement('empty-message');
		el.setAttribute('icon', 'sentiment_dissatisfied');
		el.setAttribute('message', 'No items Yet!');
		el.appendChild(document.createElement('add-button'));
		this.view.appendChild(el);
	    this.removeList();
	};
	//manage items
	const manageItems = new Page(rootDiv);
	manageItems.render = function () {
		this.setActivePage();
		this.clean();
		const el = document.createElement('grid-menu');
		const titles = ['Categories', 'Add Item', 'Similar Items', 'Delete Items', 'Insights'];
		const icons = ['category', 'add', 'workspaces', 'delete', 'insights'];
		const roots = ['/categories', '/add-item', '/categories', '/categories', '/categories'];
		for (let i=0; i<icons.length; i++) {
		    const newElm = document.createElement('menu-block');
		    newElm.setAttribute('slot', 'block');
		    newElm.setAttribute('icon', icons[i]);
		    newElm.setAttribute('title', titles[i]);
		    newElm.setAttribute('data-link', roots[i]);
		    newElm.addEventListener('click', onNavigate);
		    el.appendChild(newElm);
		}
		this.view.appendChild(el);
	    this.removeList();
	 };
	//category
    const categories = new Page(rootDiv);
    categories.render = function() {
    	this.clean();
		(() =>{
			const transaction= db.transaction('categories', 'readonly');
            const store = transaction.objectStore('categories');
            store.getAll().onsuccess = event =>{
	        	const categories = event.target.result;
	            if (categories.length < 1) {
	            	const el = document.createElement('empty-message');
					el.setAttribute('icon', 'potted_plant');
					el.setAttribute('message', 'No categories yet!');
					this.view.appendChild(el);
				}else {
		            categories.forEach(c =>{
			            const category = document.createElement('category-block');
			            category.setAttribute('data-name', c.name);
			            category.setAttribute('data-link', `/show-category?name=${c.name.replace(/\s/g, '+')}`);
			            category.addEventListener('click', onNavigate);
			            this.view.appendChild(category);
			        });
			    }
	        }
        })();
		const bttn = document.createElement('add-button');
		bttn.setAttribute('padding', '15px');
		bttn.setAttribute('text', 'New category');
		bttn.setAttribute('data-link', '/create-category');
		bttn.addEventListener('click', onNavigate);
		this.view.appendChild(bttn);
	    this.removeList();
    };
    //showCategory
    const showCategory = new Page(rootDiv);
    showCategory.render = function() {
    	this.clean();
        const params = new URLSearchParams(window.location.search);
        const catName = params.get('name');
        const transaction= db.transaction(['categories', 'items'], 'readonly');
        const categoryStore = transaction.objectStore('categories');
        const itemsStore = transaction.objectStore('items');
        const selected = categoryStore.index('name');
        const query = selected.get(catName);
        query.onsuccess = e =>{
        	const category = e.target.result;
            const categoryId = category.categoryId;
            alert(JSON.stringify(categoryId));
        	const categoryDiv = document.createElement('category-view');
            const span = categoryDiv.shadowRoot.querySelector('span');
            categoryDiv.setAttribute('data-name', category.name);
            span.setAttribute('data-link', `/info-box?name=${category.name.replace(/\s/g, '+')}`);
            span.addEventListener('click', onNavigate);
            this.view.appendChild(categoryDiv);
            const index = itemsStore.index('categoryId');
            const itemsQuery = index.getAll(categoryId);
            itemsQuery.onsuccess = e =>{
            	const items = e.target.result;
                if (items) {
	            if (items.length < 1) {
	            	const el = document.createElement('empty-message');
					el.setAttribute('icon', 'potted_plant');
					el.setAttribute('message', 'No Item yet!');
					this.view.appendChild(el);
			    }else {
			        items.forEach(i =>{
			            const item = document.createElement('item-block');
			            item.setAttribute('data-item-name', i.name);
			            item.setAttribute('data-price', i.price);
			            item.setAttribute('data-stock', i.stockCount);
			            item.showProperties(...i.customProperties);
			            item.setAttribute('data-link', `/item-view?id=${i.itemId}`);
			            item.addEventListener('click', onNavigate);
			            this.view.appendChild(item);
				     });
				 }
			}
            }
        }
        this.removeList();
    };
    //category info
    const categoryInfo = new Page(rootDiv);
    categoryInfo.render = function() {
    	this.clean();
        const params = new URLSearchParams(location.search);
        const catName = params.get('name');
        const infoBox = document.createElement('info-box');
        const editButton = infoBox.shadowRoot.querySelector('.edit');
        if (catName === 'Uncategorized') {
        	infoBox.editable = false;
        }
        infoBox.setAttribute('data-name', catName);
        editButton.setAttribute('data-link', `/edit-category?name=${params.get('name').replace(/\s/g, '+')}`);
        editButton.addEventListener('click', onNavigate);
        this.view.appendChild(infoBox);
        this.removeList();
    }
    //edit category
    const editCategory = new Page(rootDiv);
    editCategory.render = function() {
    	this.clean();
        const params = new URLSearchParams(location.search);
        const catName = params.get('name');
        const saveButton = document.createElement('submit-data');
        const deleteButton = document.createElement('submit-data');
        const transaction = db.transaction('categories', 'readonly');
        const store = transaction.objectStore('categories');
        const index = store.index('name');
        const query = index.get(catName);
        query.onsuccess = (e) =>{
        	const category = e.target.result;
            const categoryInput = document.createElement('add-data');
            categoryInput.setAttribute('pattern', '[a-zA-Z]+( ?[a-zA-Z])*');
            categoryInput.required = true;
            const updateCategory = () =>{
            	if (categoryInput.validity &&  catName !== 'Uncategorized') {
	            	const transaction= db.transaction('categories', 'readwrite');
	                const store = transaction.objectStore('categories');
	                const index = store.index('name');
	                const query = index.get(catName);
                    query.onsuccess = e =>{
                    	const category = e.target.result;
                        category.name = categoryInput.value;
                        store.put(category);
                        navigate('/categories');
                    }
	            }
            }
            const deleteCategory = () =>{
            	if (catName !== 'Uncategorized') {
	            	const transaction = db.transaction(['categories', 'items'], 'readwrite');
	                const catStore = transaction.objectStore('categories');
	                const itemsStore = transaction.objectStore('items');
	                const index = catStore.index('name');
	                const query = index.get(catName);
	                query.onsuccess = (e) =>{
	                    const categoryId = e.target.result.categoryId;
	                    const request = itemsStore.openCursor();
	                    request.onsuccess = e =>{
		                    const cursor = e.target.result;
		                    if (cursor) {
			                    if (cursor.value.categoryId == categoryId) {
				                    const deleteRequest = cursor.delete();
				                }
				                cursor.continue();
			                }
			                const deleteStore = catStore.delete(categoryId);
			                transaction.oncomplete = () =>{
				                navigate('/categories');
				            }
	                    }
	                }
                }
            }
            saveButton.setAttribute('data-label', 'Save Changes');
            categoryInput.setAttribute('data-placeholder', category.name);
            categoryInput.setAttribute('data-label', 'Category name');
            deleteButton.setAttribute('data-label', 'Delete category');
            deleteButton.setAttribute('data-color', 'darkred');
            saveButton.addEventListener('click', updateCategory);
            this.view.appendChild(categoryInput);
            this.view.appendChild(saveButton);
            deleteButton.addEventListener('click', deleteCategory)
            this.view.appendChild(deleteButton);
        }
    }
    //create category
    const createCategory = new Page(rootDiv);
    createCategory.render = function() {
    	this.clean();
        const customProperties = [];
		const el = document.createElement('add-data');
		el.setAttribute('data-label', 'Category');
		el.setAttribute('data-pattern', '[a-zA-Z0-9]+( ?[a-zA-Z0-9])*');
		el.setAttribute('data-placeholder', 'Eg : Smart Phones');
		el.required = true;
		const bttn = document.createElement('submit-data');
		bttn.setAttribute('data-link', '/categories'); 
		const div = document.createElement('div');
		const addProperty = document.createElement('add-property');
		this.view.appendChild(el);
		this.view.appendChild(div);
		this.view.appendChild(addProperty);
		this.view.appendChild(bttn);
	    this.removeList();
	    //data
        const newProperty = () =>{
        	const nameInput = document.createElement('add-data');
            nameInput.setAttribute('data-label', 'Property Name');
            nameInput.setAttribute('data-placeholder', 'Eg : Color');
            nameInput.setAttribute('data-pattern', '[a-zA-Z0-9]+( ?[a-zA-Z0-9])*');
            const valueType = document.createElement('custom-select');
            valueType.setAttribute('data-label', 'Data type');
            valueType.addOptions('string', 'number', 'float');
            div.appendChild(nameInput);
            div.appendChild(valueType);
            addProperty.removeEventListener('click', newProperty);
            addProperty.addEventListener('click', setProperty);
        }
        function removeProp(){
            const checkProp = (prop) =>{
            	if (prop.name === this.getAttribute('data-name')) {
            	    return prop;
                }
            }
            alert(customProperties.findIndex(checkProp));
            customProperties.splice(customProperties.findIndex(checkProp), 1);
            this.remove();
        }
        const setProperty = () =>{
        	const propName = div.querySelector('add-data');
            const dataType = div.querySelector('custom-select');
            if (propName.value !== '' && propName.validity) {
	            const prop = document.createElement('custom-property');
	            prop.setAttribute('data-name', propName.value);
	            prop.setAttribute('data-type', dataType.value);
	            prop.shadowRoot.querySelector('span').addEventListener('click', removeProp.bind(prop));
	            customProperties.push({name:propName.value, dataType:dataType.value});
	            propName.value='';
	            this.view.insertBefore(prop, div);
	        }
        }
        const createObj = () =>{
        	const name = div.querySelector('add-data');
            const dataType = div.querySelector('custom-select');
            if (name &&  dataType) {
            	if (name.value !== '') {
	            	const obj = {};
	                obj.name = name.value;
	                obj.dataType = dataType.value;
	            	customProperties.push(obj);
                }
            }
        }
        const checkValidityAll = () =>{
        	var elms = div.querySelectorAll('add-data');
        	for (let elm of elms) {
                   if (elm.validity === false) {
                   	return false;
                   }
            }
            return true;
        }
        const addData = (e) =>{
        	let exist;
        	let target = e.target;
			const transaction = db.transaction('categories', 'readwrite');
		    const objStore = transaction.objectStore('categories');
		    const catName = el.value;
        	const query = objStore.openCursor();
            query.onsuccess = (e) =>{
            	const cursor = e.target.result;
                if (cursor) {
                	if (cursor.value.name.toLowerCase() == catName.toLowerCase()) {
                	    el.shadowRoot.querySelector('p').innerText = 'Category already exists';
                        exist = true;
                        return exist;
                	}else {
                	    cursor.continue();
                	}
                }
                exist = false;
                return exist;
            }
            transaction.oncomplete = () =>{
			    if (exist !==true && el.validity && checkValidityAll()) {
				    const transaction = db.transaction('categories', 'readwrite');
		            const objStore = transaction.objectStore('categories');
				    createObj();
			        const value = el.value;
			        const obj = {name:value, customProperties:customProperties};
			        const putData = objStore.put(obj);
			        alert(JSON.stringify(obj));
			        alert(exist);
			        putData.onsuccess = () =>{
				        navigate(target.dataset.link);
				    }
		        }else {
			        alert(el.validity);
			        alert(checkValidityAll());
			        alert(`exist:${exist}`);
	            }
            }
        }
        bttn.addEventListener('click', addData);
        addProperty.addEventListener('click', newProperty);
        this.removeList();
    };
    //create_items
    const addItem = new Page(rootDiv);
    addItem.render = function() {
    	this.clean();
    	let categories = [];
        let customProperties = [];
    	const itemName = document.createElement('add-data');
        const categoryName = document.createElement('custom-select');
        const priceInput = document.createElement('add-number');
        const stockInput = document.createElement('add-number');
        const propertyBox = document.createElement('div');
        const customPropertyBox = document.createElement('div');
        const showPropBttn = document.createElement('submit-data');
        const submitBttn = document.createElement('submit-data');
        const mainFragment = document.createDocumentFragment();
        itemName.setAttribute('data-label', 'Item name');
        itemName.required = true;
        categoryName.setAttribute('data-label', 'Category');
        priceInput.setAttribute('data-label', 'Price');
        stockInput.setAttribute('data-label', 'Stock');
        customPropertyBox.style.display = 'none';
        showPropBttn.setAttribute('data-label', 'Show custom properties');
        showPropBttn.setAttribute('data-color', '#303030');
        const transaction= db.transaction('categories', 'readonly');
        const store = transaction.objectStore('categories');
        const checkValidityAll = () =>{
        	const elems = document.querySelectorAll('add-data', 'add-number');
            for (let elem of elems) {
            	if (elem.validity === false) {
            	    return false;
                }
            }
            return true;
        }
        const submitData = () =>{
        	let exist;
        	const transaction= db.transaction(['categories', 'items'], 'readonly');
            const categoryStore = transaction.objectStore('categories');
            const itemsStore = transaction.objectStore('items');
            const categoryIndex = categoryStore.index('name');
            const newItem = {};
            newItem.name = itemName.value;
            newItem.price = priceInput.value;
            newItem.stockCount = stockInput.value != '' ? parseInt(stockInput.value) : stockInput.value;
            newItem.customProperties = [];
            const customProperties = customPropertyBox.querySelectorAll('.custom-property');
            for (let property of customProperties) {
            	const obj = {};
                obj.name = property.getAttribute('data-property');
                obj.dataType = property.getAttribute('data-type');
                obj.value =  (property.tagName == 'ADD-NUMBER' && property.value != '') ? parseInt(property.value) : property.value;
                newItem.customProperties.push(obj);
            }
            const request = categoryIndex.getKey(categoryName.value);
            request.onsuccess = e =>{
            	const categoryId = e.target.result;
                newItem.categoryId = categoryId;
                const cursorRequest = itemsStore.openCursor();
                cursorRequest.onsuccess = e =>{
                	const cursor = e.target.result;
                    if (cursor) {
                    	if (cursor.value.name.toLowerCase() == itemName.value.toLowerCase() && cursor.value.categoryId == categoryId) {
                            exist = true;
                            itemName.shadowRoot.querySelector('p').innerText = 'Item already exists';
                    	    return exist;
                        }else {
                            cursor.continue();
                        }
                    }
                }
                transaction.oncomplete = () =>{
                    if (checkValidityAll() && exist !== true) {
                    	const newTransaction = db.transaction('items', 'readwrite');
                        const itemsStore = newTransaction.objectStore('items');
			            const putData = itemsStore.put(newItem);
				         putData.onsuccess = e =>{
			            	alert(JSON.stringify(newItem));
			                navigate('/');
			            }
			            putData.onerror = e =>{
			            	alert('error');
			            }
		            }
                }
            }
        }
        const showProps = (e) =>{
        	if (customPropertyBox.style.display == 'none') {
        	    customPropertyBox.style.display = 'block';
                e.target.setAttribute('data-label', 'Hide custom properties');
        	}else {
        	    customPropertyBox.style.display = 'none';
                e.target.setAttribute('data-label', 'Show custom properties');
        	}
        }
        const readProperties = () =>{
        	    this.cleanElm(customPropertyBox);
            	const transaction= db.transaction('categories', 'readonly');
                const store = transaction.objectStore('categories');
            	const selected = store.index('name');
                const query = selected.get(categoryName.value);
                query.onsuccess = (event) => {
                	const fragment = document.createDocumentFragment();
                    const resultArray = event.target.result.customProperties;
                    if (resultArray) {
	                    resultArray.forEach(a => {
	                    	let input;
	                    	const name = this.smartCase(a.name);
	                        const dataType = a.dataType;
	                        if (dataType === 'number' || dataType === 'float') {
			                    input = document.createElement('add-number');
			                    if (dataType === 'float') {
				                    input.setAttribute('step', '0.0001');
				                    input.setAttribute('data-type', 'float');
				                }else {
					                input.setAttribute('data-type', 'number');
					            }
				                input.setAttribute('class', 'custom-property');
				            }else {
				                input = document.createElement('add-data');
				                input.setAttribute('data-type', 'string');
				                input.setAttribute('pattern', '[a-zA-Z0-9]( ?[a-zA-Z0-9])*');
				                input.setAttribute('class', 'custom-property');
			                }
		                    input.setAttribute('data-label', name);
		                    input.setAttribute('data-property', a.name);
		                    input.setAttribute('data-placeholder', dataType);
		                    fragment.appendChild(input);
	                    });
	                }else {
		                const msgBox = document.createElement('p');
		                msgBox.style.textAlign = 'center';
		                msgBox.innerText = 'No custom properties';
		                fragment.appendChild(msgBox);
		            }
	                customPropertyBox.appendChild(fragment);
                }
        }
        store.getAll().onsuccess = event =>{
        	const result = event.target.result;
            result.forEach(r=>{
            	categories.push(r.name);
            });
            const propertyFragment = document.createDocumentFragment();
            categoryName.addOptions(...categories);
            mainFragment.appendChild(categoryName);
            categoryName.inputChange(readProperties);
            propertyFragment.appendChild(priceInput);
            propertyFragment.appendChild(stockInput);
            propertyBox.appendChild(propertyFragment);
            mainFragment.appendChild(propertyBox);
            mainFragment.appendChild(showPropBttn);
            mainFragment.appendChild(customPropertyBox);
            showPropBttn.addEventListener('click', showProps);
            submitBttn.addEventListener('click', submitData);
            mainFragment.appendChild(submitBttn);
            this.view.appendChild(mainFragment);
        }
        this.view.appendChild(itemName);
        this.removeList();
    }
	//router obj
	const routes = {
		'/menu' : menuPage,
		'/search' : searchShelf,
	    '/' : itemsPage,
	    '/item-view' : itemView,
	    '/edit-item' : editItem,
	    '/outofstock' : outofStock,
	    '/new-order' : newOrder,
	    '/manage-items' : manageItems,
	    '/categories' : categories,
	    '/create-category' : createCategory,
	    '/show-category' : showCategory,
	    '/info-box' : categoryInfo,
	    '/edit-category' : editCategory,
	    '/add-item' : addItem
	};
	//functions
	const openMenu = (e) =>{
	    menu.style.width = '70%';
	    e.currentTarget.querySelector('span').innerText='close';
	    const pathname = e.currentTarget.dataset.link;
	    history.pushState({}, ' ', pathname);
	    menuIcon.removeEventListener('click',openMenu);
	    menuIcon.addEventListener('click',closeMenu);
	}
	const closeMenu = (e) =>{
	    menu.style.width = 0;
	    menuIcon.querySelector('span').innerText='menu';
	    history.back();
	    menuIcon.removeEventListener('click',closeMenu);
	    menuIcon.addEventListener('click',openMenu);
	}
	const closeWithTouch = (e) =>{
		if (!menu.contains(e.target) && e.target != menuIcon) {
			document.removeEventListener('click', closeWithTouch, true);
			closeMenu();
			e.preventDefault()
            e.stopPropagation(); 
		}
	}
	//Calling functions
    //router function
	const onNavigate = (e) =>{
		let pathname = e.currentTarget.dataset.link;
		const newPath = pathname.split('?');
	    history.pushState({}, ' ', pathname);
	    routes[newPath[0]].render();
	}
	const navigate = r =>{
		const pathname = r;
		const newPath = pathname.split('?');
		history.replaceState({}, ' ', pathname);
	    routes[newPath[0]].render();
	}
	//popstate
    window.onpopstate = (e) =>{
    	const pathname = window.location.pathname;
        routes[pathname].render();
    }
    //serach items
    document.querySelector('#search-shelf input').addEventListener('input', function() {
        searchShelf.render();
     });
    //Add eventListeber with menu functions
    menuIcon.addEventListener('click',openMenu);
	//Add eventListener with onNavigate
	Array.from(menuLinks).forEach(e => e.addEventListener('click', onNavigate));
    window.onload = () => {
		const path = window.location.pathname;
		if (routes.hasOwnProperty(path)) {
		    routes[path].render();
		}else {
		    rootDiv.innerHTML = 'The page not found';
		}
	}
})();