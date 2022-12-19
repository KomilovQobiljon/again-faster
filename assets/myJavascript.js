// Put your application javascript here
class Cart {
    formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
    });

    async fetchAPI(api, formData) {
        const response = await fetch(`/cart/${api}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        return await response.json();
    }

    addItem(formData) {
        try{
            return this.fetchAPI('add.js', formData);
        }catch(error){
            console.log(error)
        }
    }

    changeItem(formData) {
        return this.fetchAPI('change.js', formData);
    }

    updateItem(formData) {
        // this method is not working because update.js of shopify method is not usable
        return this.fetchAPI('update.js', formData);
    }

    async getCartDetails() {
        const response =  await fetch(`/cart.js`);
        return response.json();
    }

    deleteItem(id) {
        this.changeItem({id: id,quantity: 0}).then(res => this.renderCartItems(res))
    }

    async getProduct(handle) {
        const response =  await fetch(`/products/${handle}.js`);
        return response.json();
    }

    async updateCart(response) {
        let cartDetails;
        if(!response){
            cartDetails = await this.getCartDetails();
        }else{
            cartDetails = response;
        }
        this.renderCartItems(cartDetails)
    }

    closeModal() {
        const sideCart = document.querySelector(".side-cart");
        const sideCartModal = document.querySelector('.side-cart-modal');
        sideCart.classList.toggle('open');
        sideCartModal.classList.toggle('side-cart-modal--open');
        document.body.removeAttribute('style');
    }

    renderCartItems(cartDetails) {
        const cartItemsWrapper = document.querySelector(".side-cart__items");
        cartItemsWrapper.innerHTML = "";

        for (let item of cartDetails.items) {
            const template = `
                <div class="side-cart__item">
                    <div class="item__image-wrapper">
                        <img class="item__image" src="${item.image}" alt="${ item.product_title }" />
                    </div>
                    <div class="item__details item__details--one">
                        <p class="item__heading title">${item.product_title}</p>
                        <p class="p--secondary">${item.variant_title ? item.variant_title: '' }</p>
                        <div class="item__amount-container">
                            <img src="https://cdn.shopify.com/s/files/1/0611/1834/9495/files/icon-minus.svg?v=1664184954" class="item-amount__decrease" />
                            <p class="p--secondary item__amount">${item.quantity}</p>
                            <img src="https://cdn.shopify.com/s/files/1/0611/1834/9495/files/icon-plus.svg?v=1664184966" class="item-amount__increase" />
                        </div>
                    </div>
                    <div class="item__details item__details--two">
                        <p class="p--secondary">${this.formatter.format(item.price / 100)}</p>
                        <div class="item__cancel-container" data-itemID = "${item.id}">
                            <img src="https://cdn.shopify.com/s/files/1/0611/1834/9495/files/icon-cancel.svg?v=1664184918" />
                        </div>
                    </div>
                </div>
            `

            cartItemsWrapper.insertAdjacentHTML('beforeend', template);
        }

        const sideCartTotalPrice = document.querySelector(".side-cart__total-price");
        sideCartTotalPrice.textContent = this.formatter.format(cartDetails.total_price / 100);

    }

    async toggleCart() {
        await this.updateCart();
        const sideCart = document.querySelector('.side-cart');
        const sideCartModal = document.querySelector('.side-cart-modal');
        sideCart.classList.toggle('open');
        sideCartModal.classList.toggle('side-cart-modal--open')
        document.body.setAttribute('style', 'overflow: hidden');
    }


    addToCart(productId) {
        let itemId; 
        let variantId;
        let sellingPlanId;
        let formData;
        if(document.querySelector('.product-variant__input:checked')){
            variantId = document.querySelector('.product-variant__input:checked').value;
        }else if(document.querySelector('#product__id').dataset.sellingPlanId){
            sellingPlanId = document.querySelector('#product__id').dataset.sellingPlanId;
            variantId = document.querySelector('#product__id').dataset.productId;
            
        }else{
            variantId = document.querySelector('#product__id').dataset.productId;
            
        }
        
        if(productId){
            itemId = productId
        }else{
            itemId = variantId;
        }
        if(sellingPlanId){
            formData = {
                items: [{
                    id: itemId,
                    quantity: 1,
                    selling_plan: sellingPlanId,
                }]
            }
        }else{
            formData = {
                items: [{
                    id: itemId,
                    quantity: 1
                }]
            }
        }
        

        this.addItem(formData).then(() => this.toggleCart());

    }

    increaseItemAmount({itemID,itemAmount}) {
        const updatesObj = {};
        updatesObj[itemID]=String(Number(itemAmount)+1);
        const formData = {
            updates:updatesObj
        }

        this.updateItem(formData).then((response)=> this.updateCart(response));
    }
    decreaseItemAmount({itemID,itemAmount}){
        const updatesObj = {};
        updatesObj[itemID]=String(Number(itemAmount)-1);
        const formData = {
            updates:updatesObj
        }

        this.updateItem(formData).then(()=>this.updateCart());
    }

    addCartItemCount() {
        this.getCartDetails().then(cartDetails => {
            const headerCartLinks = document.querySelectorAll(".header-cart-link");
            headerCartLinks.forEach(link => {
                link.innerHTML += " (" + cartDetails.item_count + ")"
            })
        })
    }
}

const sideCartIcon = document.querySelector('.side-cart-icon');
const sideCartExit = document.querySelector('.icon-exit');
const btnAddToCart = document.querySelector('#product__add-to-cart');
const frequenlyBouthWithContainer = document.querySelector('.info__fbw-container')
const cart = new Cart();
const sideCartItems = document.querySelector('.side-cart__items');


sideCartIcon?.addEventListener('click',()=>{
    cart.toggleCart()
})
sideCartExit?.addEventListener('click', ()=>{
    cart.closeModal()
})
frequenlyBouthWithContainer?.addEventListener('click',(e)=>{
    if(e.target.classList.contains('fbw__cta')){
        cart.addToCart(e.target.dataset.productid);
    }
})
sideCartItems?.addEventListener('click',(e)=>{
    if(e.target.classList.contains('item__cancel-container') || e.target.parentElement.classList.contains('item__cancel-container')){
        let cancelBtn;
        if(e.target.classList.contains('item__cancel-container')){
            cancelBtn = e.target
        }else if(e.target.parentElement.classList.contains('item__cancel-container')){
            cancelBtn = e.target.parentElement
        }
        cart.deleteItem(cancelBtn.dataset.itemid);
    }else if(e.target.classList.contains('item-amount__decrease')){
        let cartItem = e.target.parentElement.parentElement.parentElement;
        const itemAmount = cartItem.querySelector('.item__amount').textContent;
        const itemID = cartItem.querySelector('.item__cancel-container').dataset.itemid;
        cart.decreaseItemAmount({itemAmount:itemAmount,itemID:itemID})
    }else if(e.target.classList.contains('item-amount__increase')){
        let cartItem = e.target.parentElement.parentElement.parentElement;
        const itemAmount = cartItem.querySelector('.item__amount').textContent;
        const itemID = cartItem.querySelector('.item__cancel-container').dataset.itemid;
        cart.increaseItemAmount({itemAmount:itemAmount,itemID:itemID})
    }
})
btnAddToCart?.addEventListener('click',(e)=>{
    e.preventDefault();
    cart.addToCart();
    document.querySelector('#product__id').dataset.sellingPlanId = '';
})
