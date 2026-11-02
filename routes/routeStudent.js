const express = require('express')
const mongoose = require('mongoose')
const Feedback = require('../model/Feedback')

const routeStudent = express.Router()

routeStudent.post('/', async (req, res) => {
    try {
        const feedback = await Feedback.create({
            studentName: req.body.studentName,
            courseName: req.body.courseName,
            message: req.body.message,
            rating: req.body.rating,
        })

        res.status(201).json(feedback)
    } catch (error) {
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                message: 'Invalid feedback data',
                errors: Object.values(error.errors).map((validationError) => validationError.message),
            })
        }

        res.status(500).json({ message: 'Failed to submit feedback' })
    }
})

routeStudent.get('/', async (req, res) => {
    const page = req.query.page === undefined ? 1 : Number(req.query.page)
    const limit = req.query.limit === undefined ? 10 : Number(req.query.limit)

    if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
        return res.status(400).json({ message: 'Page and limit must be positive integers' })
    }

    try {
        const [feedback, totalRecords] = await Promise.all([
            Feedback.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
            Feedback.countDocuments(),
        ])

        res.json({
            feedback,
            currentPage: page,
            totalRecords,
        })
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve feedback' })
    }
})

routeStudent.patch('/:id', async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid feedback ID' })
    }

    if (!['Pending', 'Reviewed'].includes(status)) {
        return res.status(400).json({ message: 'Status must be either Pending or Reviewed' })
    }

    try {
        const feedback = await Feedback.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        )

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback record not found' })
        }

        res.json(feedback)
    } catch (error) {
        res.status(500).json({ message: 'Failed to update feedback status' })
    }
})

module.exports = routeStudent