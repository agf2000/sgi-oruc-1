exports.config = {
	user: 'sa',
	password: 'sa',
	// server: 'PROG03\\sqlexpress',
	server: '192.168.25.170\\sqlexpress',
	database: 'DECOTEPED',
	port: '1433',
	connectionTimeout: 500000,
	requestTimeout: 500000,
	pool: {
		idleTimeoutMillis: 500000,
		max: 100,
	},
	encrypt: false,
};
