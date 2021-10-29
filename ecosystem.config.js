module.exports = {
    apps: [
        {
            name: "server",
            cwd: './server',
            script: "app.js"
        },
        {
            name: "client",
            cwd: './client',
            script: 'npm start'
        }
    ]
}