// API Configuration
const API_BASE_URL = 'http://product-management-back-end-b9cphccqfyehh7aj.uaenorth-01.azurewebsites.net/api/products';

// DOM Elements
let title = document.getElementById("title");
let price = document.getElementById("price");
let taxes = document.getElementById("taxes");
let ads = document.getElementById("ads");
let discount = document.getElementById("discount");
let category = document.getElementById("category");
let totalAmmount = document.getElementById("total-ammount");
let totalColor = document.getElementById("total-color");
let create = document.getElementById("create");
let count = document.getElementById("count");

let mode = "create";
let currentProductId = null;
let searchMode = 'title';

// Initialize
loadProducts();

function getTotal() {
    if (price.value != ''){
        let result = (+price.value + +taxes.value + +ads.value - +discount.value); 
        totalAmmount.innerHTML = result ; 
        totalColor.style.backgroundColor = `green`;
    } else {
        totalAmmount.innerHTML = 0 ; 
        totalColor.style.backgroundColor = `red`; 
    }
}

create.onclick = async function() {
    if (title.value != '' && price.value != '' && category.value != '' && +count.value < 100) {
        const product = {
            title: title.value,
            price: parseFloat(price.value),
            taxes: parseFloat(taxes.value),
            ads: parseFloat(ads.value),
            discount: parseFloat(discount.value),
            category: category.value,
            count: parseInt(count.value)
        };

        try {
            if (mode === "create") {
                if (count.value > 1) {
                    // Create multiple products
                    for (let i = 0; i < count.value; i++) {
                        await createProduct(product);
                    }
                } else {
                    await createProduct(product);
                }
                window.alert("Product(s) created successfully!");
            } else {
                await updateProduct(currentProductId, product);
                mode = "create";
                create.innerHTML = "create";
                count.style.display = "block";
                window.alert("Product updated successfully!");
            }

            clearData();
            loadProducts();
        } catch (error) {
            console.error('Error:', error);
            window.alert("An error occurred. Please try again.");
        }
    } else {
        window.alert("Please fill in all required fields correctly");
    }
};

function clearData() {
    title.value = '';
    price.value = '';
    taxes.value = '';
    ads.value = '';
    discount.value = '';
    totalAmmount.innerHTML = '';
    category.value = '';
    count.value = '';
    currentProductId = null;
}

// Load and display products
async function loadProducts() {
    try {
        const response = await fetch(API_BASE_URL);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
        window.alert("Error loading products. Please try again.");
    }
}

// Display products in table
function displayProducts(products) {
    getTotal();
    let table = '';
    
    products.forEach((product, index) => {
        table += `
        <tr>
            <td>${index + 1}</td>
            <td>${product.title}</td>
            <td>${product.price}</td>
            <td>${product.taxes}</td>
            <td>${product.ads}</td>
            <td>${product.discount}</td>
            <td>${product.total}</td>
            <td>${product.category}</td>
            <td><button class="btn" onclick="updateData(${product.id})">update</button></td>
            <td><button class="btn" onclick="deleteData(${product.id})">delete</button></td>
        </tr>
        `;
    });

    document.getElementById('tbody').innerHTML = table;
    
    // Update delete all button visibility
    if (products.length >= 1) {
        document.getElementById("deleteAll").classList.replace("deleteAll-none", "deleteAll-block");
        document.getElementById("arr-len").textContent = products.length;
    } else {
        document.getElementById("deleteAll").classList.replace("deleteAll-block", "deleteAll-none");
    }
}

// Create new product
async function createProduct(product) {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
    });


    if (!response.ok) {
        throw new Error('Failed to create product');
    }

    return response.json();
}

// Delete product
async function deleteData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts();
            window.alert("Product deleted successfully!");
        } else {
            throw new Error('Failed to delete product');
        }
    } catch (error) {
        console.error('Error:', error);
        window.alert("Error deleting product. Please try again.");
    }
}

// Delete all products
async function deleteAll() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`, {
            method: 'DELETE'
        });

        if (response.ok) {
            loadProducts();
            window.alert("All products deleted successfully!");
        } else {
            throw new Error('Failed to delete all products');
        }
    } catch (error) {
        console.error('Error:', error);
        window.alert("Error deleting products. Please try again.");
    }
}

// Load product data for update
async function updateData(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        const product = await response.json();

        title.value = product.title;
        price.value = product.price;
        taxes.value = product.taxes;
        ads.value = product.ads;
        discount.value = product.discount;
        category.value = product.category;

        mode = "update";
        currentProductId = id;
        getTotal();
        create.innerHTML = "update";
        count.style.display = "none";
        
        scroll({
            top: 0,
            behavior: "smooth"
        });
    } catch (error) {
        console.error('Error:', error);
        window.alert("Error loading product data. Please try again.");
    }
}

// Update existing product
async function updateProduct(id, product) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product)
    });

    if (!response.ok) {
        throw new Error('Failed to update product');
    }

    return response.json();
}

// Set search mode
function getSearchMode(sm) {
    searchMode = sm;
    let searchText = document.getElementById("search");
    searchText.placeholder = 'search by ' + sm;
    searchText.focus();
    searchText.value = '';
    loadProducts();
}

// Search products
async function searchData() {
    const searchText = document.getElementById("search").value;
    if (!searchText) {
        loadProducts();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/search/${searchMode}?query=${encodeURIComponent(searchText)}`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error searching products:', error);
        window.alert("Error searching products. Please try again.");
    }
}