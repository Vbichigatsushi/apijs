import pg from 'pg';
const {Pool} = pg

export default new Pool({
	user: 'admin',
	host: 'db',
	database: 'myapp',
	password: 'admin',
	port: 5432
})