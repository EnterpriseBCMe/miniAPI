const http = require("http");
const app = http.createServer();
const fs = require("fs");
const formidable = require("formidable");
const path = require("path");

//mysql连接
const mysql = require('mysql');
const url = require("url");
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'syh',
    password: '114514',
    database: 'test'
});
connection.connect();
const addVideo = 'INSERT INTO videoInfo(sid,user_name,image_path,video_path) VALUES(?,?,?,?)';
//test
//存储路径定义
const targetDir = path.join(__dirname, 'upload');
const picDir = "pictures";
const videoDir = "videos";

//formidable定义
const form = new formidable.IncomingForm();
form.keepExtensions = true;
form.multiples = true;
form.uploadDir = targetDir;
form.encoding = 'UTF-8';
app.on("request", (req, res) => {

    console.log("received request");
    if (req.method === "POST") {
        console.log("received post");
        form.parse(req, function(err, fields, files) {
            if (err)
                throw err;
            var filesUrl = [];
            const picPath = files["picture"].path;
            const vidPath = files["video"].path;
            //获取扩展名
            const picExt = picPath.substring(picPath.lastIndexOf('.'));
            const vidExt = vidPath.substring(vidPath.lastIndexOf('.'));
            //以当前时间戳对上传文件进行重命名
            const picName = new Date().getTime() + picExt;
            const vidName = new Date().getTime() + vidExt;
            //移动临时文件
            const picTargetPath = path.join(targetDir, picDir, picName);
            const vidTargetPath = path.join(targetDir, videoDir, vidName);

            fs.renameSync(picPath, picTargetPath);
            fs.renameSync(vidPath, vidTargetPath);
            // 文件的Url（相对路径）
            filesUrl.push(picTargetPath);
            filesUrl.push(vidTargetPath);

            const urlObj = url.parse(req.url, true);
            const query = urlObj.query;
            console.log(query);
            var addVideoPram = [query.student_id, query.user_name, picName, vidName];



            connection.query(addVideo, addVideoPram, function(err, result) {
                if (err) {
                    console.log('[INSERT ERROR] - ', err.message);
                    return;
                }

                console.log('--------------------------INSERT----------------------------');
                //console.log('INSERT ID:',result.insertId);
                console.log('INSERT ID:', result);
                console.log('-----------------------------------------------------------------\n\n');
            });
            // 返回上传信息
            //res.end(JSON.stringify({filesUrl:filesUrl, success:keys.length-errCount, error:errCount}));
            //console.log(JSON.stringify(filesUrl));
            res.end(JSON.stringify(filesUrl));
        })
    } else {
        const urlObj = url.parse(req.url, true);
        const query = urlObj.query;
        console.log("received get");
        res.end(JSON.stringify(query));
    }
})
app.listen(3000, () => {
    console.log("start listen");
})