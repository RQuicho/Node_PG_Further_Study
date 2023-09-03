const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
        const results = await db.query(`
            SELECT i.industry, array_agg(c.code) AS company_codes
            FROM industries AS i
            LEFT JOIN companies_industries AS ci
            ON i.code = ci.industry_code
            LEFT JOIN companies AS c
            ON ci.company_code = c.code
            GROUP BY i.industry`);

        const industries = results.rows.map(r => ({
            industry: r.industry,
            company_codes: r.company_codes
        }));
        return res.json(industries);
       
        // const {industry} = results.rows[2];
        // industry.companies = results.rows.map(r => r.code);
        // const companies = results.rows.map(r => r.code);
        // return res.send({industry, companies});
        // return res.send(results.rows);
    } catch(e) {
        return next(e);
    }
});


router.post('/', async (req, res, next) => {
    try {
        const {code, industry} = req.body;
        const industryResults = await db.query(`INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]);
        return res.status(201).json({industries: industryResults.rows[0]});
    } catch(e) {
        return next(e);
    }
});





module.exports = router;