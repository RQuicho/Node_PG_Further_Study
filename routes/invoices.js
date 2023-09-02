const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT id, comp_code FROM invoices ORDER BY comp_code`);
        return res.json({ invoices: results.rows});
    } catch(e) {
        return next(e);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(
            `SELECT 
                i.id,
                i.amt,
                i.paid,
                i.add_date,
                i.paid_date,
                c.code,
                c.name,
                c.description
            FROM invoices AS i
            INNER JOIN companies AS c ON (i.comp_code = c.code)
            WHERE id=$1`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with id of ${id}`, 404);
        }
        const data = results.rows[0];
        const invoice = {
            id: data.id,
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date,
            company: {
                code: data.code,
                name: data.name,
                description: data.description
            }
        }
        return res.send({invoice: invoice});
    } catch(e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {comp_code, amt} = req.body;
        const results = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);
        return res.status(201).json({invoice: results.rows[0]});
    } catch(e) {
        return next(e);
    }
    // when you submit a post request, the "comp_code" needs to be an existing code in the companies table.
});

router.put('/:id', async (req, res, next) => {
    try {
        const {amt} = req.body; 
        const {id} = req.params;
        const results = await db.query(`UPDATE invoices SET amt=$1 WHERE id=$2 RETURNING id, comp_code, amt, paid, add_date, paid_date`, [amt, id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot update company with code of ${id}`, 404);
        }
        return res.send({invoice: results.rows[0]});
    } catch(e) {
        return next(e);
    }
});

router.delete('/:id', async (req, res, next) => {
    try {
        const {id} = req.params;
        const results = await db.query(`DELETE FROM invoices WHERE id=$1 RETURNING id`, [id]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${id}`, 404);
        }
        return res.send({status: 'deleted'});
    } catch(e) {
        return next(e);
    }
});



module.exports = router;