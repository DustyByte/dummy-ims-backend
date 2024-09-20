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
        var overStock = 0
        var outStock = 0
        var totalItemsPurchased = 0
        const inventoryInfoDoc = await getDoc(doc(db, `inventory`, `info`))
        const inventoryInfo = inventoryInfoDoc.data()

        for(let i = 0; i < request.products.length; i++){
            const productDoc = await getDoc(doc(db, 'products', request.products[i].productName))
            const product = productDoc.data()
            const requestAmount = Number(request.products[i].amountPurchased)

            if(product.inStock >= 1000){
                if(product.inStock - requestAmount < 1000){
                    overStock--
                }
            }
            else{
                if(product.inStock - requestAmount == 0){
                    outStock++
                }
            }
            
            await setDoc(doc(db, `products`, request.products[i].productName), {
                ...product,
                inStock: product.inStock - requestAmount
            })    
            totalItemsPurchased += requestAmount
        }


        await setDoc(doc(db, `inventory`, `info`), {
            ...inventoryInfo,
            productOverStocked: inventoryInfo.productOverStocked + overStock,
            itemsInStock: inventoryInfo.itemsInStock - totalItemsPurchased,
            productOutStocked: inventoryInfo.productOutStocked + outStock
        })

        const prevOrdersDoc = await getDoc(doc(db, 'inventory', 'orders'))
        const prevOrders = prevOrdersDoc.data()

        await setDoc(doc(db, 'inventory', 'orders'), {
            orders: [...prevOrders.orders, request.products]
        })

        res.json({success: true})
        res.end()
    }catch(err){
        res.json({success: false, reason: err.message})
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
