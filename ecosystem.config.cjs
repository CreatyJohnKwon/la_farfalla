module.exports = {
    apps: [
        {
            name: "laf-server",
            cwd: "/home/ec2-user/la_farfalla",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
