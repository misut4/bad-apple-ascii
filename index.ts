// Dependencies
import fs from "fs";
import { main } from "./videoToFrames";
const imgPath =
  "C:\\Users\\sihoa\\Documents\\personal-repo\\bad-apple-ascii\\assets\\bad-apple.jpg";

const videoPath =
  "C:\\Users\\sihoa\\Documents\\personal-repo\\bad-apple-ascii\\assets\\bad-apple.mp4";
const fps = 60;

const img = Buffer.from(fs.readFileSync(imgPath));

main(videoPath, fps);
