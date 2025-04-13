module.exports = {
  apps: [
    {
      name: "laf-server",
      cwd: "/home/ec2-user/la_farfalla", // ✅ 프로젝트 경로 지정
      script: "node_modules/next/dist/bin/next",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};

