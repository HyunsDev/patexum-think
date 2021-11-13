module.exports = {
    apps: [{
        name: 'patexum_web',
        script: './bin/www',
        instances: 0,
        exec_mode: 'cluster'
        },{
        name: 'patexum_crawler',
        script: './crawler.js',
        },
    ]
}