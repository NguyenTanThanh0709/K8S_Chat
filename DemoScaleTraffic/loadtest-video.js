// loadtest-video.js
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoPath = path.join(__dirname, "fake_video.y4m");
const audioPath = path.join(__dirname, "fake_audio.wav");


const BASE_URL = "http://localhost:3000/call?roomId=room033365767320&callerId=0333657673&type=sent&isGroup=1";

async function launchUser(userIndex, receiverId) {
const browser = await puppeteer.launch({
  headless: true,
  args: [
    "--use-fake-device-for-media-stream",
    "--use-fake-ui-for-media-stream",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    `--use-file-for-fake-video-capture=${videoPath}`,
    `--use-file-for-fake-audio-capture=${audioPath}`
  ],
});

  const page = await browser.newPage();
  const url = `${BASE_URL}&receiverId=${receiverId}&fakeUser=${userIndex}`;
  await page.goto(url);
  console.log(`🎥 User ${userIndex} joined call with receiverId ${receiverId}`);
}

(async () => {
  const users = 10; // số client fake cho mỗi receiver
  const receiverIds = [20, 21, 22, 23]; // 4 nhóm khác nhau

  for (const rid of receiverIds) {
    for (let i = 0; i < users; i++) {
      launchUser(i, rid); // không await để mở song song
    }
  }
})();
