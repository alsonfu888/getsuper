const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const port = 3500;

// 启用CORS
app.use(cors());

// 创建上传目录（如果不存在）
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name;
    const extension = path.extname(file.originalname);
    const timestamp = Date.now();
    const newFilename = `${originalName}_${timestamp}${extension}`;
    cb(null, newFilename);
  },
});

// 文件类型过滤器
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/zip", "application/x-zip-compressed"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传ZIP文件"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 800 * 1024 * 1024,
  },
});

// 处理根路径请求
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "欢迎访问文件上传服务",
    endpoints: {
      upload: `/upload`, // 添加上传端点示例
      files: `/files`, // 添加文件列表端点示例
    },
    uploadDirectory: uploadDir,
  });
});

// 文件上传路由
app.post("/api/upload", upload.single("file"), (req, res) => {
  // 输出日志 - 上传来源
  console.log(`文件上传请求来自: ${req.ip} - ${req.headers["user-agent"]}`);
  if (!req.file) {
    return res.status(400).json({ error: "失败" });
  }

  res.status(200).json({
    message: "成功",
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: err.message });
  }
  next();
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
  console.log(`文件上传目录: ${uploadDir}`);
});
