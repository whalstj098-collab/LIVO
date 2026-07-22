// Express 서버
const express = require("express");

// HTTP 서버 생성
const http = require("http");

// Socket.IO (실시간 통신)
const { Server } = require("socket.io");

// 파일 입출력
const fs = require("fs");

// ====================
// 서버 기본 설정
// ====================

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// data.json 위치
const DATA_FILE = "./data.json";

// JSON 요청 데이터 사용
app.use(express.json());

// ====================
// JSON 데이터 관리 함수
// ====================

// data.json 읽기
function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

// data.json 저장
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

// ====================
// 기본 API
// ====================

// 서버 확인
app.get("/", (req, res) => {
  res.send("실시간 투표 서버가 실행 중입니다.");
});

// ====================
// 회원 API
// ====================

// 회원가입
app.post("/signup", (req, res) => {
  const data = readData();

  const { name, password } = req.body;

  // 입력값 확인
  if (!name || !password) {
    return res.status(400).json({
      message: "이름과 비밀번호를 입력해주세요.",
    });
  }

  // 이미 가입된 사용자인지 확인
  const existsUser = data.users.find((user) => user.name === name);

  if (existsUser) {
    return res.status(409).json({
      message: "이미 존재하는 사용자입니다.",
    });
  }

  const newUser = {
    id: Date.now(),
    name,
    password,
  };

  // 사용자 추가
  data.users.push(newUser);

  // 파일 저장
  saveData(data);

  res.status(201).json({
    message: "회원가입 성공",
    user: newUser,
  });
});

// ====================
// 투표 API
// ====================

// 투표 목록 조회
app.get("/polls", (req, res) => {
  const data = readData();

  res.json(data.polls);
});

// 투표 생성
app.post("/polls", (req, res) => {
  const data = readData();

  const { title, options } = req.body;

  // 입력값 확인
  if (!title || !options) {
    return res.status(400).json({
      message: "제목과 선택지가 필요합니다.",
    });
  }

  const newPoll = {
    id: Date.now(),
    title: title,
    options: options,
    createdAt: new Date().toISOString(),
  };

  // 투표 추가
  data.polls.push(newPoll);

  // 파일 저장
  saveData(data);

  res.status(201).json({
    message: "투표가 생성되었습니다.",
    poll: newPoll,
  });
});

// ====================
// Socket.IO
// ====================

io.on("connection", (socket) => {
  console.log("사용자 접속 :", socket.id);

  socket.on("disconnect", () => {
    console.log("사용자 종료 :", socket.id);
  });
});

// ====================
// 서버 실행
// ====================

server.listen(PORT, () => {
  console.log(`서버 실행 : http://localhost:${PORT}`);
});
