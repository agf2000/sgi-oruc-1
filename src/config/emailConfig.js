const { SMTPClient } = require('emailjs');
const emailServer = new SMTPClient({
	user: 'softek.financeiro@gmail.com',
	password: 'sftk4885',
	host: 'smtp.gmail.com',
	ssl: true,
});

module.exports = emailServer;
