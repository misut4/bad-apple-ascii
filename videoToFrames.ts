import fs from "fs";
import imageToAscii from "image-to-ascii";
import promptSync from "prompt-sync";
const ffmpeg = require("fluent-ffmpeg");

const charSet =
  "!" +
  "#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
const outputFramesPath = "assets/frames/frame-%09d.png";
let outputFrames: string[] = [];
let totalFrames: number = 0;

// Export frames from video based on input fps
async function extractFrames(inputVideoPath: string, fps: number) {
  new Promise((resolve, reject) => {
    ffmpeg(inputVideoPath)
      .on("end", () => {
        // console.log("Frames extracted successfully!");
      })
      .on("error", (err) => {
        console.error("Error extracting frames:", err.message);
      })
      .outputOptions([
        "-vf",
        `fps=${fps}`, // extract 1 frame per second
      ])
      .output(outputFramesPath)
      .run();
  }).catch((err) => {
    console.error("Error extracting frames:", err.message);
  });
}

// Convert frame to ascii
async function insertFrame(
  frame: Buffer,
  total: number,
  callback: (converted: string) => void
) {
  totalFrames = total;
  imageToAscii(
    frame,
    {
      pixels: charSet,
      size_options: {
        preserve_aspect_ratio: true,
        screen_size: {
          width: 32,
          height: 24, //4:3
        },
      },
      fit_screen: true,
      colored: true,
    },
    async (err, converted) => {
      if (err) {
        console.error("Error converting frame:", err.message);
      }
      if (converted) {
        callback(converted);
      }
    }
  );
}

// Send frames to console based on input fps for smoother animation
function delayFrameToConsole(fps: number) {
  outputFrames.forEach((frame, index) => {
    setTimeout(() => {
      console.clear(); // remove frame stuttering
      console.log(frame);
    }, ((index + 1) * 1000) / fps);
  });
}

function awaitInput(callback: () => void) {
  const prompt = promptSync({ sigint: true });
  const input = prompt("Press [p] to play\nPress [q] to quit");

  switch (input.toString()) {
    case "q":
      process.exit(0);
      break;
    case "p":
      console.clear();
      callback();
      break;
    default:
      break;
  }
}

export async function main(videoPath: string, fps: number) {
  if (!fs.existsSync("assets/frames")) {
    fs.mkdirSync("assets/frames", { recursive: true });
  }

  await extractFrames(videoPath, fps);
  const framePaths = fs.readdirSync("assets/frames");

  for (const framePath of framePaths) {
    const frame = Buffer.from(fs.readFileSync(`assets/frames/${framePath}`));
    await new Promise<void>((resolve) => {
      insertFrame(frame, framePaths.length, (converted) => {
        outputFrames.push(converted);
        console.log(
          "Progress: ",
          Math.round(
            ((framePaths.indexOf(framePath) + 1) / framePaths.length) * 1000
          ) / 10, // show first decimal place
          "%"
        );
        resolve();
      });
    });
  }

  awaitInput(() => {
    delayFrameToConsole(fps);
  });
}
