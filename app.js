import express from 'express'
import { engine } from 'express-handlebars'
import sqlite3 from 'sqlite3'

const app = express()

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', './views')

app.get('/', (req, res) => {
    if (req.query.q) {
        const db = new sqlite3.Database('./rarbg_db.sqlite')

        db.serialize(() => {
            let query = `SELECT * FROM (SELECT * FROM items ORDER BY title) WHERE imdb = '${req.query.q}'`
            let items = []

            if (req.query.q.slice(0, 2) != 'tt') {
                query = `SELECT * FROM (SELECT * FROM items ORDER BY title) WHERE title LIKE '%${req.query.q.replace(/ /g, '.').replace(/'/g, '')}%'`
            }

            if (req.query.fhd) {
                query += `AND title LIKE '%1080p%'`
            }

            if (req.query.hevc) {
                query += `AND title LIKE '%265%'`
            }
            
            db.each(query, (_err, row) => {
                items.push([row.hash, row.title, (row.size/1000000000).toFixed(2)])
            }, () => {
                res.render('home', { items: items, form: [req.query.q, req.query.fhd, req.query.hevc] })
            })
        })

        db.close()
    } else {
        res.render('home')
    }
})

app.listen(3000)