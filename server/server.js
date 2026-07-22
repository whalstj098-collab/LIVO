// ====================
// 필요한 라이브러리
// ====================

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

// ====================
// 서버 설정
// ====================

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const PORT = 3000;

const DATA_FILE = "./data.json";

app.use(express.json());
app.use(cors());

// ====================
// JSON 데이터 관리
// ====================

// 데이터 읽기
function readData() {
  const data = fs.readFileSync(DATA_FILE, "utf-8");

  return JSON.parse(data);
}

// 데이터 저장
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
}

// ====================
// 기본 API
// ====================

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

  if (!name || !password) {
    return res.status(400).json({
      message: "이름과 비밀번호를 입력해주세요.",
    });
  }

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

  data.users.push(newUser);

  saveData(data);

  res.status(201).json({
    message: "회원가입 성공",

    user: newUser,
  });
});

// 로그인
app.post("/login", (req, res) => {
  const data = readData();

  const { name, password } = req.body;

  const user = data.users.find(
    (user) => user.name === name && user.password === password,
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "아이디 또는 비밀번호가 틀렸습니다.",
    });
  }

  res.json({
    success: true,
    message: "로그인 성공",
    user: {
      id: user.id,
      name: user.name,
    },
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

  if (!title || !options) {
    return res.status(400).json({
      message: "제목과 선택지가 필요합니다.",
    });
  }

  const newPoll = {
    id: Date.now(),

    title,

    options,

    createdAt: new Date().toISOString(),
  };

  data.polls.push(newPoll);

  saveData(data);

  res.status(201).json({
    message: "투표가 생성되었습니다.",

    poll: newPoll,
  });
});

// 투표 참여
app.post("/polls/:id/vote", (req, res) => {
  const data = readData();

  const pollId = Number(req.params.id);

  const { userName, option } = req.body;

  if (!userName || !option) {
    return res.status(400).json({
      message: "사용자와 선택지가 필요합니다.",
    });
  }

  const poll = data.polls.find((poll) => poll.id === pollId);

  if (!poll) {
    return res.status(404).json({
      message: "존재하지 않는 투표입니다.",
    });
  }

  if (!poll.options.includes(option)) {
    return res.status(400).json({
      message: "잘못된 선택지입니다.",
    });
  }

  const newVote = {
    id: Date.now(),

    pollId,

    userName,

    option,
  };

  data.votes.push(newVote);

  saveData(data);

  // 실시간 전달
  io.emit("voteUpdate", newVote);

  res.status(201).json({
    message: "투표 완료",

    vote: newVote,
  });
});

// 투표 결과 조회
app.get("/polls/:id/result", (req, res) => {
  const data = readData();

  const pollId = Number(req.params.id);

  const poll = data.polls.find((poll) => poll.id === pollId);

  if (!poll) {
    return res.status(404).json({
      message: "존재하지 않는 투표입니다.",
    });
  }

  const result = {};

  poll.options.forEach((option) => {
    result[option] = 0;
  });

  data.votes.forEach((vote) => {
    if (vote.pollId === pollId) {
      result[vote.option]++;
    }
  });

  res.json({
    title: poll.title,

    result,
  });
});

// ====================
// Socket.IO
// ====================

io.on("connection", (socket) => {
  console.log("사용자 접속:", socket.id);

  socket.on("disconnect", () => {
    console.log("사용자 종료:", socket.id);
  });
});

// ====================
// 서버 실행
// ====================

server.listen(PORT, () => {
  console.log(`서버 실행 : http://localhost:${PORT}`);
});
