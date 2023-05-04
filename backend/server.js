import express from 'express'
import dotenv from 'dotenv'
import userRoutes from './routes/userRoutes.js'
import postRoutes from './routes/postRoutes.js'
import commentRoutes from './routes/commentRoutes.js'
import connectDB from './config/db.js';


const port = process.env.PORT || 5000;

dotenv.config()

connectDB()

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)

app.listen(port, () => console.log(`Server started on post ${port}`))