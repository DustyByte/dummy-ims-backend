const express = require('express')
const cors = require(`cors`)
const { setDoc, doc, getDoc, getDocs, collection } = require('firebase/firestore')
const { db } = require('./firebase')

const app = express()

const port = process.env.port || 3000

app.use(express.json())

app.use(cors({
    origin: "*"
}))

app.post('/', async (req, res) => {    
    const request = req.body
    try{
        for(let i = 0; i < request.products.length; i++){
            const product = await getDoc(doc(db, 'products', request.products[i].productName))
            const isOverStock = product.inStock >= 1000 ? true : false
            const inventoryInfo = await getDoc(doc(db, `inventory`, `info`))

            
            await setDoc(doc(db, `products`, request.products[i].productName), {
                ...product,
                inStock: product.inStock - request.products[i].amountPurchased
            })
    
            await setDoc(doc(db, `inventory`, `info`), {
                ...inventoryInfo,
                productOverStocked: isOverStock ? (product.inStock-request.products[i].amountPurchased < 1000 ? inventoryInfo.productOverStocked - 1: inventoryInfo) : inventoryInfo,
                productOutStocked: product.inStock - request.products[i].amountPurchased == 0 ? (inventoryInfo.productOutStocked + 1) : inventoryInfo.productOutStocked,
                itemsInStock: inventoryInfo.itemsInStock - request.products[i].amountPurchased
            })
            
        }
        res.json({success: true})
        res.end()
    }catch(err){
        res.json({success: false, reason: err.message, sentPayload: request})
        res.end()
    }
})


app.get('/', async (req, res) => {
    try{
        const snapShot = await getDocs(collection(db, `products`))
        const products = []
        snapShot.forEach(doc => {
            products.push(doc.data())
        })

        res.status(200).json({products: products})
        res.end()
    }catch(err){
        console.log(err)
    }
})

app.listen(port, () => {
    console.log(`Listening to ${port}`)
})
