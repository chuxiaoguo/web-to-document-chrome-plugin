import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createReadStream } from "fs";
import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取package.json
const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf8"));
const currentVersion = packageJson.version;

// 递增版本号
function incrementVersion(version, type = "patch") {
  const parts = version.split(".");
  switch (type.toLowerCase()) {
    case "major":
      parts[0] = parseInt(parts[0]) + 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case "minor":
      parts[1] = parseInt(parts[1]) + 1;
      parts[2] = 0;
      break;
    case "patch":
      parts[2] = parseInt(parts[2]) + 1;
      break;
    default:
      throw new Error(
        "Invalid version type. Must be one of: major, minor, patch"
      );
  }
  return parts.join(".");
}

async function release() {
  try {
    // 1. 提示用户选择版本更新类型
    console.log("当前版本:", currentVersion);
    console.log("请选择要更新的版本类型：");
    console.log("1. major - 主版本号（不兼容的API修改）");
    console.log("2. minor - 次版本号（向下兼容的功能性新增）");
    console.log("3. patch - 修订号（向下兼容的问题修正）");

    const answer = execSync(
      'read -p "请输入选项（1-3），默认为3: " choice && echo $choice',
      { stdio: ["inherit", "pipe", "inherit"] }
    )
      .toString()
      .trim();

    let versionType;
    switch (answer) {
      case "1":
        versionType = "major";
        break;
      case "2":
        versionType = "minor";
        break;
      case "3":
        versionType = "patch";
        break;
      default:
        versionType = "patch";
    }

    const newVersion = incrementVersion(currentVersion, versionType);
    packageJson.version = newVersion;
    fs.writeFileSync("./package.json", JSON.stringify(packageJson, null, 2));

    // 2. 构建项目
    console.log("Building project...");
    execSync("npm run build", { stdio: "inherit" });

    // 3. 创建zip文件
    console.log("Creating zip file...");
    const zipFileName = `web-to-docs-v${newVersion}.zip`;
    const releaseDir = path.join(
      path.dirname(path.dirname(__filename)),
      "release"
    );

    // 确保release目录存在
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }

    // 在release目录下创建zip文件
    execSync(`cd dist && zip -r "${path.join(releaseDir, zipFileName)}" ./*`);

    // 4. 上传到GitHub Release
    const githubToken = process.env.GITHUB_TOKEN;
    if (githubToken) {
      console.log("Uploading to GitHub Release...");
      const octokit = new Octokit({ auth: githubToken });

      // 创建release
      const releaseResponse = await octokit.repos.createRelease({
        owner: "chuxiaoguo",
        repo: "web-to-document-chrome-plugin",
        tag_name: `v${newVersion}`,
        name: `Release v${newVersion}`,
        body: `Release version ${newVersion}`,
        draft: false,
        prerelease: false,
      });

      // 上传zip文件
      const zipFilePath = path.join(releaseDir, zipFileName);
      const zipStats = fs.statSync(zipFilePath);

      await octokit.repos.uploadReleaseAsset({
        owner: "chuxiaoguo",
        repo: "web-to-document-chrome-plugin",
        release_id: releaseResponse.data.id,
        name: zipFileName,
        data: createReadStream(zipFilePath),
        headers: {
          "content-type": "application/zip",
          "content-length": zipStats.size,
        },
      });

      console.log(
        `Successfully created release v${newVersion} and uploaded ${zipFileName}`
      );
    } else {
      console.log(
        "GITHUB_TOKEN not found in .env file. Please add your GitHub token to continue."
      );
      console.log(`Zip file created: ${zipFileName}`);
    }
  } catch (error) {
    console.error("Release failed:", error);
    process.exit(1);
  }
}

release();
