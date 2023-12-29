module.exports = {
	apps: [
		{
			script: './index.js',
			name: "kaltsit",
			kill_timeout: 5000,
			time: true,
			error_file: './logs/err.log',
			out_file: './logs/out.log',
			log_file: './logs/combined.log',
		}, 
	]
};