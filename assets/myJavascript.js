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
        return this.fetchAPI('add.js', formData);
    }

    changeItem(formData) {
        return this.fetchAPI('change.js', formData);
    }

    async getCartDetails() {
        const response =  await fetch(`/cart.js`);
        return response.json();
    }

    deleteItem(line) {
        this.changeItem({line: line,quantity: 0}).then(res => this.renderCartItems(res))
    }

    async getProduct(handle) {
        const response =  await fetch(`/products/${handle}.js`);
        return response.json();
    }

    async updateCart() {
        const cartDetails = await this.getCartDetails();
        this.renderCartItems(cartDetails)
    }

    closeModal() {
        const sideCart = document.querySelector(".side-cart");
        sideCart.classList.toggle("open");
        document.body.removeAttribute('style');
    }

    renderCartItems(cartDetails) {
        const cartItemsWrapper = document.querySelector(".side-cart__items");
        cartItemsWrapper.innerHTML = "";

        for (let item of cartDetails.items) {
            const template = `
                <div class="side-cart__item">
                    <div class="item__image-wrapper">
                        <img class="item__image" src="${item.image}" alt="${ item.title }" />
                    </div>
                    <div class="item__details item__details--one">
                        <p class="item__heading title">${item.title}</p>
                        <p class="p--secondary">${item.variant.title}</p>
                        <div class="item__amount-container">
                            {% render 'icon-minus' %}
                            <p class="p--secondary item__amount">${item.quantity}</p>
                            {% render 'icon-plus' %}
                        </div>
                    </div>
                    <div class="item__details item__details--two">
                        <p class="p--secondary">${this.formatter.format(item.price / 100)}</p>
                        <div class="item__cancel-container">
                            {% render 'icon-cancel' %}
                        </div>
                    </div>
                </div>
            `

            cartItemsWrapper.insertAdjacentHTML('beforeend', template);
        }

        const sideCartTotalPrice = document.querySelector(".side-cart__total-price");
        sideCartTotalPrice.textContent = "Subtotal " + this.formatter.format(cartDetails.total_price / 100);

        const sideCartItemCart = document.querySelector(".side-cart__item-cart");
        sideCartItemCart.textContent = '(' + cartDetails.item_count + ')'

    }

    async toggleCart() {
        await this.updateCart();
        const sideCart = document.querySelector(".side-cart");
        
        sideCart.classList.toggle("open");
        document.body.setAttribute('style', 'overflow: hidden');
    }

    addToCart() {
        const variantId = document.querySelector(".product__variant-selector");

        const formData = {
            items: [{
                id: variantId.value,
                quantity: 1
            }]
        }

        this.addItem(formData).then(() => this.toggleCart());
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
const cartIcon = document.querySelector('.side-cart-icon');

cartIcon.addEventListener('click',()=>{
    console.log('hey')
    const sideCart = new Cart();
    sideCart.toggleCart()
})

