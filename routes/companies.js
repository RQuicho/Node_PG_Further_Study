const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const slugify = require("slugify");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`SELECT code, name FROM companies ORDER BY name`);
        return res.json({ companies: results.rows});
    } catch(e) {
        return next(e);
    }
});

router.get('/:code', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT c.code, c.name, c.description, i.industry
            FROM companies AS c
            LEFT JOIN companies_industries AS ci
            ON c.code = ci.company_code
            LEFT JOIN industries AS i
            ON ci.industry_code = i.code
            WHERE c.code=$1`, [req.params.code]);
       
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code of ${req.params.id}`, 404);
        }
        const {code, name, description} = results.rows[0];
        const industries = results.rows.map(r => r.industry);
        return res.send({code, name, description, industries});
        // return res.send(results.rows);
    } catch(e) {
        return next(e);
    }
});

router.post('/', async (req, res, next) => {
    try {
        const {name, description} = req.body;
        const code = slugify(name, {lower: true, trim: true});
        const results = await db.query(`INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]);
        return res.status(201).json({company: results.rows[0]});
    } catch(e) {
        return next(e);
    }
});

router.put('/:code', async (req, res, next) => {
    try {
        const {name, description} = req.body; 
        const {code} = req.params;
        const results = await db.query(`UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`, [name, description, code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot update company with code of ${code}`, 404);
        }
        return res.send({company: results.rows[0]});
    } catch(e) {
        return next(e);
    }
});

router.delete('/:code', async (req, res, next) => {
    try {
        const {code} = req.params;
        const results = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code]);
        if (results.rows.length === 0) {
            throw new ExpressError(`Cannot find company with code ${code}`, 404);
        }
        return res.send({status: 'deleted'});
    } catch(e) {
        return next(e);
    }
});



module.exports = router;